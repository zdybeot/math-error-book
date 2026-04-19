import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataState, ErrorEntry, PracticeSession, MasteryStatus, GeneratedQuestion, Unit } from '@/src/types';
import { semesters, DEFAULT_SEMESTER, getUnitsForSemester } from '@/src/data/semesters';

const STORAGE_KEY = 'math-error-book-data';
const SEMESTER_KEY = 'math-error-book-semester';

// 全局图片暂存（用于页面间传图片 URI）
let pendingPhotoUri: string | null = null;

export function setPendingPhoto(uri: string | null) {
  pendingPhotoUri = uri;
}

export function getPendingPhoto(): string | null {
  const uri = pendingPhotoUri;
  pendingPhotoUri = null; // 取完后清空
  return uri;
}

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
    semester: DEFAULT_SEMESTER,
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
    semester: DEFAULT_SEMESTER,
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
    semester: DEFAULT_SEMESTER,
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
    semester: DEFAULT_SEMESTER,
    unitId: 8,
    tags: ['鸡兔同笼'],
    status: 'unmastered',
    createdAt: Date.now() - 4 * 86400000,
  },
];

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [currentSemester, setCurrentSemester] = useState(DEFAULT_SEMESTER);
  const [loaded, setLoaded] = useState(false);

  // 加载数据
  useEffect(() => {
    loadFromStorage();
  }, []);

  // 保存数据
  useEffect(() => {
    if (loaded) {
      saveToStorage();
    }
  }, [errors, practiceSessions, loaded]);

  const loadFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // 迁移：旧数据没有 semester 字段，设为默认学期
        const migratedErrors = (data.errors || sampleErrors).map((e: ErrorEntry) => ({
          ...e,
          semester: e.semester || DEFAULT_SEMESTER,
        }));
        setErrors(migratedErrors);
        setPracticeSessions(data.practiceSessions || []);
      } else {
        setErrors(sampleErrors);
      }
      // 加载已保存的学期
      const savedSemester = await AsyncStorage.getItem(SEMESTER_KEY);
      if (savedSemester) {
        setCurrentSemester(savedSemester);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      setErrors(sampleErrors);
    }
    setLoaded(true);
  };

  const saveToStorage = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        errors,
        practiceSessions,
      }));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  };

  const setSemester = (semesterId: string) => {
    setCurrentSemester(semesterId);
    AsyncStorage.setItem(SEMESTER_KEY, semesterId);
  };

  const addError = (entry: Omit<ErrorEntry, 'id' | 'createdAt'>) => {
    const newError: ErrorEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: Date.now(),
      semester: entry.semester || currentSemester,
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
    return errors.filter(e => e.unitId === unitId && e.semester === currentSemester);
  };

  // 按学期过滤的错题
  const filteredErrors = errors.filter(e => e.semester === currentSemester);

  // 当前学期的单元
  const currentUnits = getUnitsForSemester(currentSemester);

  return (
    <DataContext.Provider
      value={{
        errors: filteredErrors,
        practiceSessions,
        currentSemester,
        availableSemesters: semesters,
        units: currentUnits,
        setSemester,
        addError,
        updateErrorStatus,
        deleteError,
        savePracticeResult,
        getErrorsByUnit,
      }}
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
