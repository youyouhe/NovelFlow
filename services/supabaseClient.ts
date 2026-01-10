
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

let supabaseInstance: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;

export const getSupabaseClient = (config: SupabaseConfig): SupabaseClient | null => {
    // If config hasn't changed and instance exists, return it
    if (supabaseInstance && currentConfig && currentConfig.url === config.url && currentConfig.anonKey === config.anonKey) {
        return supabaseInstance;
    }

    if (!config.url || !config.anonKey) {
        return null;
    }

    try {
        supabaseInstance = createClient(config.url, config.anonKey);
        currentConfig = config;
        return supabaseInstance;
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
        return null;
    }
};
