'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import Konva from 'konva';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { PREFECTURES, getCitiesByPrefecture, getCityById, getOazasByCity, type City, type Oaza, type ZoningDistrict } from '@/lib/zoningData';
import { FLOOR_PLANS, getFloorPlanById, type FloorPlan } from '@/lib/floorPlanData';
import { getCustomFloorPlans, saveCustomFloorPlan, deleteCustomFloorPlan, imageToBase64 } from '@/lib/customFloorPlans';

// SitePlanCanvasを動的インポートして、SSRをスキップ
const SitePlanCanvas = dynamicImport(() => import('@/components/SitePlanCanvas'), {
  ssr: false,
});

// PDF.js workerの設定（CDNから読み込み）
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// このページを強制的に動的にレンダリング
export const dynamic = 'force-dynamic';

// 定数
const SCALE_1_100 = 100; // 1/100縮尺
const PDF_RENDER_SCALE = 2; // PDFレンダリング時の拡大率
const PDF_DPI = 150; // PDFスキャン解像度（一般的な値）
const MM_PER_INCH = 25.4; // 1インチ = 25.4mm
const KEN_TO_MM = 1818; // 1間 = 1818mm
const TSUBO_TO_MM2 = 3305785; // 1坪 = 3.30579㎡ = 3305785mm²
const CIVIL_LAW_DISTANCE = 500; // 民法上の離れ 500mm

// 駐車場サイズ定義（車両サイズ）
const PARKING_SIZES = {
  kei: { width: 1480, length: 3400, label: '軽自動車', imageOrientation: 'vertical' as const },
  normal: { width: 1800, length: 4700, label: '普通車', imageOrientation: 'horizontal' as const },
  suv: { width: 1900, length: 4900, label: 'SUV', imageOrientation: 'horizontal' as const },
  minivan: { width: 1900, length: 5000, label: '大型ミニバン', imageOrientation: 'horizontal' as const },
};

// 型定義
type ParkingType = 'kei' | 'normal' | 'suv' | 'minivan';

interface Building {
  id: string;
  x: number;
  y: number;
  widthKen: number;
  depthKen: number;
  widthMm: number;
  depthMm: number;
  tsubo: number;
  rotation: number; // 0, 90, 180, 270
  imagePath?: string; // 間取り画像のパス
}

interface Parking {
  id: string;
  x: number;
  y: number;
  type: ParkingType;
  widthMm: number;
  lengthMm: number;
  rotation: number; // 0, 90, 180, 270
}

interface SiteBoundary {
  points: number[]; // [x1, y1, x2, y2, x3, y3, ...]の配列
}

