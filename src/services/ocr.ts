import * as FileSystem from 'expo-file-system';
import { deleteAsync } from 'expo-file-system/legacy';
import { API_BASE_URL } from '@/src/config/api';

export interface OcrResult {
  question: string;
  correctAnswer: string;
  explanation: string;
  steps: string[];
}

/**
 * 调用云端 OCR 服务识别错题照片
 */
export async function ocrMathError(imageUrl: string): Promise<OcrResult> {
  try {
    // 1. 将图片转为 base64
    const base64 = await convertImageToBase64(imageUrl);

    // 2. 调用云端 OCR 服务
    const response = await fetch(`${API_BASE_URL}/api/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `服务异常: ${response.status}`);
    }

    const data = await response.json();
    return parseOcrResponse(data.content);
  } catch (error) {
    console.error('OCR 识别失败:', error);
    throw error;
  }
}

/**
 * 根据题目内容预测所属单元
 */
export async function predictUnit(
  question: string,
  unitList: Array<{ id: number; name: string }>
): Promise<number> {
  if (!question.trim()) return 0;

  try {
    const response = await fetch(`${API_BASE_URL}/api/predict-unit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, units: unitList }),
    });

    if (!response.ok) return 0;

    const data = await response.json();
    return data.matchedUnit ? data.matchedUnit.id : 0;
  } catch {
    return 0;
  }
}

/**
 * 将图片 URI 转为 base64
 */
async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    if (imageUri.startsWith('file://')) {
      const file = new FileSystem.File(imageUri);
      return await file.base64();
    }

    if (imageUri.startsWith('content://')) {
      const cacheFile = new FileSystem.File(FileSystem.Paths.cache, 'temp_image.jpg');
      await FileSystem.copyAsync({ from: imageUri, to: cacheFile.uri });
      const base64 = await cacheFile.base64();
      await deleteAsync(cacheFile.uri, { idempotent: true });
      return base64;
    }

    if (imageUri.startsWith('data:')) {
      return imageUri.split(',')[1] || '';
    }

    throw new Error('不支持的图片 URI 格式');
  } catch (error) {
    console.error('图片转 base64 失败:', error);
    throw error;
  }
}

/**
 * 解析 API 返回的内容
 */
function parseOcrResponse(content: string): OcrResult {
  try {
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());
    return {
      question: parsed.question || '',
      correctAnswer: parsed.correctAnswer || '',
      explanation: parsed.explanation || '',
      steps: parsed.steps || [],
    };
  } catch {
    return { question: content, correctAnswer: '', explanation: '', steps: [] };
  }
}
