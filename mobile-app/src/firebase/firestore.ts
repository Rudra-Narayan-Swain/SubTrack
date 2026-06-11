import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    DocumentData,
    Unsubscribe,
} from 'firebase/firestore';
import { getDb } from './firebaseConfig';

export { where, orderBy, collection, doc };

export const getDocument = async <T>(col: string, id: string): Promise<T | null> => {
    const snap = await getDoc(doc(getDb(), col, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
};

export const getCollection = async <T>(col: string, constraints: any[] = []): Promise<T[]> => {
    const q = constraints.length > 0
        ? query(collection(getDb(), col), ...constraints)
        : collection(getDb(), col);
    const snap = await getDocs(q as any);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as T));
};

export const addDocument = async <T extends DocumentData>(col: string, data: T): Promise<string> => {
    const now = new Date().toISOString();
    const ref = await addDoc(collection(getDb(), col), { ...data, createdAt: now, updatedAt: now });
    return ref.id;
};

export const setDocument = async <T extends DocumentData>(col: string, id: string, data: T): Promise<void> => {
    await setDoc(doc(getDb(), col, id), { ...data, updatedAt: new Date().toISOString() });
};

export const updateDocument = async (col: string, id: string, data: Partial<DocumentData>): Promise<void> => {
    await updateDoc(doc(getDb(), col, id), { ...data, updatedAt: new Date().toISOString() });
};

export const deleteDocument = async (col: string, id: string): Promise<void> => {
    await deleteDoc(doc(getDb(), col, id));
};

export const subscribeToQuery = <T>(
    col: string,
    constraints: any[],
    onData: (items: T[]) => void
): Unsubscribe => {
    const q = query(collection(getDb(), col), ...constraints);
    return onSnapshot(q, (snap) => {
        onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
    });
};
