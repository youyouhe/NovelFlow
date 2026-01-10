
// A simple service to identify the user without a full auth backend.
// We generate a UUID and store it in localStorage.

const STORAGE_KEY = 'novelflow_identity_id';

export const getUserId = (): string => {
    if (typeof window === 'undefined') return 'unknown_user';

    let id = localStorage.getItem(STORAGE_KEY);
    
    if (!id) {
        // Generate a new ID if one doesn't exist
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            id = crypto.randomUUID();
        } else {
            // Fallback for older browsers
            id = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        localStorage.setItem(STORAGE_KEY, id);
    }
    
    return id;
};

// Allow user to manually set ID (e.g. to sync across devices)
export const setUserId = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
};
