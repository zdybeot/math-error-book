import { API_BASE_URL } from '@/src/config/api';

export interface PracticeQuestion {
  question: string;
  answer: string;
  type: string;
}

/**
 * 调用云端服务生成相似练习题目
 */
export async function generateSimilarQuestions(
  errorQuestions: Array<{ question: string; correctAnswer: string; tags: string[] }>,
  count: number = 2
): Promise<PracticeQuestion[]> {
  if (errorQuestions.length === 0) {
    throw new Error('没有错题数据，无法生成练习');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorQuestions, count }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `服务异常: ${response.status}`);
    }

    const data = await response.json();
    return parsePracticeResponse(data.content);
  } catch (error) {
    console.error('生成题目失败:', error);
    throw error;
  }
}

/**
 * 解析云端服务返回的练习题目
 */
function parsePracticeResponse(content: string): PracticeQuestion[] {
  try {
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());
    const arr = Array.isArray(parsed) ? parsed : [parsed];

    return arr
      .filter((item: any) => item && item.question)
      .map((item: any) => ({
        question: item.question || '',
        answer: item.answer || '',
        type: item.type || '练习题',
      }));
  } catch {
    const lines = content.split('\n').filter((l) => l.trim());
    return lines.map((line, i) => ({
      question: line.replace(/^\d+[\.\、\)]\s*/, ''),
      answer: '—',
      type: '练习题',
    }));
  }
}
