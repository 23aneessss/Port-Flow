/**
 * PORT FLOW DRIVER - Date Formatting Utilities
 */

/**
 * Format date to French locale: "JJ/MM/YYYY"
 */
export function formatDate(dateISO: string): string {
    const date = new Date(dateISO);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Format time to French locale: "HH:MM"
 */
export function formatTime(dateISO: string): string {
    const date = new Date(dateISO);
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format date and time: "JJ/MM/YYYY à HH:MM"
 */
export function formatDateTime(dateISO: string): string {
    return `${formatDate(dateISO)} à ${formatTime(dateISO)}`;
}

/**
 * Format time range: "HHh → HHh"
 */
export function formatTimeRange(startISO: string, endISO: string): string {
    const startTime = formatTime(startISO).replace(':', 'h');
    const endTime = formatTime(endISO).replace(':', 'h');
    return `${startTime} → ${endTime}`;
}

/**
 * Get relative time string (e.g., "il y a 5 minutes")
 */
export function getRelativeTime(dateISO: string): string {
    const date = new Date(dateISO);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return "à l'instant";
    } else if (diffMinutes < 60) {
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
        return 'hier';
    } else if (diffDays < 7) {
        return `il y a ${diffDays} jours`;
    } else {
        return formatDate(dateISO);
    }
}

/**
 * Check if date is today
 */
export function isToday(dateISO: string): boolean {
    const date = new Date(dateISO);
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(dateISO: string): boolean {
    const date = new Date(dateISO);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear()
    );
}

/**
 * Get friendly date label
 */
export function getFriendlyDateLabel(dateISO: string): string {
    if (isToday(dateISO)) {
        return "Aujourd'hui";
    } else if (isTomorrow(dateISO)) {
        return 'Demain';
    } else {
        return formatDate(dateISO);
    }
}
