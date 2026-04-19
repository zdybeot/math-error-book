import { Semester, Unit } from '../types';

export const semesters: Semester[] = [
  { id: 'grade4_sem1', label: '四年级上', subtitle: '人教版 · 四年级上' },
  { id: 'grade4_sem2', label: '四年级下', subtitle: '人教版 · 四年级下' },
  { id: 'grade5_sem1', label: '五年级上', subtitle: '人教版 · 五年级上' },
  { id: 'grade5_sem2', label: '五年级下', subtitle: '人教版 · 五年级下' },
];

// 每个学期对应的单元配置
const unitsBySemester: Record<string, Unit[]> = {
  grade4_sem1: [
    { id: 0, num: '第一单元', name: '大数的认识', order: 1 },
    { id: 1, num: '第二单元', name: '公顷和平方千米', order: 2 },
    { id: 2, num: '第三单元', name: '角的度量', order: 3 },
    { id: 3, num: '第四单元', name: '三位数乘两位数', order: 4 },
    { id: 4, num: '第五单元', name: '平行四边形和梯形', order: 5 },
    { id: 5, num: '第六单元', name: '除数是两位数的除法', order: 6 },
    { id: 6, num: '第七单元', name: '条形统计图', order: 7 },
    { id: 7, num: '第八单元', name: '数学广角 —— 优化', order: 8 },
  ],
  grade4_sem2: [
    { id: 0, num: '第一单元', name: '四则运算', order: 1 },
    { id: 1, num: '第二单元', name: '观察物体（二）', order: 2 },
    { id: 2, num: '第三单元', name: '运算定律与简便计算', order: 3 },
    { id: 3, num: '第四单元', name: '小数的意义和性质', order: 4 },
    { id: 4, num: '第五单元', name: '三角形', order: 5 },
    { id: 5, num: '第六单元', name: '小数的加法和减法', order: 6 },
    { id: 6, num: '第七单元', name: '图形的运动（二）', order: 7 },
    { id: 7, num: '第八单元', name: '平均数与条形统计图', order: 8 },
    { id: 8, num: '第九单元', name: '数学广角 —— 鸡兔同笼', order: 9 },
  ],
  grade5_sem1: [
    { id: 0, num: '第一单元', name: '小数乘法', order: 1 },
    { id: 1, num: '第二单元', name: '位置', order: 2 },
    { id: 2, num: '第三单元', name: '小数除法', order: 3 },
    { id: 3, num: '第四单元', name: '可能性', order: 4 },
    { id: 4, num: '第五单元', name: '简易方程', order: 5 },
    { id: 5, num: '第六单元', name: '多边形的面积', order: 6 },
    { id: 6, num: '第七单元', name: '植树问题', order: 7 },
  ],
  grade5_sem2: [
    { id: 0, num: '第一单元', name: '观察物体（三）', order: 1 },
    { id: 1, num: '第二单元', name: '因数和倍数', order: 2 },
    { id: 2, num: '第三单元', name: '长方体和正方体', order: 3 },
    { id: 3, num: '第四单元', name: '分数的意义和性质', order: 4 },
    { id: 4, num: '第五单元', name: '图形的运动（三）', order: 5 },
    { id: 5, num: '第六单元', name: '分数的加法和减法', order: 6 },
    { id: 6, num: '第七单元', name: '找次品', order: 7 },
  ],
};

// 获取指定学期的单元
export function getUnitsForSemester(semesterId: string): Unit[] {
  return unitsBySemester[semesterId] || unitsBySemester['grade4_sem2'];
}

// 默认学期
export const DEFAULT_SEMESTER = 'grade4_sem2';
