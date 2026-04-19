const OpenAI = require('openai');

// 从环境变量读取配置，更换模型只需修改云函数环境变量
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'qwen3.5-omni-flash';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function getAI() {
  return new OpenAI({
    apiKey: AI_API_KEY,
    baseURL: AI_BASE_URL,
  });
}

/**
 * 腾讯云云函数入口
 *
 * @param {object} event - API 网关触发器事件
 * @param {object} context - 运行环境
 * @returns {object} 响应
 */
exports.main_handler = async (event, context) => {
  const ai = getAI();

  // 解析路径和方法
  const path = event.path || event.requestContext?.path || '';
  const method = event.httpMethod || 'GET';

  // 跨域 headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 预检请求
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // 健康检查
  if (method === 'GET' && (path === '/' || path === '/api/health')) {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ok', model: AI_MODEL }),
    };
  }

  try {
    let result;

    // OCR 识别
    if (method === 'POST' && path === '/api/ocr') {
      const { imageBase64 } = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
      if (!imageBase64) {
        return error(400, '缺少 imageBase64 参数', corsHeaders);
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
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      });

      result = { content: response.choices[0]?.message?.content || '' };

    // 生成相似练习题目
    } else if (method === 'POST' && path === '/api/practice') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
      const { errorQuestions, count = 2 } = body;
      if (!errorQuestions || errorQuestions.length === 0) {
        return error(400, '缺少错题数据', corsHeaders);
      }

      const errorContext = errorQuestions
        .slice(0, 10)
        .map((e, i) => `错题 ${i + 1}：${e.question}\n  正确答案：${e.correctAnswer}\n  知识点：${e.tags.join('、')}`)
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

      result = { content: response.choices[0]?.message?.content || '' };

    // 预测所属单元
    } else if (method === 'POST' && path === '/api/predict-unit') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
      const { question, units } = body;
      if (!question) {
        return error(400, '缺少题目内容', corsHeaders);
      }

      const unitNames = units.map(u => u.name).join('、');

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
      const matched = units.find(u => content.includes(u.name));
      result = { content, matchedUnit: matched || null };

    } else {
      return error(404, 'Not found', corsHeaders);
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };

  } catch (err) {
    console.error('AI 服务错误:', err.message);
    return error(500, err.message || '服务内部错误', corsHeaders);
  }
};

function error(status, message, headers) {
  return {
    statusCode: status,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}
