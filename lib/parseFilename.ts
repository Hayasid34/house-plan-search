/**
 * PDFファイル名から住宅プラン情報を抽出
 *
 * ファイル名形式: {建物坪数}_{間取り}_{階数}_{進入方向}_{敷地面積}_{特徴1-特徴2-特徴3...}.pdf
 * 例: 32.5坪_3LDK_2階建て_南_50坪_吹き抜け-WIC-ロフト.pdf
 */

export interface ParsedPlanData {
  title: string;          // タイトル（自動生成）
  layout: string;         // 間取り (例: 3LDK)
  floors: string;         // 階数 (例: 2階建て、平屋)
  totalArea: number;      // 建物坪数（延床面積）
  direction: string;      // 進入方向（東西南北）
  siteArea: number;       // 敷地面積（坪）
  features: string[];     // 特徴 (例: ['吹き抜け', 'WIC', 'ロフト'])
  originalFilename: string;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedPlanData;
  error?: string;
}

/**
 * ファイル名をパースして住宅プラン情報を抽出
 */
export function parseFilename(filename: string): ParseResult {
  try {
    // .pdfを除去
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');

    // アンダースコアで分割
    const parts = nameWithoutExt.split('_');

    if (parts.length < 5) {
      return {
        success: false,
        error: 'ファイル名の形式が正しくありません。形式: {建物坪数}_{間取り}_{階数}_{進入方向}_{敷地面積}_{特徴}.pdf',
      };
    }

    const [buildingAreaStr, layout, floors, direction, siteAreaStr, ...featureParts] = parts;

    // 建物坪数を抽出（"32.5坪" -> 32.5、"-" または "-坪" の場合は 0）
    let totalArea = 0;
    const cleanedBuildingArea = buildingAreaStr.trim().replace(/坪$/, '');
    if (cleanedBuildingArea === '-') {
      totalArea = 0;
    } else {
      const buildingAreaMatch = buildingAreaStr.match(/([\d.]+)/);
      if (!buildingAreaMatch) {
        return {
          success: false,
          error: '建物坪数の形式が正しくありません。例: 32.5坪 または -',
        };
      }
      totalArea = parseFloat(buildingAreaMatch[1]);
    }

    // 階数の検証（"-" の場合は許可）
    const validFloors = ['平屋', '2階建て', '3階建て', '-'];
    if (!validFloors.includes(floors.trim())) {
      return {
        success: false,
        error: '階数は平屋・2階建て・3階建て または - を指定してください',
      };
    }

    // 敷地面積を抽出（"50坪" -> 50、"-" または "-坪" の場合は 0）
    let siteArea = 0;
    const cleanedSiteArea = siteAreaStr.trim().replace(/坪$/, '');
    if (cleanedSiteArea === '-') {
      siteArea = 0;
    } else {
      const siteAreaMatch = siteAreaStr.match(/([\d.]+)/);
      if (!siteAreaMatch) {
        return {
          success: false,
          error: '敷地面積の形式が正しくありません。例: 50坪 または -',
        };
      }
      siteArea = parseFloat(siteAreaMatch[1]);
    }

    // 進入方向の検証（"-" の場合は許可）
    const validDirections = ['東', '西', '南', '北', '北東', '北西', '南東', '南西', '-'];
    if (!validDirections.includes(direction.trim())) {
      return {
        success: false,
        error: '進入方向は東・西・南・北・北東・北西・南東・南西 または - を指定してください',
      };
    }

    // 特徴を抽出（ハイフン区切り、無制限）
    const featuresStr = featureParts.join('_');
    const features = featuresStr
      ? featuresStr.split('-').filter(f => f.trim()).map(f => f.trim())
      : [];

    // タイトルを自動生成（"-" の場合は表示しない）
    const titleParts: string[] = [];
    if (totalArea > 0) titleParts.push(`${totalArea}坪`);
    if (layout.trim() !== '-') titleParts.push(layout.trim());
    if (floors.trim() !== '-') titleParts.push(floors.trim());
    if (direction.trim() !== '-') titleParts.push(`${direction.trim()}道路`);

    const title = titleParts.length > 0 ? titleParts.join(' ') : '住宅プラン';

    return {
      success: true,
      data: {
        title,
        layout: layout.trim(),
        floors: floors.trim(),
        totalArea,
        direction: direction.trim(),
        siteArea,
        features,
        originalFilename: filename,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `ファイル名の解析中にエラーが発生しました: ${error}`,
    };
  }
}

/**
 * 複数のファイル名を一括パース
 */
export function parseMultipleFilenames(filenames: string[]): ParseResult[] {
  return filenames.map(filename => parseFilename(filename));
}

/**
 * ファイル名が正しい形式かチェック
 */
export function validateFilename(filename: string): boolean {
  const result = parseFilename(filename);
  return result.success;
}

/**
 * プラン情報からファイル名を生成（逆変換）
 */
export function generateFilename(data: Omit<ParsedPlanData, 'originalFilename' | 'title'>): string {
  const { layout, floors, totalArea, direction, siteArea, features } = data;

  let filename = `${totalArea}坪_${layout}_${floors}_${direction}_${siteArea}坪`;

  if (features.length > 0) {
    filename += `_${features.join('-')}`;
  }

  return `${filename}.pdf`;
}
