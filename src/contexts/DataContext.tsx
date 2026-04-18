import React, { useState, createContext, useContext } from 'react';
import { DataState, ErrorEntry, PracticeSession, MasteryStatus, GeneratedQuestion } from '@/src/types';

// 一些示例数据，用于首次展示
const sampleErrors: ErrorEntry[] = [
  {
    id: 'sample-1',
    question: '计算：(240 + 360) / 15 x 4 = ?',
    userAnswer: '160',
    correctAnswer: '160',
    explanation: '运算顺序错误，应该先算括号内再依次计算',
    steps: ['先算括号：240 + 360 = 600', '再算除法：600 / 15 = 40', '最后乘法：40 x 4 = 160'],
    photoUri: null,
    unitId: 0,
    tags: ['四则运算'],
    status: 'unmastered',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'sample-2',
    question: '水池进水排水问题',
    userAnswer: '3.2吨',
    correctAnswer: '4.94吨',
    explanation: '应该先排出再流入，注意运算顺序',
    steps: ['原有水量 4.5 吨', '排出 1.86 吨后剩 2.64 吨', '流入 2.3 吨后共 4.94 吨'],
    photoUri: null,
    unitId: 5,
    tags: ['小数加减'],
    status: 'practicing',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'sample-3',
    question: '三角形内角和计算',
    userAnswer: '170度',
    correctAnswer: '180度',
    explanation: '三角形内角和恒为180度',
    steps: ['三角形三个内角之和固定为180度', '已知两个角可以求第三个角'],
    photoUri: null,
    unitId: 4,
    tags: ['三角形'],
    status: 'mastered',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'sample-4',
    question: '鸡兔同笼：头35个，脚94只',
    userAnswer: '兔10只',
    correctAnswer: '兔12只',
    explanation: '假设全是鸡，脚数少了，需要调整',
    steps: ['假设全是鸡：35 x 2 = 70只脚', '实际多 94 - 70 = 24只脚', '每把一只鸡换成兔多2只脚', '需要换 24 / 2 = 12只兔'],
    photoUri: null,
    unitId: 8,
    tags: ['鸡兔同笼'],
    status: 'unmastered',
    createdAt: Date.now() - 4 * 86400000,
  },
];

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ErrorEntry[]>(sampleErrors);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);

  const addError = (entry: Omit<ErrorEntry, 'id' | 'createdAt'>) => {
    const newError: ErrorEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setErrors(prev => [newError, ...prev]);
  };

  const updateErrorStatus = (id: string, status: MasteryStatus) => {
    setErrors(prev =>
      prev.map(e => (e.id === id ? { ...e, status } : e))
    );
  };

  const deleteError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const savePracticeResult = (session: Omit<PracticeSession, 'id' | 'createdAt'>) => {
    const newSession: PracticeSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setPracticeSessions(prev => [...prev, newSession]);
  };

  const getErrorsByUnit = (unitId: number): ErrorEntry[] => {
    return errors.filter(e => e.unitId === unitId);
  };

  return (
    <DataContext.Provider
      value={{ errors, practiceSessions, addError, updateErrorStatus, deleteError, savePracticeResult, getErrorsByUnit }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataState {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
