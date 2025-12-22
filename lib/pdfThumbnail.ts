import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

// PDF.jsのワーカーを設定
// Note: サーバーサイドではワーカーを使用しない
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

/**
 * PDFファイルからサムネイル画像（PNG）を生成します
 * @param pdfBuffer PDFファイルのバッファ
 * @param options オプション設定
 * @returns PNG画像のバッファ
 */
export async function generatePDFThumbnail(
  pdfBuffer: ArrayBuffer,
  options: {
    width?: number;
    height?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  const { width = 400, scale = 2 } = options;

  try {
    // PDFドキュメントを読み込む
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;

    // 最初のページを取得
    const page = await pdfDocument.getPage(1);

    // ページのビューポートを取得
    const viewport = page.getViewport({ scale });

    // アスペクト比を維持しながらリサイズ
    const targetWidth = width;
    const scaleFactor = targetWidth / viewport.width;
    const targetHeight = viewport.height * scaleFactor;

    // Canvasを作成
    const canvas = createCanvas(targetWidth, targetHeight);
    const context = canvas.getContext('2d');

    // レンダリング
    const renderContext = {
      canvasContext: context as any,
      viewport: page.getViewport({ scale: scaleFactor * scale }),
    };

    await page.render(renderContext).promise;

    // PNGバッファとして取得
    const buffer = canvas.toBuffer('image/png');

    // クリーンアップ
    await pdfDocument.destroy();

    return buffer;
  } catch (error) {
    console.error('PDF thumbnail generation error:', error);
    throw new Error(`サムネイル生成に失敗しました: ${error}`);
  }
}

/**
 * URLからPDFを取得してサムネイルを生成します
 * @param pdfUrl PDFのURL
 * @param options オプション設定
 * @returns PNG画像のバッファ
 */
export async function generateThumbnailFromURL(
  pdfUrl: string,
  options: {
    width?: number;
    height?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    // PDFをダウンロード
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    // サムネイルを生成
    return await generatePDFThumbnail(pdfBuffer, options);
  } catch (error) {
    console.error('PDF thumbnail generation from URL error:', error);
    throw new Error(`URLからのサムネイル生成に失敗しました: ${error}`);
  }
}
