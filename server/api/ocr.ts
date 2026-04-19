import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAI } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ai = getAI();

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: '缺少 imageBase64 参数' });
    }

    const response = await ai.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen3.5-omni-flash',
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
    res.json({ content });
  } catch (err: any) {
    console.error('OCR 错误:', err.message);
    res.status(500).json({ error: err.message || 'OCR 识别失败' });
  }
}
