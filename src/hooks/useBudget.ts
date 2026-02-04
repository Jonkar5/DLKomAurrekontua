
import { useState, useEffect } from 'react';
import type { Budget, BudgetItem, Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

const EMPTY_CLIENT: Client = {
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    nif: ''
};

const EMPTY_BUDGET: Budget = {
    id: '',
    number: '',
    clientId: '',
    clientData: EMPTY_CLIENT,
    date: new Date().toISOString(),
    items: [],
    subtotal: 0,
    ivaRate: 0.21,
    ivaAmount: 0,
    total: 0,
    notes: '',
    status: 'draft'
};

export const useBudget = (initialBudget?: Budget) => {
    const [budget, setBudget] = useState<Budget>(() => {
        // Try to load from localstorage first if no initialBudget is provided
        if (!initialBudget) {
            const saved = localStorage.getItem('current_budget_draft');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse saved draft", e);
                }
            }
        }
        return initialBudget || { ...EMPTY_BUDGET, id: uuidv4() };
    });

    // Save to localstorage whenever budget changes
    useEffect(() => {
        if (budget) {
            localStorage.setItem('current_budget_draft', JSON.stringify(budget));
        }
    }, [budget]);

    // Recalculate totals whenever items or IVA rate changes
    useEffect(() => {
        const subtotal = budget.items.reduce((acc, item) => acc + item.amount, 0);
        const ivaAmount = subtotal * budget.ivaRate;
        const total = subtotal + ivaAmount;

        setBudget(prev => {
            // Avoid infinite loop if totals are already correct
            if (Math.abs(prev.total - total) < 0.01 && Math.abs(prev.subtotal - subtotal) < 0.01) {
                return prev;
            }
            return {
                ...prev,
                subtotal,
                ivaAmount,
                total
            };
        });
    }, [budget.items, budget.ivaRate]);

    const updateClientData = (field: keyof Client, value: string) => {
        setBudget(prev => ({
            ...prev,
            clientData: {
                ...prev.clientData,
                [field]: value
            }
        }));
    };

    const addItem = (item: Omit<BudgetItem, 'id' | 'amount'>) => {
        const newItem: BudgetItem = {
            ...item,
            id: uuidv4(),
            amount: item.quantity * item.price
        };

        setBudget(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
        setBudget(prev => {
            const newItems = prev.items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate amount if quantity or price changes
                    if (field === 'quantity' || field === 'price') {
                        updatedItem.amount = updatedItem.quantity * updatedItem.price;
                    }
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, items: newItems };
        });
    };

    const removeItem = (id: string) => {
        setBudget(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const updateBudgetField = (field: keyof Budget, value: any) => {
        setBudget(prev => ({ ...prev, [field]: value }));
    };

    return {
        budget,
        setBudget,
        updateClientData,
        addItem,
        updateItem,
        removeItem,
        updateBudgetField
    };
};
