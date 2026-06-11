import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    onSnapshot,
    Unsubscribe,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ─── Generic Helpers ─────────────────────────────────────────────────────────

export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
    const snap = await getDoc(doc(db, collectionName, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
};

export const getCollection = async <T>(
    collectionName: string,
    constraints: Parameters<typeof query>[1][] = []
): Promise<T[]> => {
    const q = query(collection(db, collectionName), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

export const addDocument = async <T extends DocumentData>(
    collectionName: string,
    data: T
): Promise<string> => {
    const ref = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    return ref.id;
};

export const updateDocument = async (
    collectionName: string,
    id: string,
    data: Partial<DocumentData>
): Promise<void> => {
    await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString(),
    });
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
    await deleteDoc(doc(db, collectionName, id));
};

export const subscribeToCollection = <T>(
    collectionName: string,
    constraints: Parameters<typeof query>[1][],
    callback: (data: T[]) => void
): Unsubscribe => {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
    });
};

// Re-export query helpers for use in services
export { where, orderBy, limit, startAfter, QueryDocumentSnapshot, Timestamp, db, collection, query, getDocs };
