
export interface CompanyConfig {
    id?: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    cif: string;
    logoUrl?: string;
    sealUrl?: string; // The "sello" for the pdf
    defaultNotes: string;
    paymentTerms: string; // "Porcentajes de la forma de pago"
}

export interface Client {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    nif: string;
    postalCode?: string;
    city?: string;
}

export interface Budget {
    id: string;
    number: string; // e.g. 2026-001
    clientId: string;
    clientData: Client; // Snapshot of client data at time of budget
    date: string;
    items: BudgetItem[];
    subtotal: number;
    ivaRate: number; // e.g. 0.21
    ivaAmount: number;
    total: number;
    notes: string;
    status: 'draft' | 'pending' | 'accepted' | 'rejected';
    clientSignature?: string; // DataURL
}

export interface BudgetItem {
    id: string;
    group: string; // "OBRA CIVIL", "DECORACION", "VARIOS"
    category: string;
    description: string;
    quantity: number;
    price: number;
    amount: number;
    costPrice?: number; // Precio de coste
}

export interface GroupCategory {
    name: string;
    categories: string[];
}

export interface MasterData {
    groups: GroupCategory[];
}