export default function SitePlanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // State
  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  const [siteBoundary, setSiteBoundary] = useState<SiteBoundary | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // スケールキャリブレーション用
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationPoints, setCalibrationPoints] = useState<{x: number, y: number}[]>([]);
  const [pixelToMmRatio, setPixelToMmRatio] = useState<number | null>(null);
  const [showDistanceInput, setShowDistanceInput] = useState<boolean>(false);
  const [inputDistance, setInputDistance] = useState<string>('10000');

  // 入力フォーム用
  const [widthKen, setWidthKen] = useState<number>(5);
  const [depthKen, setDepthKen] = useState<number>(5);
  const [parkingType, setParkingType] = useState<ParkingType>('normal');

  // 用途地域検索用
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedOazaId, setSelectedOazaId] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [availableOazas, setAvailableOazas] = useState<Oaza[]>([]);
  const [selectedOaza, setSelectedOaza] = useState<Oaza | null>(null);
  const [addressInput, setAddressInput] = useState<string>('');

  // 建物編集用
  const [editWidthKen, setEditWidthKen] = useState<number>(5);
  const [editDepthKen, setEditDepthKen] = useState<number>(5);

  // 間取りプラン用
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState<string>('');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null);
  const [customFloorPlans, setCustomFloorPlans] = useState<FloorPlan[]>([]);
  const [allFloorPlans, setAllFloorPlans] = useState<FloorPlan[]>(FLOOR_PLANS);

  // カスタムプラン追加フォーム
  const [showAddPlanForm, setShowAddPlanForm] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>('');
  const [newPlanDescription, setNewPlanDescription] = useState<string>('');
  const [newPlanWidthKen, setNewPlanWidthKen] = useState<number>(5);
  const [newPlanDepthKen, setNewPlanDepthKen] = useState<number>(5);
  const [newPlanCategory, setNewPlanCategory] = useState<'2LDK' | '3LDK' | '4LDK' | 'その他'>('3LDK');
  const [newPlanFloors, setNewPlanFloors] = useState<number>(2);
  const [newPlanImage, setNewPlanImage] = useState<File | null>(null);
  const [newPlanImagePreview, setNewPlanImagePreview] = useState<string>('');

  // Canvas設定
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // サイドバー表示制御
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // アンドゥ・リドゥ用の履歴管理
  interface HistoryState {
    buildings: Building[];
    parkings: Parking[];
    siteBoundary: SiteBoundary | null;
  }
  const MAX_HISTORY = 50; // 最大履歴数
  const [history, setHistory] = useState<HistoryState[]>([
    { buildings: [], parkings: [], siteBoundary: null }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState<boolean>(false); // アンドゥ・リドゥ実行中フラグ

  // mmをピクセルに変換
  const mmToPixel = (mm: number): number => {
    if (pixelToMmRatio !== null) {
      // キャリブレーション済みの場合、実測値を使用
      return mm * pixelToMmRatio;
    }

    // デフォルト：1/100縮尺を考慮し、DPI換算
    const mmOnPaper = mm / SCALE_1_100;
    const pixelsAt1x = mmOnPaper * (PDF_DPI / MM_PER_INCH);
    return pixelsAt1x * PDF_RENDER_SCALE;
  };

  // 坪数を計算
  const calculateTsubo = (widthMm: number, depthMm: number): number => {
    const areaMm2 = widthMm * depthMm;
    return Math.round((areaMm2 / TSUBO_TO_MM2) * 10) / 10;
  };

  // 多角形の重心を計算
  const getPolygonCenter = (points: number[]): { x: number; y: number } => {
    let sumX = 0;
    let sumY = 0;
    const numPoints = points.length / 2;

    for (let i = 0; i < points.length; i += 2) {
      sumX += points[i];
      sumY += points[i + 1];
    }

    return {
      x: sumX / numPoints,
      y: sumY / numPoints
    };
  };

  // 多角形の面積を計算（Shoelace formula）
  const calculatePolygonArea = (points: number[]): number => {
    let area = 0;
    const n = points.length / 2;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const x1 = points[i * 2];
      const y1 = points[i * 2 + 1];
      const x2 = points[j * 2];
      const y2 = points[j * 2 + 1];
      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area / 2);
  };

  // ピクセル面積を実面積（m²）に変換
  const pixelAreaToM2 = (pixelArea: number): number => {
    if (pixelToMmRatio !== null) {
      // キャリブレーション済みの場合
      const mmPerPixel = 1 / pixelToMmRatio;
      const areaMm2 = pixelArea * mmPerPixel * mmPerPixel;
      return areaMm2 / 1000000; // mm² → m²
    }

    // デフォルト：1/100縮尺
    const mmPerPixel = (SCALE_1_100 * MM_PER_INCH) / PDF_DPI / PDF_RENDER_SCALE;
    const areaMm2 = pixelArea * mmPerPixel * mmPerPixel;
    return areaMm2 / 1000000; // mm² → m²
  };

  // 建蔽率・容積率を計算
  const calculateCoverageRatio = (): {
    siteArea: number;
    buildingArea: number;
    totalFloorArea: number;
    coverageRatio: number;
    floorAreaRatio: number;
    isValidCoverage: boolean;
    isValidFloorArea: boolean;
  } | null => {
    if (!siteBoundary || buildings.length === 0) {
      return null;
    }

    // 敷地面積（ピクセル）
    const siteAreaPixel = calculatePolygonArea(siteBoundary.points);
    const siteArea = pixelAreaToM2(siteAreaPixel);

    // 建築面積（すべての建物の1階面積の合計）
    const buildingAreaMm2 = buildings.reduce((sum, building) => {
      return sum + (building.widthMm * building.depthMm);
    }, 0);
    const buildingArea = buildingAreaMm2 / 1000000; // mm² → m²

    // 延床面積（各建物の面積 × 2階建て）
    const totalFloorArea = buildingArea * 2;

    // 建蔽率（%）
    const coverageRatio = (buildingArea / siteArea) * 100;

    // 容積率（%）
    const floorAreaRatio = (totalFloorArea / siteArea) * 100;

    // 用途地域の制限値と比較
    const maxCoverage = selectedOaza?.zoningDistrict.buildingCoverageRatio || 100;
    const maxFloorArea = selectedOaza?.zoningDistrict.floorAreaRatio || 100;

    return {
      siteArea,
      buildingArea,
      totalFloorArea,
      coverageRatio,
      floorAreaRatio,
      isValidCoverage: coverageRatio <= maxCoverage,
      isValidFloorArea: floorAreaRatio <= maxFloorArea,
    };
  };

  // 敷地図アップロード処理（PDF/画像対応）
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;

    // 画像ファイルの場合
    if (fileType.startsWith('image/')) {
      try {
        console.log('画像ファイルの読み込みを開始...');
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            console.log('画像読み込み完了:', img.width, 'x', img.height);
            setPdfImage(img);
            setStageSize({ width: img.width, height: img.height });
            alert('敷地図の読み込みが完了しました');
          };
          img.onerror = () => {
            console.error('画像読み込みエラー');
            alert('画像の読み込みに失敗しました');
          };
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('画像読み込みエラー:', error);
        alert(`画像の読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
      }
      return;
    }

    // PDFファイルの場合
    if (fileType === 'application/pdf') {
      try {
        console.log('PDFファイルの読み込みを開始...');
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer取得完了:', arrayBuffer.byteLength, 'bytes');

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log('PDF読み込み完了:', pdf.numPages, 'ページ');

        const page = await pdf.getPage(1);
        console.log('1ページ目取得完了');

        const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
        console.log('Viewport:', viewport.width, 'x', viewport.height);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          alert('Canvasのコンテキストを取得できませんでした');
          return;
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        console.log('レンダリング完了');

        const img = new window.Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
          console.log('画像読み込み完了:', img.width, 'x', img.height);
          setPdfImage(img);
          setStageSize({ width: img.width, height: img.height });
          alert('PDFの読み込みが完了しました');
        };
        img.onerror = () => {
          console.error('画像変換エラー');
          alert('PDFを画像に変換できませんでした');
        };
      } catch (error) {
        console.error('PDF読み込みエラー:', error);
        alert(`PDFの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
      }
      return;
    }

    // サポートされていないファイル形式
    alert('PDF、PNG、またはJPEGファイルを選択してください');
  };

  // 敷地境界を設定
  const handleSetBoundary = () => {
    if (!pdfImage) {
      alert('先にPDFをアップロードしてください');
      return;
    }

    // デフォルトで矩形の頂点を設定（時計回り）
    const x = stageSize.width * 0.1;
    const y = stageSize.height * 0.1;
    const width = stageSize.width * 0.8;
    const height = stageSize.height * 0.8;

    setSiteBoundary({
      points: [
        x, y,                    // 左上
        x + width, y,            // 右上
        x + width, y + height,   // 右下
        x, y + height            // 左下
      ]
    });
  };

  // 建物を追加
  const handleAddBuilding = () => {
    if (!siteBoundary) {
      alert('先に敷地境界を設定してください');
      return;
    }

    const widthMm = widthKen * KEN_TO_MM;
    const depthMm = depthKen * KEN_TO_MM;
    const tsubo = calculateTsubo(widthMm, depthMm);

    // 多角形の重心に配置
    const center = getPolygonCenter(siteBoundary.points);

    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      x: center.x - mmToPixel(widthMm) / 2,
      y: center.y - mmToPixel(depthMm) / 2,
      widthKen,
      depthKen,
      widthMm,
      depthMm,
      tsubo,
      rotation: 0,
    };

    console.log('新しい建物を追加:', newBuilding);
    console.log('建物のピクセルサイズ:', mmToPixel(widthMm), 'x', mmToPixel(depthMm));
    setBuildings([...buildings, newBuilding]);
  };

  // 駐車場を追加
  const handleAddParking = () => {
    if (!siteBoundary) {
      alert('先に敷地境界を設定してください');
      return;
    }

    // 多角形の重心に配置
    const center = getPolygonCenter(siteBoundary.points);
    const size = PARKING_SIZES[parkingType];

    const newParking: Parking = {
      id: `parking-${Date.now()}`,
      x: center.x,
      y: center.y,
      type: parkingType,
      widthMm: size.width,
      lengthMm: size.length,
      rotation: 0,
    };

    setParkings([...parkings, newParking]);
  };

  // 間取りプランから建物を追加
  const handleAddBuildingFromFloorPlan = () => {
    console.log('[DEBUG] handleAddBuildingFromFloorPlan called');
    console.log('[DEBUG] siteBoundary:', siteBoundary);
    console.log('[DEBUG] selectedFloorPlan:', selectedFloorPlan);

    if (!siteBoundary) {
      alert('先に敷地境界を設定してください');
      return;
    }

    if (!selectedFloorPlan) {
      alert('間取りプランを選択してください');
      return;
    }

    const widthMm = selectedFloorPlan.widthMm;
    const depthMm = selectedFloorPlan.depthMm;
    const tsubo = selectedFloorPlan.tsubo;

    // 多角形の重心に配置
    const center = getPolygonCenter(siteBoundary.points);
    console.log('[DEBUG] center:', center);

    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      x: center.x - mmToPixel(widthMm) / 2,
      y: center.y - mmToPixel(depthMm) / 2,
      widthKen: selectedFloorPlan.widthKen,
      depthKen: selectedFloorPlan.depthKen,
      widthMm,
      depthMm,
      tsubo,
      rotation: 0,
      imagePath: selectedFloorPlan.imagePath, // 間取り画像のパスを保存
    };

    console.log('間取りプランから建物を追加:', newBuilding);
    console.log('[DEBUG] current buildings:', buildings);
    const updatedBuildings = [...buildings, newBuilding];
    console.log('[DEBUG] updated buildings:', updatedBuildings);
    setBuildings(updatedBuildings);
  };

  // 選択された建物が変わったら、編集フォームを更新
  useEffect(() => {
    if (selectedId && selectedId.startsWith('building-')) {
      const building = buildings.find(b => b.id === selectedId);
      if (building) {
        setEditWidthKen(building.widthKen);
        setEditDepthKen(building.depthKen);
      }
    }
  }, [selectedId, buildings]);

  // 都道府県が選択されたら市区町村リストを更新
  useEffect(() => {
    if (selectedPrefecture) {
      const cities = getCitiesByPrefecture(selectedPrefecture);
      console.log('[ZONING] Selected prefecture:', selectedPrefecture, 'Cities:', cities);
      setAvailableCities(cities);
      setSelectedCityId('');
      setSelectedOazaId('');
      setAvailableOazas([]);
      setSelectedOaza(null);
    } else {
      setAvailableCities([]);
      setSelectedCityId('');
      setSelectedOazaId('');
      setAvailableOazas([]);
      setSelectedOaza(null);
    }
  }, [selectedPrefecture]);

  // 市区町村が選択されたら大字リストを更新
  useEffect(() => {
    if (selectedCityId) {
      console.log('[ZONING] Selected city ID:', selectedCityId);
      const oazas = getOazasByCity(selectedCityId);
      console.log('[ZONING] Found oazas:', oazas);
      setAvailableOazas(oazas);
      setSelectedOazaId('');
      setSelectedOaza(null);
    } else {
      setAvailableOazas([]);
      setSelectedOazaId('');
      setSelectedOaza(null);
    }
  }, [selectedCityId]);

  // 大字が選択されたら詳細情報を表示
  useEffect(() => {
    if (selectedOazaId && selectedCityId) {
      console.log('[ZONING] Selected oaza ID:', selectedOazaId);
      const oaza = availableOazas.find(o => o.id === selectedOazaId);
      console.log('[ZONING] Found oaza:', oaza);
      setSelectedOaza(oaza || null);
    } else {
      setSelectedOaza(null);
    }
  }, [selectedOazaId, selectedCityId, availableOazas]);

  // 間取りプランが選択されたら詳細情報を表示
  useEffect(() => {
    if (selectedFloorPlanId) {
      console.log('[FLOOR_PLAN] Selected floor plan ID:', selectedFloorPlanId);
      const plan = allFloorPlans.find(p => p.id === selectedFloorPlanId);
      console.log('[FLOOR_PLAN] Found floor plan:', plan);
      setSelectedFloorPlan(plan || null);
    } else {
      setSelectedFloorPlan(null);
    }
  }, [selectedFloorPlanId, allFloorPlans]);

  // コンポーネントマウント時にカスタムプランを読み込み
  useEffect(() => {
    const loadCustomPlans = () => {
      const customPlans = getCustomFloorPlans();
      setCustomFloorPlans(customPlans);
      setAllFloorPlans([...FLOOR_PLANS, ...customPlans]);
    };
    loadCustomPlans();
  }, []);

  // buildingsの状態変化を監視
  useEffect(() => {
    console.log('[DEBUG] buildings updated:', buildings);
    console.log('[DEBUG] buildings count:', buildings.length);
  }, [buildings]);

  // 履歴を保存
  const saveHistory = () => {
    if (isUndoRedoAction) return; // アンドゥ・リドゥ実行中は履歴を保存しない

    const newState: HistoryState = {
      buildings: JSON.parse(JSON.stringify(buildings)),
      parkings: JSON.parse(JSON.stringify(parkings)),
      siteBoundary: siteBoundary ? JSON.parse(JSON.stringify(siteBoundary)) : null,
    };

    // 現在のインデックスより後の履歴を削除し、新しい履歴を追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);

    // 最大履歴数を超える場合は古い履歴を削除
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }

    setHistory(newHistory);
  };

  // buildings, parkings, siteBoundary の変更を監視して履歴に保存
  useEffect(() => {
    if (!isUndoRedoAction) {
      saveHistory();
    }
  }, [buildings, parkings, siteBoundary]);

  // アンドゥ
  const handleUndo = () => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true);
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];

      setBuildings(prevState.buildings);
      setParkings(prevState.parkings);
      setSiteBoundary(prevState.siteBoundary);
      setHistoryIndex(prevIndex);

      // 次のレンダリング後にフラグをリセット
      setTimeout(() => setIsUndoRedoAction(false), 0);
    }
  };

  // リドゥ
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];

      setBuildings(nextState.buildings);
      setParkings(nextState.parkings);
      setSiteBoundary(nextState.siteBoundary);
      setHistoryIndex(nextIndex);

      // 次のレンダリング後にフラグをリセット
      setTimeout(() => setIsUndoRedoAction(false), 0);
    }
  };

  // キーボードショートカット（Ctrl+Z / Ctrl+Y）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Mac: Cmd+Z / Cmd+Shift+Z, Windows/Linux: Ctrl+Z / Ctrl+Y
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      } else if (
        (isCtrlOrCmd && event.key === 'y') || // Windows/Linux: Ctrl+Y
        (isMac && event.metaKey && event.shiftKey && event.key === 'z') // Mac: Cmd+Shift+Z
      ) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyIndex, history]);

  // 住所から都道府県・市区町村・大字を検索
  const handleAddressSearch = () => {
    if (!addressInput.trim()) {
      alert('住所を入力してください');
      return;
    }

    // 都道府県を検索
    const prefecture = PREFECTURES.find(pref => addressInput.includes(pref));

    if (!prefecture) {
      alert('都道府県が見つかりませんでした。\n例: 東京都渋谷区道玄坂、神奈川県横浜市中区山下町');
      return;
    }

    setSelectedPrefecture(prefecture);

    // 市区町村を検索
    const cities = getCitiesByPrefecture(prefecture);
    const foundCity = cities.find(city => addressInput.includes(city.name));

    if (foundCity) {
      setSelectedCityId(foundCity.id);

      // 大字を検索
      const oazas = getOazasByCity(foundCity.id);
      const foundOaza = oazas.find(oaza => addressInput.includes(oaza.name));

      if (foundOaza) {
        setSelectedOazaId(foundOaza.id);
        setSelectedOaza(foundOaza);
      } else {
        // 大字が見つからない場合は市区町村まで設定
        alert(`${foundCity.name}の大字が見つかりませんでした。\n登録されている大字: ${oazas.map(o => o.name).join('、')}`);
      }
    } else {
      alert(`${prefecture}の市区町村が見つかりませんでした。\n登録されている市区町村: ${cities.map(c => c.name).join('、')}`);
    }
  };

  // 駐車場を回転（90度ずつ、360度で0に戻る）
  const handleRotateParking = (parkingId?: string) => {
    const targetId = parkingId || selectedId;
    if (!targetId || !targetId.startsWith('parking-')) return;

    const updatedParkings = parkings.map((p) =>
      p.id === targetId
        ? { ...p, rotation: (p.rotation + 90) % 360 }
        : p
    );
    setParkings(updatedParkings);
  };

  // 建物を回転（90度ずつ、360度で0に戻る）
  const handleRotateBuilding = (buildingId?: string) => {
    const targetId = buildingId || selectedId;
    if (!targetId || !targetId.startsWith('building-')) return;

    const updatedBuildings = buildings.map((b) =>
      b.id === targetId
        ? { ...b, rotation: (b.rotation + 90) % 360 }
        : b
    );
    setBuildings(updatedBuildings);
  };

  // 建物のサイズを変更
  const handleUpdateBuilding = () => {
    if (!selectedId || !selectedId.startsWith('building-')) return;

    const widthMm = editWidthKen * KEN_TO_MM;
    const depthMm = editDepthKen * KEN_TO_MM;
    const tsubo = calculateTsubo(widthMm, depthMm);

    const updatedBuildings = buildings.map((b) =>
      b.id === selectedId
        ? {
            ...b,
            widthKen: editWidthKen,
            depthKen: editDepthKen,
            widthMm,
            depthMm,
            tsubo,
          }
        : b
    );
    setBuildings(updatedBuildings);
  };

  // 選択されたオブジェクトを削除
  const handleDelete = () => {
    if (!selectedId) return;

    if (selectedId.startsWith('building-')) {
      setBuildings(buildings.filter(b => b.id !== selectedId));
    } else if (selectedId.startsWith('parking-')) {
      setParkings(parkings.filter(p => p.id !== selectedId));
    }
    setSelectedId(null);
  };

  // 点と線分の最短距離を計算
  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 民法上の離れをチェック（多角形対応）
  const checkCivilLawDistance = (objX: number, objY: number, objWidth: number, objHeight: number): boolean => {
    if (!siteBoundary) return true;

    // 民法上の離れ距離（ピクセル換算）
    const minDistancePixel = mmToPixel(CIVIL_LAW_DISTANCE);

    // 建物の4つの角の座標
    const corners = [
      { x: objX, y: objY },                           // 左上
      { x: objX + objWidth, y: objY },                // 右上
      { x: objX + objWidth, y: objY + objHeight },    // 右下
      { x: objX, y: objY + objHeight }                // 左下
    ];

    // 各角が敷地境界の全ての辺から十分離れているかチェック
    for (const corner of corners) {
      for (let i = 0; i < siteBoundary.points.length; i += 2) {
        const x1 = siteBoundary.points[i];
        const y1 = siteBoundary.points[i + 1];
        const x2 = siteBoundary.points[(i + 2) % siteBoundary.points.length];
        const y2 = siteBoundary.points[(i + 3) % siteBoundary.points.length];

        const distance = pointToLineDistance(corner.x, corner.y, x1, y1, x2, y2);

        // いずれかの角が境界線から500mm未満の場合はNG
        if (distance < minDistancePixel) {
          return false;
        }
      }
    }

    return true;
  };

  // スケールキャリブレーション開始
  const handleStartCalibration = () => {
    setIsCalibrating(true);
    setCalibrationPoints([]);
    setShowDistanceInput(false);
  };

  // 2点目クリック時に呼ばれる
  const handleCalibrationPointsReady = () => {
    setShowDistanceInput(true);
  };

  // 距離入力確定
  const handleConfirmDistance = () => {
    const distanceMm = parseFloat(inputDistance);
    if (isNaN(distanceMm) || distanceMm <= 0) {
      alert('正しい数値を入力してください');
      return;
    }

    // 2点間のピクセル距離を計算
    const dx = calibrationPoints[1].x - calibrationPoints[0].x;
    const dy = calibrationPoints[1].y - calibrationPoints[0].y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);

    // ピクセル/mm比率を計算（実物のmm → ピクセル）
    const ratio = pixelDistance / distanceMm;
    setPixelToMmRatio(ratio);

    setIsCalibrating(false);
    setCalibrationPoints([]);
    setShowDistanceInput(false);
    alert(`スケール設定完了！\n${distanceMm}mm = ${pixelDistance.toFixed(2)}ピクセル\n比率: ${ratio.toFixed(6)} px/mm`);
  };

  // キャンセル
  const handleCancelCalibration = () => {
    setIsCalibrating(false);
    setCalibrationPoints([]);
    setShowDistanceInput(false);
  };

  // 敷地図とデータをクリア
  const handleClearSitePlan = () => {
    if (!confirm('敷地図とすべてのデータを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setPdfImage(null);
    setSiteBoundary(null);
    setBuildings([]);
    setParkings([]);
    setSelectedId(null);
    setPixelToMmRatio(null);
    setIsCalibrating(false);
    setCalibrationPoints([]);
    setShowDistanceInput(false);
    setStageSize({ width: 800, height: 600 });

    alert('敷地図とデータを削除しました');
  };

  // PDFをエクスポート
  const handleExportPDF = () => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const img = new Image();
    img.src = uri;
    img.onload = () => {
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });

      pdf.addImage(uri, 'PNG', 0, 0, img.width, img.height);
      pdf.save('site-plan.pdf');
    };
  };

  // データを保存
  const handleSaveData = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      siteBoundary,
      buildings,
      parkings,
      pixelToMmRatio,
      stageSize,
      pdfImageSrc: pdfImage?.src || null, // 敷地図の画像データを保存
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `site-plan-data-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // データを読み込み
  const handleLoadData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // データの検証
      if (!data.version || !data.siteBoundary) {
        alert('無効なデータファイルです');
        return;
      }

      // 状態を復元
      setSiteBoundary(data.siteBoundary);
      setBuildings(data.buildings || []);
      setParkings(data.parkings || []);
      setPixelToMmRatio(data.pixelToMmRatio || null);
      setStageSize(data.stageSize || { width: 800, height: 600 });

      // 敷地図の画像データを復元
      if (data.pdfImageSrc) {
        const img = new window.Image();
        img.src = data.pdfImageSrc;
        img.onload = () => {
          setPdfImage(img);
          alert('データと敷地図を読み込みました。');
        };
        img.onerror = () => {
          alert('データを読み込みましたが、敷地図の復元に失敗しました。');
        };
      } else {
        alert('データを読み込みました。敷地図をアップロードしてください。');
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      alert('データの読み込みに失敗しました');
    }

    // ファイル入力をリセット
    if (event.target) {
      event.target.value = '';
    }
  };

  // 画像ファイル選択時のプレビュー
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    setNewPlanImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewPlanImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // カスタムプランを追加
  const handleAddCustomPlan = async () => {
    // バリデーション
    if (!newPlanName.trim()) {
      alert('プラン名を入力してください');
      return;
    }

    if (newPlanWidthKen <= 0 || newPlanDepthKen <= 0) {
      alert('間口と奥行は0より大きい値を入力してください');
      return;
    }

    if (!newPlanImage) {
      alert('間取り画像を選択してください');
      return;
    }

    try {
      // 画像をBase64に変換
      const imageBase64 = await imageToBase64(newPlanImage);

      // 新しいプランを作成
      const widthMm = newPlanWidthKen * KEN_TO_MM;
      const depthMm = newPlanDepthKen * KEN_TO_MM;
      const tsubo = calculateTsubo(widthMm, depthMm) * newPlanFloors;

      const newPlan: FloorPlan = {
        id: `custom-${Date.now()}`,
        name: newPlanName,
        description: newPlanDescription,
        widthKen: newPlanWidthKen,
        depthKen: newPlanDepthKen,
        widthMm,
        depthMm,
        tsubo,
        category: newPlanCategory,
        imagePath: imageBase64,
        floors: newPlanFloors,
      };

      // localStorageに保存
      saveCustomFloorPlan(newPlan);

      // 状態を更新
      const updatedCustomPlans = [...customFloorPlans, newPlan];
      setCustomFloorPlans(updatedCustomPlans);
      setAllFloorPlans([...FLOOR_PLANS, ...updatedCustomPlans]);

      // フォームをリセット
      setShowAddPlanForm(false);
      setNewPlanName('');
      setNewPlanDescription('');
      setNewPlanWidthKen(5);
      setNewPlanDepthKen(5);
      setNewPlanCategory('3LDK');
      setNewPlanFloors(2);
      setNewPlanImage(null);
      setNewPlanImagePreview('');

      alert('カスタムプランを追加しました');
    } catch (error) {
      console.error('カスタムプラン追加エラー:', error);
      alert('カスタムプランの追加に失敗しました');
    }
  };

  // カスタムプランを削除
  const handleDeleteCustomPlan = (planId: string) => {
    if (!confirm('このカスタムプランを削除しますか？')) {
      return;
    }

    try {
      deleteCustomFloorPlan(planId);

      // 状態を更新
      const updatedCustomPlans = customFloorPlans.filter(p => p.id !== planId);
      setCustomFloorPlans(updatedCustomPlans);
      setAllFloorPlans([...FLOOR_PLANS, ...updatedCustomPlans]);

      // 選択中のプランだった場合はクリア
      if (selectedFloorPlanId === planId) {
        setSelectedFloorPlanId('');
        setSelectedFloorPlan(null);
      }

      alert('カスタムプランを削除しました');
    } catch (error) {
      console.error('カスタムプラン削除エラー:', error);
      alert('カスタムプランの削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-bg-light">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-line-separator">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/dandori-logo.png"
                alt="DandoriFinder Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-text-primary">
                  DandoriFinder
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* アンドゥ・リドゥボタン */}
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title="元に戻す (Ctrl+Z / Cmd+Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                元に戻す
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title="やり直す (Ctrl+Y / Cmd+Shift+Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
                やり直す
              </button>
              <button
                onClick={handleClearSitePlan}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                削除
              </button>
              <input
                ref={dataInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleLoadData}
                className="hidden"
              />
              <button
                onClick={() => dataInputRef.current?.click()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                データ読込
              </button>
              <button
                onClick={handleSaveData}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                disabled={!siteBoundary}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                データ保存
              </button>
              <button
                onClick={handleExportPDF}
                className="bg-dw-blue hover:bg-dw-blue-hover text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                disabled={!pdfImage}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF出力
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* サイドバーとメインコンテンツ */}
      <div className="flex">
        {/* 左サイドバー */}
        <aside className="w-64 bg-white border-r border-line-separator min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/search')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  プラン検索
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/site-plan')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-dw-blue text-white rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  敷地計画
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 左サイドバー - コントロール */}
          {isSidebarOpen && (
          <div className="col-span-3 space-y-4">
            {/* 用途地域検索 */}
            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                0. 用途地域検索
              </h2>
              <div className="space-y-3">
                {/* 住所入力 */}
                <div>
                  <label className="block text-sm font-medium mb-1">住所で検索</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                      placeholder="例: 東京都渋谷区道玄坂"
                      className="flex-1 px-3 py-2 border border-line-separator rounded-lg text-sm"
                    />
                    <button
                      onClick={handleAddressSearch}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover text-sm whitespace-nowrap"
                    >
                      検索
                    </button>
                  </div>
                  <p className="text-xs text-text-sub mt-1">
                    住所を入力すると自動的に用途地域を表示します
                  </p>
                </div>

                <div className="border-t border-line-separator pt-3 mt-3">
                  <p className="text-xs text-text-sub mb-2">または手動で選択：</p>

                  {/* 都道府県選択 */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium mb-1">都道府県</label>
                    <select
                      value={selectedPrefecture}
                      onChange={(e) => setSelectedPrefecture(e.target.value)}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg text-sm"
                    >
                      <option value="">選択してください</option>
                      {PREFECTURES.map((pref) => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                  </div>

                  {/* 市区町村選択 */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium mb-1">市区町村</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg text-sm"
                      disabled={!selectedPrefecture}
                    >
                      <option value="">選択してください</option>
                      {availableCities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 大字選択 */}
                  <div>
                    <label className="block text-xs font-medium mb-1">大字</label>
                    <select
                      value={selectedOazaId}
                      onChange={(e) => setSelectedOazaId(e.target.value)}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg text-sm"
                      disabled={!selectedCityId}
                    >
                      <option value="">選択してください</option>
                      {availableOazas.map((oaza) => (
                        <option key={oaza.id} value={oaza.id}>{oaza.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 用途地域情報表示 */}
                {selectedOaza && (
                  <div className="mt-4 p-3 bg-bg-soft rounded-lg">
                    <p className="font-medium mb-2 text-sm">{selectedOaza.name}の用途地域</p>
                    <div className="p-2 bg-white rounded border border-line-separator text-xs">
                      <p className="font-bold text-accent-primary">{selectedOaza.zoningDistrict.name}</p>
                      <div className="mt-1 space-y-0.5 text-text-sub">
                        <p>建蔽率: {selectedOaza.zoningDistrict.buildingCoverageRatio}%</p>
                        <p>容積率: {selectedOaza.zoningDistrict.floorAreaRatio}%</p>
                        {selectedOaza.zoningDistrict.heightLimit && <p>高さ制限: {selectedOaza.zoningDistrict.heightLimit}m</p>}
                        <p className="text-xs text-text-sub mt-1">{selectedOaza.zoningDistrict.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 敷地図アップロード */}
            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                1. 敷地図アップロード
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                敷地図をアップロード
              </button>
              <p className="text-xs text-text-sub mt-2">PDF、PNG、JPEGファイルに対応</p>
              {pdfImage && !showDistanceInput && (
                <>
                  <button
                    onClick={handleStartCalibration}
                    className="w-full mt-2 px-4 py-2 bg-dw-blue text-white rounded-lg hover:bg-dw-blue-hover"
                    disabled={isCalibrating}
                  >
                    {isCalibrating ? `スケール設定中... (${calibrationPoints.length}/2点)` : 'スケールを設定'}
                  </button>
                  {isCalibrating && (
                    <button
                      onClick={handleCancelCalibration}
                      className="w-full mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      キャンセル
                    </button>
                  )}
                  {pixelToMmRatio && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ スケール設定済み
                    </p>
                  )}
                  {!pixelToMmRatio && !isCalibrating && (
                    <p className="text-xs text-orange-600 mt-2">
                      デフォルト: 1/100縮尺（推定）
                    </p>
                  )}
                  {isCalibrating && calibrationPoints.length === 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                      図面上の既知の距離の始点をクリック
                    </p>
                  )}
                  {isCalibrating && calibrationPoints.length === 1 && (
                    <p className="text-xs text-blue-600 mt-2">
                      終点をクリック
                    </p>
                  )}
                </>
              )}
              {showDistanceInput && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium mb-2">2点間の実際の距離を入力（mm）</p>
                  <input
                    type="number"
                    value={inputDistance}
                    onChange={(e) => setInputDistance(e.target.value)}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg mb-2"
                    placeholder="例: 10000 (10m)"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmDistance}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      確定
                    </button>
                    <button
                      onClick={handleCancelCalibration}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      キャンセル
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    例: 10m = 10000mm、5m = 5000mm
                  </p>
                </div>
              )}
            </div>

            {/* 敷地境界設定 */}
            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                2. 敷地境界設定
              </h2>
              <button
                onClick={handleSetBoundary}
                className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover flex items-center justify-center gap-2"
                disabled={!pdfImage}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                境界を設定
              </button>
            </div>

            {/* 建物配置 (3-1: 間口・奥行) */}
            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                3-1. 建物配置（間口・奥行）
              </h2>
              <div className="space-y-3">
                {/* 建物追加フォーム */}
                <div>
                  <label className="block text-sm font-medium mb-1">間口（間）</label>
                  <input
                    type="number"
                    value={widthKen}
                    onChange={(e) => setWidthKen(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg"
                    min="1"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">奥行（間）</label>
                  <input
                    type="number"
                    value={depthKen}
                    onChange={(e) => setDepthKen(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg"
                    min="1"
                    step="0.5"
                  />
                </div>
                <div className="bg-bg-soft p-2 rounded">
                  <p className="text-sm">
                    1階: {calculateTsubo(widthKen * KEN_TO_MM, depthKen * KEN_TO_MM)}坪
                  </p>
                  <p className="text-sm">
                    2階: {calculateTsubo(widthKen * KEN_TO_MM, depthKen * KEN_TO_MM)}坪
                  </p>
                  <p className="text-sm font-bold">
                    合計: {calculateTsubo(widthKen * KEN_TO_MM, depthKen * KEN_TO_MM) * 2}坪
                  </p>
                </div>
                <button
                  onClick={handleAddBuilding}
                  className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover"
                  disabled={!siteBoundary}
                >
                  建物を配置
                </button>

                {/* 選択された建物の編集 */}
                {selectedId && selectedId.startsWith('building-') && (
                  <div className="mt-4 pt-4 border-t border-line-separator space-y-3">
                    <p className="font-medium text-sm text-accent-primary">選択中の建物を編集</p>
                    <div>
                      <label className="block text-sm font-medium mb-1">間口（間）</label>
                      <input
                        type="number"
                        value={editWidthKen}
                        onChange={(e) => setEditWidthKen(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-line-separator rounded-lg"
                        min="1"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">奥行（間）</label>
                      <input
                        type="number"
                        value={editDepthKen}
                        onChange={(e) => setEditDepthKen(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-line-separator rounded-lg"
                        min="1"
                        step="0.5"
                      />
                    </div>
                    <div className="bg-bg-soft p-2 rounded text-sm">
                      <p>1階: {calculateTsubo(editWidthKen * KEN_TO_MM, editDepthKen * KEN_TO_MM)}坪</p>
                      <p>2階: {calculateTsubo(editWidthKen * KEN_TO_MM, editDepthKen * KEN_TO_MM)}坪</p>
                      <p className="font-bold">合計: {calculateTsubo(editWidthKen * KEN_TO_MM, editDepthKen * KEN_TO_MM) * 2}坪</p>
                    </div>
                    <button
                      onClick={() => handleRotateBuilding()}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      90度回転
                    </button>
                    <button
                      onClick={handleUpdateBuilding}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      サイズを変更
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      建物を削除
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 建物配置 (3-2: 間取りから選択) */}
            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  3-2. 建物配置（間取りから選択）
                </h2>
                <button
                  onClick={() => setShowAddPlanForm(true)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
                  title="カスタムプランを追加"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  追加
                </button>
              </div>
              <div className="space-y-3">
                {/* 間取り選択フォーム */}
                <div>
                  <label className="block text-sm font-medium mb-1">間取りプラン</label>
                  <select
                    value={selectedFloorPlanId}
                    onChange={(e) => setSelectedFloorPlanId(e.target.value)}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg"
                  >
                    <option value="">選択してください</option>
                    <optgroup label="標準プラン">
                      {FLOOR_PLANS.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {plan.category}
                        </option>
                      ))}
                    </optgroup>
                    {customFloorPlans.length > 0 && (
                      <optgroup label="カスタムプラン">
                        {customFloorPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {plan.category}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 選択された間取りプランの詳細 */}
                {selectedFloorPlan && (
                  <div className="bg-bg-soft p-3 rounded-lg space-y-3">
                    {/* 間取り画像プレビュー */}
                    <div className="w-full aspect-square bg-white rounded-lg overflow-hidden border border-line-separator">
                      <img
                        src={selectedFloorPlan.imagePath}
                        alt={selectedFloorPlan.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm">画像なし</div>';
                          }
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{selectedFloorPlan.name}</p>
                        {selectedFloorPlan.id.startsWith('custom-') && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">カスタム</span>
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        <p><strong>カテゴリ:</strong> {selectedFloorPlan.category}</p>
                        <p><strong>サイズ:</strong> {selectedFloorPlan.widthKen}間 × {selectedFloorPlan.depthKen}間</p>
                        <p><strong>坪数:</strong> {selectedFloorPlan.tsubo}坪（{selectedFloorPlan.floors}階）</p>
                        <p className="text-text-sub text-xs">{selectedFloorPlan.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddBuildingFromFloorPlan}
                  className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover"
                  disabled={!siteBoundary || !selectedFloorPlan}
                >
                  建物を配置
                </button>

                {/* カスタムプラン削除ボタン */}
                {selectedFloorPlan && selectedFloorPlan.id.startsWith('custom-') && (
                  <button
                    onClick={() => handleDeleteCustomPlan(selectedFloorPlan.id)}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    カスタムプランを削除
                  </button>
                )}
              </div>
            </div>

            {/* 駐車場配置 */}
            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                4. 車両を配置
              </h2>
              <div className="space-y-3">
                {/* 駐車場追加フォーム */}
                <div>
                  <label className="block text-sm font-medium mb-1">車種サイズ</label>
                  <select
                    value={parkingType}
                    onChange={(e) => setParkingType(e.target.value as ParkingType)}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg"
                  >
                    <option value="kei">{PARKING_SIZES.kei.label}</option>
                    <option value="normal">{PARKING_SIZES.normal.label}</option>
                    <option value="suv">{PARKING_SIZES.suv.label}</option>
                    <option value="minivan">{PARKING_SIZES.minivan.label}</option>
                  </select>
                </div>
                <div className="bg-bg-soft p-2 rounded text-sm space-y-1">
                  <p className="font-medium">実物サイズ:</p>
                  <p>幅: {PARKING_SIZES[parkingType].width / 1000}m × 長さ: {PARKING_SIZES[parkingType].length / 1000}m</p>
                  {pixelToMmRatio && (
                    <>
                      <p className="font-medium mt-2">図面上サイズ:</p>
                      <p>幅: {(mmToPixel(PARKING_SIZES[parkingType].width) / pixelToMmRatio).toFixed(0)}mm × 長さ: {(mmToPixel(PARKING_SIZES[parkingType].length) / pixelToMmRatio).toFixed(0)}mm</p>
                    </>
                  )}
                  {!pixelToMmRatio && (
                    <>
                      <p className="font-medium mt-2">図面上サイズ（1/100）:</p>
                      <p>幅: {PARKING_SIZES[parkingType].width / 100}mm × 長さ: {PARKING_SIZES[parkingType].length / 100}mm</p>
                    </>
                  )}
                </div>
                <button
                  onClick={handleAddParking}
                  className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover"
                  disabled={!siteBoundary}
                >
                  車両を配置
                </button>

                {/* 選択された駐車場の操作 */}
                {selectedId && selectedId.startsWith('parking-') && (
                  <div className="mt-4 pt-4 border-t border-line-separator space-y-3">
                    <p className="font-medium text-sm text-accent-primary">選択中の車両を編集</p>
                    <button
                      onClick={() => handleRotateParking()}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      90度回転
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      車両を削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* キャンバスエリア */}
          <div className={isSidebarOpen ? "col-span-9" : "col-span-12"}>
            {/* サイドバー表示切替ボタン */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mb-4 px-4 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
              {isSidebarOpen ? 'メニューを隠す' : 'メニューを表示'}
            </button>

            <div className="bg-white rounded-lg p-4 border border-line-separator">
              <div className="overflow-auto">
                <SitePlanCanvas
                  stageRef={stageRef}
                  stageSize={stageSize}
                  pdfImage={pdfImage}
                  siteBoundary={siteBoundary}
                  buildings={buildings}
                  parkings={parkings}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  setBuildings={setBuildings}
                  setParkings={setParkings}
                  setSiteBoundary={setSiteBoundary}
                  mmToPixel={mmToPixel}
                  checkCivilLawDistance={checkCivilLawDistance}
                  civilLawDistance={CIVIL_LAW_DISTANCE}
                  isCalibrating={isCalibrating}
                  calibrationPoints={calibrationPoints}
                  setCalibrationPoints={setCalibrationPoints}
                  onCalibrationComplete={handleCalibrationPointsReady}
                  onRotateBuilding={handleRotateBuilding}
                  onRotateParking={handleRotateParking}
                />
              </div>
            </div>

            {/* 説明 */}
            <div className="mt-4 bg-bg-soft rounded-lg p-4">
              <h3 className="font-bold mb-2">使い方</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>敷地図（PDF/PNG/JPEG）をアップロード</li>
                <li>図面上の既知の距離でスケールを設定（推奨）</li>
                <li>敷地境界を設定（青い点線）</li>
                <li><strong>境界の編集：</strong>
                  <ul className="ml-6 mt-1 space-y-0.5 list-disc">
                    <li>濃い青の円をドラッグ → 頂点を移動</li>
                    <li>薄い青の円をクリック → 新しい頂点を追加</li>
                    <li>濃い青の円をダブルクリック → 頂点を削除</li>
                  </ul>
                </li>
                <li>建物の間数を入力して配置（緑色）</li>
                <li>車両を配置（車両画像）</li>
                <li>オブジェクトをドラッグして配置調整</li>
              </ol>
            </div>

            {/* 建蔽率・容積率 */}
            {(() => {
              const ratios = calculateCoverageRatio();
              if (!ratios) return null;

              return (
                <div className="mt-4 bg-white rounded-lg p-4 border border-line-separator">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    建蔽率・容積率
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    {/* 敷地面積 */}
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <p className="text-xs text-text-sub mb-1">敷地面積</p>
                      <p className="text-2xl font-bold text-text-primary">
                        {ratios.siteArea.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-sub mt-1">m²</p>
                    </div>

                    {/* 建築面積 */}
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <p className="text-xs text-text-sub mb-1">建築面積</p>
                      <p className="text-2xl font-bold text-text-primary">
                        {ratios.buildingArea.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-sub mt-1">m²</p>
                    </div>

                    {/* 延床面積 */}
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <p className="text-xs text-text-sub mb-1">延床面積（2階建て）</p>
                      <p className="text-2xl font-bold text-text-primary">
                        {ratios.totalFloorArea.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-sub mt-1">m²</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* 建蔽率 */}
                    <div className={`p-4 rounded-lg border-2 ${
                      ratios.isValidCoverage
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">建蔽率</p>
                        {ratios.isValidCoverage ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-end gap-2">
                        <p className={`text-3xl font-bold ${
                          ratios.isValidCoverage ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {ratios.coverageRatio.toFixed(1)}
                        </p>
                        <p className="text-lg mb-1">%</p>
                      </div>
                      {selectedOaza && (
                        <p className="text-xs text-text-sub mt-2">
                          制限: {selectedOaza.zoningDistrict.buildingCoverageRatio}% 以下
                        </p>
                      )}
                      <p className={`text-xs mt-1 font-medium ${
                        ratios.isValidCoverage ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {ratios.isValidCoverage ? '✓ 適合' : '✗ 不適合'}
                      </p>
                    </div>

                    {/* 容積率 */}
                    <div className={`p-4 rounded-lg border-2 ${
                      ratios.isValidFloorArea
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">容積率</p>
                        {ratios.isValidFloorArea ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-end gap-2">
                        <p className={`text-3xl font-bold ${
                          ratios.isValidFloorArea ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {ratios.floorAreaRatio.toFixed(1)}
                        </p>
                        <p className="text-lg mb-1">%</p>
                      </div>
                      {selectedOaza && (
                        <p className="text-xs text-text-sub mt-2">
                          制限: {selectedOaza.zoningDistrict.floorAreaRatio}% 以下
                        </p>
                      )}
                      <p className={`text-xs mt-1 font-medium ${
                        ratios.isValidFloorArea ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {ratios.isValidFloorArea ? '✓ 適合' : '✗ 不適合'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        </main>
      </div>

      {/* カスタムプラン追加モーダル */}
      {showAddPlanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary">カスタムプランを追加</h3>
                <button
                  onClick={() => {
                    setShowAddPlanForm(false);
                    setNewPlanName('');
                    setNewPlanDescription('');
                    setNewPlanWidthKen(5);
                    setNewPlanDepthKen(5);
                    setNewPlanCategory('3LDK');
                    setNewPlanFloors(2);
                    setNewPlanImage(null);
                    setNewPlanImagePreview('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* プラン名 */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    プラン名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                    placeholder="例: 我が家の間取りプラン"
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    value={newPlanDescription}
                    onChange={(e) => setNewPlanDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                    rows={3}
                    placeholder="このプランについての説明を入力してください"
                  />
                </div>

                {/* サイズ入力 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      間口（間） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newPlanWidthKen}
                      onChange={(e) => setNewPlanWidthKen(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                      min="1"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      奥行（間） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newPlanDepthKen}
                      onChange={(e) => setNewPlanDepthKen(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                      min="1"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* カテゴリと階数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">カテゴリ</label>
                    <select
                      value={newPlanCategory}
                      onChange={(e) => setNewPlanCategory(e.target.value as '2LDK' | '3LDK' | '4LDK' | 'その他')}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                    >
                      <option value="2LDK">2LDK</option>
                      <option value="3LDK">3LDK</option>
                      <option value="4LDK">4LDK</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">階数</label>
                    <input
                      type="number"
                      value={newPlanFloors}
                      onChange={(e) => setNewPlanFloors(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                      min="1"
                      max="3"
                    />
                  </div>
                </div>

                {/* 坪数表示 */}
                <div className="bg-bg-soft p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>坪数:</strong> {calculateTsubo(newPlanWidthKen * KEN_TO_MM, newPlanDepthKen * KEN_TO_MM) * newPlanFloors}坪（{newPlanFloors}階）
                  </p>
                </div>

                {/* 画像アップロード */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    間取り画像 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-3 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  />
                  {newPlanImagePreview && (
                    <div className="mt-3 w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-line-separator">
                      <img
                        src={newPlanImagePreview}
                        alt="プレビュー"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* ボタン */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddCustomPlan}
                    className="flex-1 bg-dw-blue hover:bg-dw-blue-hover text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPlanForm(false);
                      setNewPlanName('');
                      setNewPlanDescription('');
                      setNewPlanWidthKen(5);
                      setNewPlanDepthKen(5);
                      setNewPlanCategory('3LDK');
                      setNewPlanFloors(2);
                      setNewPlanImage(null);
                      setNewPlanImagePreview('');
                    }}
                    className="px-6 py-3 border-2 border-line-dark text-text-sub rounded-lg font-medium hover:bg-bg-soft transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
