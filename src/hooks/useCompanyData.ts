
import { useState, useEffect } from 'react';
import type { CompanyConfig } from '../types';
import { budgetService } from '../services/budgetService';

const STORAGE_KEY = 'dlkom_company_config';

const INITIAL_CONFIG: CompanyConfig = {
    name: '',
    address: '',
    phone: '',
    email: '',
    cif: '',
    logoUrl: '',
    sealUrl: '',
    defaultNotes: 'El presupuesto tiene una validez de 30 días.\nForma de pago: 50% al aceptar, 50% al finalizar.',
    paymentTerms: '50% A la aceptación del presupuesto\n50% A la finalización de los trabajos'
};

export const useCompanyData = () => {
    const [companyData, setCompanyData] = useState<CompanyConfig>(INITIAL_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Load Local first for speed
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setCompanyData(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse local company data', e);
                }
            }

            // 2. Try to sync with Firebase
            const remoteConfig = await budgetService.getCompanyConfig();
            if (remoteConfig) {
                setCompanyData(remoteConfig);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConfig));
            }
            setLoading(false);
        };

        loadConfig();
    }, []);

    const saveCompanyData = async (data: CompanyConfig) => {
        try {
            setCompanyData(data);
            // Save local
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            // Save remote
            await budgetService.saveCompanyConfig(data);
            return true;
        } catch (e: any) {
            console.error('Error saving company data', e);
            alert("Error al guardar en la nube: " + (e.message || "Permiso denegado o archivo muy pesado"));
            return false;
        }
    };

    const updateLogo = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            await saveCompanyData({ ...companyData, logoUrl: result });
        };
        reader.readAsDataURL(file);
    };

    const updateSeal = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            await saveCompanyData({ ...companyData, sealUrl: result });
        };
        reader.readAsDataURL(file);
    };

    return {
        companyData,
        loading,
        saveCompanyData,
        updateLogo,
        updateSeal
    };
};
