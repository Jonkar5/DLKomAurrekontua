
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { Budget } from '../types';

const COLLECTION = 'budgets';
const LOCAL_STORAGE_KEY = 'dlkom_budgets_backup';

// Helper to get local budgets
const getLocalBudgets = (): Budget[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

// Helper to save local budgets
const saveLocalBudgets = (budgets: Budget[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(budgets));
};

export const budgetService = {
    getAll: async (): Promise<Budget[]> => {
        try {
            // Try Firebase
            const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            const budgets = snapshot.docs.map(doc => doc.data() as Budget);

            // Update local backup
            // saveLocalBudgets(budgets); 
            // return budgets;

            // FALLBACK FOR DEV WITHOUT KEYS:
            // If firebase fails (likely due to missing config), return local
            if (budgets.length === 0) return getLocalBudgets();
            return budgets;
        } catch (e) {
            console.warn("Firebase fetch failed, using local storage", e);
            return getLocalBudgets();
        }
    },

    getById: async (id: string): Promise<Budget | null> => {
        try {
            const docRef = doc(db, COLLECTION, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return snapshot.data() as Budget;
            }
        } catch (e) {
            console.warn("Firebase get failed", e);
        }
        // Fallback
        const local = getLocalBudgets();
        return local.find(b => b.id === id) || null;
    },

    save: async (budget: Budget): Promise<void> => {
        try {
            await setDoc(doc(db, COLLECTION, budget.id), budget);
        } catch (e) {
            console.warn("Firebase save failed", e);
        }
        // Always save local
        const local = getLocalBudgets();
        const index = local.findIndex(b => b.id === budget.id);
        if (index >= 0) {
            local[index] = budget;
        } else {
            local.push(budget);
        }
        saveLocalBudgets(local);
    },

    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
        } catch (e) {
            console.warn("Firebase delete failed", e);
        }
        // Delete local
        const local = getLocalBudgets().filter(b => b.id !== id);
        saveLocalBudgets(local);
    }
};
