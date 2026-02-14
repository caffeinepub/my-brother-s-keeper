const ACCESS_CODE_KEY = 'mbk_emergency_access_code';

export function generateAccessCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i < 11) code += '-';
    }
    return code;
}

export function storeAccessCode(code: string): void {
    try {
        localStorage.setItem(ACCESS_CODE_KEY, code);
    } catch (error) {
        console.warn('Failed to store access code:', error);
    }
}

export function getStoredAccessCode(): string | null {
    try {
        return localStorage.getItem(ACCESS_CODE_KEY);
    } catch (error) {
        console.warn('Failed to retrieve access code:', error);
        return null;
    }
}

export function clearAccessCode(): void {
    try {
        localStorage.removeItem(ACCESS_CODE_KEY);
    } catch (error) {
        console.warn('Failed to clear access code:', error);
    }
}
