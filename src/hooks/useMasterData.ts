
import { useState, useEffect } from 'react';
import type { MasterData, GroupCategory } from '../types';

const STORAGE_KEY = 'dlkom_master_data';

const DEFAULT_GROUPS: GroupCategory[] = [
    {
        name: "OBRA CIVIL",
        categories: ["Albañilería", "Demoliciones", "Fontanería", "Electricidad", "Carpintería Metálica", "Carpintería Madera"]
    },
    {
        name: "DECORACION",
        categories: ["Mobiliario Cocina", "Mobiliario Baño", "Iluminación", "Textil", "Pintura Decorativa"]
    },
    {
        name: "VARIOS",
        categories: ["Limpieza", "Transporte", "Tasas", "Otros"]
    }
];

export const useMasterData = () => {
    const [masterData, setMasterData] = useState<MasterData>({ groups: DEFAULT_GROUPS });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setMasterData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse master data', e);
            }
        }
        setLoading(false);
    }, []);

    const saveMasterData = (data: MasterData) => {
        setMasterData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const addGroup = (groupName: string) => {
        if (masterData.groups.some(g => g.name === groupName)) return;
        saveMasterData({
            groups: [...masterData.groups, { name: groupName, categories: [] }]
        });
    };

    const deleteGroup = (groupName: string) => {
        saveMasterData({
            groups: masterData.groups.filter(g => g.name !== groupName)
        });
    };

    const addCategory = (groupName: string, categoryName: string) => {
        const newGroups = masterData.groups.map(g => {
            if (g.name === groupName) {
                if (g.categories.includes(categoryName)) return g;
                return { ...g, categories: [...g.categories, categoryName] };
            }
            return g;
        });
        saveMasterData({ groups: newGroups });
    };

    const deleteCategory = (groupName: string, categoryName: string) => {
        const newGroups = masterData.groups.map(g => {
            if (g.name === groupName) {
                return { ...g, categories: g.categories.filter(c => c !== categoryName) };
            }
            return g;
        });
        saveMasterData({ groups: newGroups });
    };

    return {
        masterData,
        loading,
        addGroup,
        deleteGroup,
        addCategory,
        deleteCategory,
        saveMasterData
    };
};
