
import { useState, useEffect } from 'react';
import type { CompanyConfig } from '../types';

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
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setCompanyData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse company data', e);
            }
        }
        setLoading(false);
    }, []);

    const saveCompanyData = (data: CompanyConfig) => {
        setCompanyData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const updateLogo = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            saveCompanyData({ ...companyData, logoUrl: result });
        };
        reader.readAsDataURL(file);
    };

    const updateSeal = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            saveCompanyData({ ...companyData, sealUrl: result });
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
