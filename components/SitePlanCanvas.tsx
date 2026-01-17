'use client';

import React, { useEffect, useRef } from 'react';
import Konva from 'konva';

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
  type: 'kei' | 'normal' | 'suv' | 'minivan';
  widthMm: number;
  lengthMm: number;
  rotation: number; // 0, 90, 180, 270
}

interface SiteBoundary {
  points: number[]; // [x1, y1, x2, y2, x3, y3, ...]
}

interface SitePlanCanvasProps {
  stageRef: React.RefObject<Konva.Stage>;
  stageSize: { width: number; height: number };
  pdfImage: HTMLImageElement | null;
  siteBoundary: SiteBoundary | null;
  buildings: Building[];
  parkings: Parking[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  setBuildings: (buildings: Building[]) => void;
  setParkings: (parkings: Parking[]) => void;
  setSiteBoundary: (boundary: SiteBoundary | null) => void;
  mmToPixel: (mm: number) => number;
  checkCivilLawDistance: (x: number, y: number, width: number, height: number) => boolean;
  civilLawDistance: number;
  isCalibrating: boolean;
  calibrationPoints: {x: number, y: number}[];
  setCalibrationPoints: (points: {x: number, y: number}[]) => void;
  onCalibrationComplete: () => void;
  onRotateBuilding: (buildingId: string) => void;
  onRotateParking: (parkingId: string) => void;
}

export default function SitePlanCanvas({
  stageRef,
  stageSize,
  pdfImage,
  siteBoundary,
  buildings,
  parkings,
  selectedId,
  setSelectedId,
  setBuildings,
  setParkings,
  setSiteBoundary,
  mmToPixel,
  checkCivilLawDistance,
  civilLawDistance,
  isCalibrating,
  calibrationPoints,
  setCalibrationPoints,
  onCalibrationComplete,
  onRotateBuilding,
  onRotateParking,
}: SitePlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageInstanceRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const [carImages, setCarImages] = React.useState<Record<string, HTMLImageElement>>({});
  const [floorPlanImages, setFloorPlanImages] = React.useState<Record<string, HTMLImageElement>>({});

  // 車の画像をプリロード
  useEffect(() => {
    const loadCarImages = async () => {
      const types = ['kei', 'normal', 'suv', 'minivan'];
      const images: Record<string, HTMLImageElement> = {};

      for (const type of types) {
        const img = new Image();
        img.src = `/images/cars/${type}.png`;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        images[type] = img;
      }

      setCarImages(images);
    };

    loadCarImages();
  }, []);

  // 間取り画像を読み込み
  useEffect(() => {
    const loadFloorPlanImages = async () => {
      const imagePaths = buildings
        .filter(b => b.imagePath)
        .map(b => b.imagePath!)
        .filter(path => !floorPlanImages[path]); // 未読み込みの画像のみ

      if (imagePaths.length === 0) return;

      const newImages = { ...floorPlanImages };

      for (const path of imagePaths) {
        const img = new Image();
        img.src = path;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // エラーでも続行
        });
        newImages[path] = img;
      }

      setFloorPlanImages(newImages);
    };

    loadFloorPlanImages();
  }, [buildings]);

  // Stageを初期化（一度だけ）
  useEffect(() => {
    if (!containerRef.current || stageInstanceRef.current) return;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width: stageSize.width,
      height: stageSize.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    stageInstanceRef.current = stage;
    layerRef.current = layer;

    // @ts-ignore
    if (stageRef) {
      // @ts-ignore
      stageRef.current = stage;
    }

    return () => {
      stage.destroy();
      stageInstanceRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // クリックイベントハンドラー（最新のstateを参照できるように分離）
  useEffect(() => {
    const stage = stageInstanceRef.current;
    if (!stage) return;

    const handleClick = (e: any) => {
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // キャリブレーションモード時
      if (isCalibrating) {
        const newPoints = [...calibrationPoints, pos];
        setCalibrationPoints(newPoints);

        if (newPoints.length === 2) {
          onCalibrationComplete();
        }
        return;
      }

      // 通常モード：背景クリックで選択解除
      if (e.target === stage) {
        setSelectedId(null);
      }
    };

    stage.off('click');
    stage.on('click', handleClick);

    return () => {
      stage.off('click', handleClick);
    };
  }, [isCalibrating, calibrationPoints, setCalibrationPoints, onCalibrationComplete, setSelectedId]);

  // Stageサイズを更新
  useEffect(() => {
    if (stageInstanceRef.current) {
      stageInstanceRef.current.width(stageSize.width);
      stageInstanceRef.current.height(stageSize.height);
    }
  }, [stageSize]);

  // レイヤーの内容を更新
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // レイヤーをクリア
    layer.destroyChildren();

    // PDF背景画像
    if (pdfImage) {
      const image = new Konva.Image({
        image: pdfImage,
        width: stageSize.width,
        height: stageSize.height,
      });
      layer.add(image);
    }

    // グリッドライン（455mm = 1間の1/4）
    const gridSize = mmToPixel(455);
    if (gridSize > 5) { // グリッドが小さすぎない場合のみ表示
      const gridGroup = new Konva.Group({ listening: false });

      // 縦線
      for (let x = 0; x <= stageSize.width; x += gridSize) {
        const line = new Konva.Line({
          points: [x, 0, x, stageSize.height],
          stroke: '#e5e7eb',
          strokeWidth: 1,
          dash: [5, 5],
          listening: false,
        });
        gridGroup.add(line);
      }

      // 横線
      for (let y = 0; y <= stageSize.height; y += gridSize) {
        const line = new Konva.Line({
          points: [0, y, stageSize.width, y],
          stroke: '#e5e7eb',
          strokeWidth: 1,
          dash: [5, 5],
          listening: false,
        });
        gridGroup.add(line);
      }

      layer.add(gridGroup);
    }

    // 敷地境界（多角形）
    if (siteBoundary && siteBoundary.points.length >= 6) {
      // 多角形の線グループ（オフセットラインを含む）
      const boundaryGroup = new Konva.Group();

      // 多角形の線
      const polygon = new Konva.Line({
        points: siteBoundary.points,
        stroke: '#2563eb',
        strokeWidth: 3,
        closed: true,
        dash: [10, 5],
        listening: false,
      });
      boundaryGroup.add(polygon);

      // 民法上の離れライン（簡易版：各辺から内側にオフセット線を描画）
      const offsetDistance = mmToPixel(civilLawDistance);
      const offsetLinesGroup = new Konva.Group();

      const updateOffsetLines = () => {
        offsetLinesGroup.destroyChildren();
        const currentPoints = polygon.points();

        for (let i = 0; i < currentPoints.length; i += 2) {
          const x1 = currentPoints[i];
          const y1 = currentPoints[i + 1];
          const x2 = currentPoints[(i + 2) % currentPoints.length];
          const y2 = currentPoints[(i + 3) % currentPoints.length];

          // 辺のベクトル
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);

          if (length === 0) continue;

          // 辺に垂直な内向きベクトル（90度回転して正規化）
          const normalX = -dy / length;
          const normalY = dx / length;

          // オフセットした線分の端点
          const ox1 = x1 + normalX * offsetDistance;
          const oy1 = y1 + normalY * offsetDistance;
          const ox2 = x2 + normalX * offsetDistance;
          const oy2 = y2 + normalY * offsetDistance;

          const offsetLine = new Konva.Line({
            points: [ox1, oy1, ox2, oy2],
            stroke: '#f59e0b',
            strokeWidth: 2,
            dash: [5, 5],
            listening: false,
            opacity: 0.7,
          });
          offsetLinesGroup.add(offsetLine);
        }
      };

      updateOffsetLines();
      boundaryGroup.add(offsetLinesGroup);
      layer.add(boundaryGroup);

      // 各頂点にハンドルを追加
      for (let i = 0; i < siteBoundary.points.length; i += 2) {
        const x = siteBoundary.points[i];
        const y = siteBoundary.points[i + 1];
        const vertexIndex = i / 2;

        const handle = new Konva.Circle({
          x,
          y,
          radius: 8,
          fill: '#2563eb',
          stroke: '#ffffff',
          strokeWidth: 2,
          draggable: true,
          name: `boundary-vertex-${vertexIndex}`,
        });

        // ドラッグ中はリアルタイムで polygon を更新
        handle.on('dragmove', () => {
          const newPoints = [...polygon.points()];
          newPoints[i] = handle.x();
          newPoints[i + 1] = handle.y();
          polygon.points(newPoints);
          updateOffsetLines();
          layer.batchDraw();
        });

        // ドラッグ終了時に state を更新
        handle.on('dragend', () => {
          const newPoints = [...polygon.points()];
          newPoints[i] = handle.x();
          newPoints[i + 1] = handle.y();
          setSiteBoundary({ points: newPoints });
        });

        // ダブルクリックで頂点を削除（最低3頂点は残す）
        handle.on('dblclick', () => {
          if (siteBoundary.points.length > 6) {
            const newPoints = [...siteBoundary.points];
            newPoints.splice(i, 2);
            setSiteBoundary({ points: newPoints });
          } else {
            alert('最低3つの頂点が必要です');
          }
        });

        layer.add(handle);
      }

      // 辺の中点に追加用ハンドルを配置
      for (let i = 0; i < siteBoundary.points.length; i += 2) {
        const x1 = siteBoundary.points[i];
        const y1 = siteBoundary.points[i + 1];
        const x2 = siteBoundary.points[(i + 2) % siteBoundary.points.length];
        const y2 = siteBoundary.points[(i + 3) % siteBoundary.points.length];

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const addHandle = new Konva.Circle({
          x: midX,
          y: midY,
          radius: 6,
          fill: '#60a5fa',
          stroke: '#ffffff',
          strokeWidth: 1,
          opacity: 0.7,
          name: `boundary-add-${i / 2}`,
        });

        // クリックで新しい頂点を追加
        addHandle.on('click', () => {
          const newPoints = [...siteBoundary.points];
          newPoints.splice(i + 2, 0, midX, midY);
          setSiteBoundary({ points: newPoints });
        });

        layer.add(addHandle);
      }
    }

    // グリッドスナップ関数
    const snapToGrid = (value: number, gridSize: number): number => {
      return Math.round(value / gridSize) * gridSize;
    };

    // 建物を描画
    console.log('建物を描画:', buildings.length, '個');
    buildings.forEach((building) => {
      const pixelWidth = mmToPixel(building.widthMm);
      const pixelHeight = mmToPixel(building.depthMm);
      const isValid = checkCivilLawDistance(building.x, building.y, pixelWidth, pixelHeight);
      const isSelected = selectedId === building.id;

      console.log('建物描画:', {
        id: building.id,
        position: `(${building.x}, ${building.y})`,
        size: `${pixelWidth} x ${pixelHeight}`,
        isValid,
        isSelected,
        hasImage: !!building.imagePath
      });

      const group = new Konva.Group({
        x: building.x,
        y: building.y,
        draggable: true,
        rotation: building.rotation,
        offsetX: 0,
        offsetY: 0,
      });

      // 間取り画像がある場合は画像を表示、なければ従来の緑の矩形
      const hasValidImage = building.imagePath &&
                            floorPlanImages[building.imagePath] &&
                            floorPlanImages[building.imagePath].complete &&
                            floorPlanImages[building.imagePath].naturalHeight !== 0;

      if (hasValidImage) {
        const floorPlanImage = floorPlanImages[building.imagePath!];

        // 間取り画像を表示
        const imageNode = new Konva.Image({
          x: 0,
          y: 0,
          image: floorPlanImage,
          width: pixelWidth,
          height: pixelHeight,
          opacity: isValid ? 0.9 : 0.5,
        });
        group.add(imageNode);

        // 枠線を追加
        const border = new Konva.Rect({
          x: 0,
          y: 0,
          width: pixelWidth,
          height: pixelHeight,
          stroke: isSelected ? '#fbbf24' : (isValid ? '#10b981' : '#ef4444'),
          strokeWidth: isSelected ? 3 : 2,
          fill: 'transparent',
        });
        group.add(border);
      } else {
        // 従来の緑の矩形表示（画像がない、または読み込み失敗時）
        const rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: pixelWidth,
          height: pixelHeight,
          fill: isValid ? '#10b981' : '#ef4444',
          opacity: 0.6,
          stroke: isSelected ? '#fbbf24' : '#000000',
          strokeWidth: isSelected ? 3 : 1,
        });
        group.add(rect);
      }

      const text = new Konva.Text({
        x: 5,
        y: 5,
        text: `${building.widthKen}間×${building.depthKen}間\n${building.tsubo * 2}坪（総2階）`,
        fontSize: 12,
        fill: '#000000',
        shadowColor: 'white',
        shadowBlur: 3,
        shadowOpacity: 0.8,
      });

      group.add(text);

      group.on('click', () => {
        // 既に選択されている場合は回転
        if (selectedId === building.id) {
          onRotateBuilding(building.id);
        } else {
          setSelectedId(building.id);
        }
      });

      group.on('dragend', () => {
        // 455mmグリッドにスナップ
        const gridSize = mmToPixel(455);
        const snappedX = snapToGrid(group.x(), gridSize);
        const snappedY = snapToGrid(group.y(), gridSize);

        group.x(snappedX);
        group.y(snappedY);

        const updatedBuildings = buildings.map((b) =>
          b.id === building.id
            ? { ...b, x: snappedX, y: snappedY }
            : b
        );
        setBuildings(updatedBuildings);
        layer.batchDraw();
      });

      layer.add(group);
    });

    // 駐車場を描画（車の画像を使用）
    parkings.forEach((parking) => {
      const carImage = carImages[parking.type];
      if (!carImage) return; // 画像が読み込まれていない場合はスキップ

      const pixelWidth = mmToPixel(parking.widthMm);
      const pixelHeight = mmToPixel(parking.lengthMm);

      // 画像の幅を15%広く表示
      const displayPixelWidth = pixelWidth * 1.15;

      // 回転を考慮したバウンディングボックス
      // 画像は縦長（高さ=width、幅=length）なので、rotation=0のときlength×widthの配置になる
      const isVertical = parking.rotation === 0 || parking.rotation === 180;
      const displayWidth = isVertical ? pixelHeight : displayPixelWidth;
      const displayHeight = isVertical ? displayPixelWidth : pixelHeight;

      const isValid = checkCivilLawDistance(parking.x, parking.y, displayWidth, displayHeight);
      const isSelected = selectedId === parking.id;

      // グループ全体で回転を処理
      const group = new Konva.Group({
        x: parking.x,
        y: parking.y,
        draggable: true,
        rotation: parking.rotation,
        // 回転の原点を左上から適切な位置に変更
        offsetX: 0,
        offsetY: 0,
      });

      // 車の画像（グループで回転するので、画像自体は回転なし）
      // 画像は縦長なので、widthとheightを入れ替える
      const imageNode = new Konva.Image({
        image: carImage,
        x: 0,
        y: 0,
        width: pixelHeight,  // lengthを幅に
        height: displayPixelWidth,  // widthを高さに（15%拡大）
        opacity: isValid ? 0.9 : 0.5,
      });
      group.add(imageNode);

      // 選択状態の枠
      if (isSelected) {
        const selectionRect = new Konva.Rect({
          x: 0,
          y: 0,
          width: pixelHeight,
          height: displayPixelWidth,
          stroke: '#fbbf24',
          strokeWidth: 3,
          fill: 'transparent',
        });
        group.add(selectionRect);
      }

      // 無効位置の場合は赤枠を追加
      if (!isValid) {
        const warningRect = new Konva.Rect({
          x: 0,
          y: 0,
          width: pixelHeight,
          height: displayPixelWidth,
          stroke: '#ef4444',
          strokeWidth: 2,
          dash: [10, 5],
          fill: 'transparent',
        });
        group.add(warningRect);
      }

      group.on('click', () => {
        // 既に選択されている場合は回転
        if (selectedId === parking.id) {
          onRotateParking(parking.id);
        } else {
          setSelectedId(parking.id);
        }
      });

      group.on('dragend', () => {
        // 455mmグリッドにスナップ
        const gridSize = mmToPixel(455);
        const snappedX = snapToGrid(group.x(), gridSize);
        const snappedY = snapToGrid(group.y(), gridSize);

        group.x(snappedX);
        group.y(snappedY);

        const updatedParkings = parkings.map((p) =>
          p.id === parking.id
            ? { ...p, x: snappedX, y: snappedY }
            : p
        );
        setParkings(updatedParkings);
        layer.batchDraw();
      });

      layer.add(group);
    });

    // キャリブレーションポイントの表示
    if (isCalibrating && calibrationPoints.length > 0) {
      calibrationPoints.forEach((point, index) => {
        const circle = new Konva.Circle({
          x: point.x,
          y: point.y,
          radius: 10,
          fill: '#ff0000',
          stroke: '#ffffff',
          strokeWidth: 3,
        });

        const text = new Konva.Text({
          x: point.x + 15,
          y: point.y - 10,
          text: `点${index + 1}`,
          fontSize: 16,
          fill: '#ff0000',
          fontStyle: 'bold',
        });

        layer.add(circle);
        layer.add(text);
      });

      // 2点がある場合、線を引く
      if (calibrationPoints.length === 2) {
        const line = new Konva.Line({
          points: [
            calibrationPoints[0].x,
            calibrationPoints[0].y,
            calibrationPoints[1].x,
            calibrationPoints[1].y,
          ],
          stroke: '#ff0000',
          strokeWidth: 2,
          dash: [10, 5],
        });
        layer.add(line);
      }
    }

    layer.batchDraw();
  }, [pdfImage, siteBoundary, buildings, parkings, selectedId, stageSize.width, stageSize.height, civilLawDistance, isCalibrating, calibrationPoints, carImages, floorPlanImages]);

  return <div ref={containerRef} />;
}
