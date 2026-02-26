const MEETUP_CODE_KEY = 'mbk_meetup_share_code';

export function generateMeetupShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i < 7) code += '-';
    }
    return code;
}

export function storeMeetupShareCode(code: string): void {
    try {
        localStorage.setItem(MEETUP_CODE_KEY, code);
    } catch (error) {
        console.warn('Failed to store meetup share code:', error);
    }
}

export function getStoredMeetupShareCode(): string | null {
    try {
        return localStorage.getItem(MEETUP_CODE_KEY);
    } catch (error) {
        console.warn('Failed to retrieve meetup share code:', error);
        return null;
    }
}

export function clearMeetupShareCode(): void {
    try {
        localStorage.removeItem(MEETUP_CODE_KEY);
    } catch (error) {
        console.warn('Failed to clear meetup share code:', error);
    }
}
