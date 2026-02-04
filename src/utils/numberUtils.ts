
export const parseNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;

    // Handle strings
    // 1. Replace all commas with dots
    // 2. Remove any other non-numeric characters except dot and minus (for negative)
    // Note: This assumes no thousands separators like "1.000,00". 
    // Ideally we should strip thousands separators if we knew the locale.
    // For now, simple replacement of comma to dot is usually enough for "10,5"

    const cleanStr = value.toString().replace(/,/g, '.');
    // Check if it has multiple dots? explicit handling might be better

    const floatVal = parseFloat(cleanStr);
    return isNaN(floatVal) ? 0 : floatVal;
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(value);
};

export const formatDecimal = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};
