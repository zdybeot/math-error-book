import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// 从环境变量读取配置，更换模型只需修改 Vercel 环境变量
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'qwen3.5-omni-flash';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 创建 OpenAI 兼容客户端
function getAI(): OpenAI {
  return new OpenAI({
    apiKey: AI_API_KEY,
    baseURL: AI_BASE_URL,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 健康检查
  if (req.method === 'GET') {
    return res.json({ status: 'ok', model: AI_MODEL });
  }

  const ai = getAI();

  // OCR 识别
  if (req.method === 'POST' && req.path === '/api/ocr') {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: '缺少 imageBase64 参数' });
      }

      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个小学数学题目识别和解答专家。请识别图片中的数学题目，给出正确答案和解题步骤。返回格式为 JSON：{"question":"题目内容","correctAnswer":"正确答案","explanation":"简要解析","steps":["步骤1","步骤2"]}',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别这道小学数学错题图片，提取题目内容，给出正确答案和解题步骤。' },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';
      return res.json({ content });
    } catch (err: any) {
      console.error('OCR 错误:', err.message);
      return res.status(500).json({ error: err.message || 'OCR 识别失败' });
    }
  }

  // 生成相似练习题目
  if (req.method === 'POST' && req.path === '/api/practice') {
    try {
      const { errorQuestions, count = 2 } = req.body;
      if (!errorQuestions || errorQuestions.length === 0) {
        return res.status(400).json({ error: '缺少错题数据' });
      }

      const errorContext = errorQuestions
        .slice(0, 10)
        .map((e: any, i: number) => `错题 ${i + 1}：${e.question}\n  正确答案：${e.correctAnswer}\n  知识点：${e.tags.join('、')}`)
        .join('\n\n');

      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个小学数学出题专家。请根据学生做错的题目，生成相似的练习题目。新题目要考查相同或类似的知识点，但改变具体数字和表述。适合四年级学生水平。返回格式为 JSON 数组：[{"question":"题目","answer":"答案","type":"题型"}]',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `以下是学生做错的题目：\n\n${errorContext}\n\n请根据以上错题，生成 ${count} 道相似的练习题。要求：\n1. 考查相同的知识点\n2. 改变具体的数字\n3. 难度与原题相当\n4. 题型可以多样化（计算题、应用题、填空题等）`,
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || '';
      return res.json({ content });
    } catch (err: any) {
      console.error('出题错误:', err.message);
      return res.status(500).json({ error: err.message || '生成题目失败' });
    }
  }

  // 预测所属单元
  if (req.method === 'POST' && req.path === '/api/predict-unit') {
    try {
      const { question, units } = req.body;
      if (!question) {
        return res.status(400).json({ error: '缺少题目内容' });
      }

      const unitNames = units.map((u: any) => u.name).join('、');

      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一个小学数学教学专家。请根据题目内容，判断它属于以下哪个单元。只返回单元名称，不要返回其他内容。可选单元：${unitNames}`,
          },
          {
            role: 'user',
            content: [{ type: 'text', text: `请判断这道题目属于哪个单元：\n${question}` }],
          },
        ],
        max_tokens: 64,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      const matched = units.find((u: any) => content.includes(u.name));
      return res.json({ content, matchedUnit: matched });
    } catch (err: any) {
      console.error('预测单元错误:', err.message);
      return res.status(500).json({ error: err.message || '预测失败' });
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
