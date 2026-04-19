// 掌握状态
export type MasteryStatus = 'unmastered' | 'practicing' | 'mastered';

// 学期定义
export interface Semester {
  id: string;
  label: string;
  subtitle: string;
}

// 单元定义
export interface Unit {
  id: number;
  num: string;      // e.g. '第一单元'
  name: string;     // e.g. '四则运算'
  order: number;
}

// 错题记录
export interface ErrorEntry {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  steps: string[];
  photoUri: string | null;
  semester: string;   // 学期 ID
  unitId: number;
  tags: string[];
  status: MasteryStatus;
  createdAt: number;  // timestamp
}

// 题库中的题目
export interface QuestionItem {
  question: string;
  answer: string;
  type: string;
  svg?: string;
}

// 练习中生成的题目
export interface GeneratedQuestion {
  question: string;
  answer: string;
  type: string;
  userMark?: 'correct' | 'wrong';
}

// 练习会话记录
export interface PracticeSession {
  id: string;
  unitId: number;
  questions: GeneratedQuestion[];
  totalCorrect: number;
  totalWrong: number;
  createdAt: number;
}

// 全局数据上下文
export interface DataState {
  errors: ErrorEntry[];
  practiceSessions: PracticeSession[];
  currentSemester: string;
  availableSemesters: Semester[];
  units: Unit[];
  setSemester: (semesterId: string) => void;
  addError: (entry: Omit<ErrorEntry, 'id' | 'createdAt'>) => void;
  updateErrorStatus: (id: string, status: MasteryStatus) => void;
  deleteError: (id: string) => void;
  savePracticeResult: (session: Omit<PracticeSession, 'id' | 'createdAt'>) => void;
  getErrorsByUnit: (unitId: number) => ErrorEntry[];
}
