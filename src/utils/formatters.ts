
export const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 9 digits (standard Spanish phone)
    const truncated = numbers.slice(0, 9);

    // Format as XXX XX XX XX
    if (truncated.length > 3) {
        if (truncated.length > 5) {
            if (truncated.length > 7) {
                return `${truncated.slice(0, 3)} ${truncated.slice(3, 5)} ${truncated.slice(5, 7)} ${truncated.slice(7)}`;
            }
            return `${truncated.slice(0, 3)} ${truncated.slice(3, 5)} ${truncated.slice(5)}`;
        }
        return `${truncated.slice(0, 3)} ${truncated.slice(3)}`;
    }

    return truncated;
};

export const formatTaxID = (value: string): string => {
    // Uppercase and remove spaces/hyphens
    let clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Standard NIF/CIF length is 9
    return clean.slice(0, 9);
};

export const isValidTaxID = (value: string): boolean => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Basic regex: Letter+8digits OR 8digits+Letter (simplified)
    const nifRegex = /^[0-9]{8}[A-Z]$/;
    const cifRegex = /^[A-Z][0-9]{7}[A-Z0-9]$/;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

    return nifRegex.test(clean) || cifRegex.test(clean) || nieRegex.test(clean);
};

export const isValidPhone = (value: string): boolean => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 9;
};
