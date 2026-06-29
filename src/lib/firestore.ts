import { db } from './firebase';
import { Task, UserStats } from '../types';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

export const saveTaskToDb = async (task: Task): Promise<void> => {
  if (!db) return;
  await setDoc(doc(db, 'tasks', task.id), task);
};

export const deleteTaskFromDb = async (id: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, 'tasks', id));
};

export const fetchTasksFromDb = async (userId: string): Promise<Task[]> => {
  if (!db) return [];
  const q = query(collection(db, 'tasks'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const tasks: Task[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push(doc.data() as Task);
  });
  return tasks;
};

export const saveStatsToDb = async (userId: string, stats: UserStats): Promise<void> => {
  if (!db) return;
  await setDoc(doc(db, 'user_stats', userId), stats);
};

export const fetchStatsFromDb = async (userId: string): Promise<UserStats | null> => {
  if (!db) return null;
  const docRef = doc(db, 'user_stats', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserStats;
  }
  return null;
};
