export function dateToTime(date: Date): bigint {
    return BigInt(date.getTime()) * BigInt(1_000_000);
}

export function timeToDate(time: bigint): Date {
    return new Date(Number(time / BigInt(1_000_000)));
}

export function formatDateTime(time: bigint): string {
    const date = timeToDate(time);
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

export function formatDate(time: bigint): string {
    const date = timeToDate(time);
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium'
    }).format(date);
}
