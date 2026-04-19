import * as FileSystem from 'expo-file-system';
import { deleteAsync } from 'expo-file-system/legacy';
import { AI_API_KEY, AI_MODEL, AI_BASE_URL } from '@/src/config/ai';

export interface OcrResult {
  question: string;
  correctAnswer: string;
  explanation: string;
  steps: string[];
}

/**
 * 调用 qwen3.5-omni-flash 识别错题照片
 *
 * @param imageUrl 图片本地路径（file:// 或 content:// URI）
 * @param apiKey 通义 API Key
 * @returns OCR 识别结果
 */
export async function ocrMathError(imageUrl: string, apiKey: string): Promise<OcrResult> {
  try {
    // 1. 将图片转为 base64
    const base64 = await convertImageToBase64(imageUrl);

    // 2. 调用通义 API
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个小学数学题目识别和解答专家。请识别图片中的数学题目，给出正确答案和解题步骤。返回格式为 JSON：{"question":"题目内容","correctAnswer":"正确答案","explanation":"简要解析","steps":["步骤1","步骤2"]}',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别这道小学数学错题图片，提取题目内容，给出正确答案和解题步骤。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API 请求失败: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('API 返回空结果');
    }

    // 3. 解析返回结果
    return parseOcrResponse(content);
  } catch (error) {
    console.error('OCR 识别失败:', error);
    throw error;
  }
}

/**
 * 将图片 URI 转为 base64
 */
async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // 如果图片在 file:// 本地文件系统
    if (imageUri.startsWith('file://')) {
      const file = new FileSystem.File(imageUri);
      return await file.base64();
    }

    // 如果是 content:// URI（Android 相册），需要先复制到缓存
    if (imageUri.startsWith('content://')) {
      const cacheFile = new FileSystem.File(FileSystem.Paths.cache, 'temp_image.jpg');
      await FileSystem.copyAsync({
        from: imageUri,
        to: cacheFile.uri,
      });
      const base64 = await cacheFile.base64();
      // 清理缓存
      await deleteAsync(cacheFile.uri, { idempotent: true });
      return base64;
    }

    // 如果已经是 base64 data URI
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
 * 根据题目内容预测所属单元
 *
 * @param question 题目内容
 * @param unitList 可选的单元列表
 * @returns 预测的单元 ID
 */
export async function predictUnit(
  question: string,
  unitList: Array<{ id: number; name: string }>
): Promise<number> {
  if (!AI_API_KEY || !question.trim()) return 0;

  const unitNames = unitList.map(u => u.name).join('、');

  try {
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一个小学数学教学专家。请根据题目内容，判断它属于以下哪个单元。只返回单元名称，不要返回其他内容。可选单元：${unitNames}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `请判断这道题目属于哪个单元：\n${question}`,
              },
            ],
          },
        ],
        max_tokens: 64,
        temperature: 0.1,
      }),
    });

    if (!response.ok) return 0;

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim() || '';

    // 匹配单元名称
    const matched = unitList.find(u => content.includes(u.name));
    return matched ? matched.id : 0;
  } catch {
    return 0;
  }
}

/**
 * 解析 API 返回的内容
 */
function parseOcrResponse(content: string): OcrResult {
  try {
    // 尝试提取 JSON
    let jsonStr = content;

    // 如果返回内容包含代码块
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
    // 如果无法解析 JSON，返回原始内容
    return {
      question: content,
      correctAnswer: '',
      explanation: '',
      steps: [],
    };
  }
}
