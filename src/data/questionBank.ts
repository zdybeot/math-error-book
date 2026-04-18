import { QuestionItem } from '../types';

// 按单元分类的题库 - 用于延伸练习随机出题
export const questionBank: Record<number, QuestionItem[]> = {
  0: [
    { question: '计算：(360 + 240) / 12 x 5 = ?', answer: '250', type: '计算题' },
    { question: '计算：(500 - 180) / 8 x 3 = ?', answer: '120', type: '计算题' },
    { question: '计算：24 x 5 + (360 - 120) / 6 = ?', answer: '160', type: '计算题' },
    { question: '计算：(720 / 9 + 80) x 2 = ?', answer: '320', type: '计算题' },
    { question: '小明有 60 元，花了 1/4 买书，又用剩下钱的 1/3 买笔，还剩多少？', answer: '30元', type: '应用题' },
    { question: '一辆汽车每小时行45千米，行了3小时后，又行了全程的1/3，全程多少千米？', answer: '180千米', type: '应用题' },
    { question: '计算：(480 + 320) / 16 x 7 = ?', answer: '350', type: '计算题' },
    { question: '工厂生产一批零件，第一天生产了总数的1/5，第二天生产了剩下的1/4，还剩240个，这批零件共多少个？', answer: '400个', type: '应用题' },
    { question: '计算：15 x 8 + (640 - 280) / 9 = ?', answer: '160', type: '计算题' },
    { question: '小红有96元，先花了1/3买书，又用剩下的1/4买文具，还剩多少？', answer: '48元', type: '应用题' },
  ],
  2: [
    { question: '用简便方法计算：25 x 37 x 4 = ?', answer: '3,700', type: '计算题' },
    { question: '用简便方法计算：125 x 32 = ?', answer: '4,000', type: '计算题' },
    { question: '用简便方法计算：99 x 45 + 45 = ?', answer: '4,500', type: '计算题' },
    { question: '用简便方法计算：36 x 101 = ?', answer: '3,636', type: '计算题' },
    { question: '用简便方法计算：270 / 6 / 5 = ?', answer: '9', type: '计算题' },
    { question: '用简便方法计算：48 x 25 = ?', answer: '1,200', type: '计算题' },
    { question: '用简便方法计算：72 x 125 = ?', answer: '9,000', type: '计算题' },
    { question: '用简便方法计算：560 / 7 / 8 = ?', answer: '10', type: '计算题' },
  ],
  3: [
    { question: '把 0.356 扩大到原来的 100 倍是多少？', answer: '35.6', type: '填空题' },
    { question: '0.7 和 0.70 的大小关系是什么？', answer: '相等', type: '填空题' },
    { question: '5.08 中的"8"表示什么？', answer: '8个百分之一', type: '填空题' },
    { question: '把 3.2 改写成三位小数', answer: '3.200', type: '填空题' },
    { question: '比 2.5 大且比 2.6 小的小数有多少个？', answer: '无数个', type: '填空题' },
    { question: '3.06 千克 = ____ 克', answer: '3,060克', type: '填空题' },
  ],
  4: [
    { question: '三角形三个内角的度数比是 2:3:4，最大角是多少度？', answer: '80度', type: '计算题' },
    { question: '一个等腰三角形，底角是 35 度，顶角是多少度？', answer: '110度', type: '计算题' },
    { question: '以下哪组线段能组成三角形：A. 3,4,8  B. 5,6,10  C. 2,3,5  D. 1,2,4', answer: 'B', type: '选择题' },
    { question: '三角形的内角和是多少度？', answer: '180度', type: '填空题' },
    { question: '一个三角形有两条边分别是 5cm 和 8cm，第三条边可能是多少？', answer: '4cm（大于3小于13均可）', type: '填空题' },
    { question: '已知直角三角形的一个锐角是 35 度，另一个锐角是多少度？', answer: '55度', type: '计算题' },
    { question: '画出一个等边三角形，它有几条对称轴？', answer: '3条', type: '填空题' },
  ],
  5: [
    { question: '计算：3.45 + 2.78 = ?', answer: '6.23', type: '计算题' },
    { question: '计算：7.2 - 3.56 = ?', answer: '3.64', type: '计算题' },
    { question: '计算：12.5 + 8.75 = ?', answer: '21.25', type: '计算题' },
    { question: '水池里有水 4.5 吨，排出 1.86 吨后又流入 2.3 吨，现在有多少吨水？', answer: '4.94吨', type: '应用题' },
    { question: '一根绳子长 15.6 米，第一次用去 4.35 米，第二次用去 5.8 米，还剩多少米？', answer: '5.45米', type: '应用题' },
    { question: '妈妈买菜花了 23.5 元，买肉花了 38.8 元，给了 100 元，应找回多少？', answer: '37.7元', type: '应用题' },
  ],
  8: [
    { question: '笼子里有鸡和兔共 20 个头，56 只脚，鸡有几只？', answer: '12只', type: '应用题' },
    { question: '停车场有自行车和三轮车共 15 辆，车轮共 38 个，三轮车有几辆？', answer: '8辆', type: '应用题' },
    { question: '鸡兔同笼，头 35 个，脚 94 只，兔有几只？', answer: '12只', type: '应用题' },
    { question: '蜘蛛和蛐蛐共 10 只，腿共 68 条，蜘蛛有几只？（蜘蛛8条腿，蛐蛐6条腿）', answer: '4只', type: '应用题' },
    { question: '全班 42 人去划船，大船坐 6 人，小船坐 4 人，共租 9 条船，大船几条？', answer: '3条', type: '应用题' },
    { question: '有 28 人去住店，大房间住 4 人，小房间住 3 人，共租 8 间房，大房间几间？', answer: '4间', type: '应用题' },
  ],
};

// 没有题库的单元使用默认题库
export const defaultQuestionBank: QuestionItem[] = [
  { question: '请根据本单元知识点，自行出一道练习题', answer: '—', type: '自定义' },
];
