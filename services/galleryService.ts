
import { GalleryNovelMetadata, GalleryFilter, Project, NovelVisibility, SupabaseConfig } from '../types';
import { getSupabaseClient } from './supabaseClient';
import { getUserId } from './identityService';
import SHA256 from 'crypto-js/sha256';

// Helper to count words (same as App.tsx)
const countProjectWords = (project: Project): number => {
    return project.chapters.reduce((acc, chap) => {
        return acc + chap.scenes.reduce((sAcc, s) => {
             const text = s.content || "";
             const cjkCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
             const nonCJKText = text.replace(/[\u4e00-\u9fa5]/g, ' ');
             const spaceSeparatedCount = nonCJKText.split(/\s+/).filter(w => w.length > 0).length;
             return sAcc + cjkCount + spaceSeparatedCount;
        }, 0);
    }, 0);
};

// Helper to generate UUID
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// --- HASHING UTILITY ---

export const computeProjectHash = async (project: Project): Promise<string> => {
    const cleanContent = {
        title: project.title,
        author: project.author,
        genre: project.genre,
        subgenre: project.subgenre,
        lang: project.writingLanguage,
        chapters: project.chapters.map(c => ({
            title: c.title,
            scenes: c.scenes.map(s => ({
                title: s.title,
                content: s.content,
                summary: s.summary
            }))
        })),
        codex: project.codex.map(e => ({
            name: e.name,
            cat: e.category,
            desc: e.description,
            tags: e.tags
        }))
    };

    const jsonStr = JSON.stringify(cleanContent);
    return SHA256(jsonStr).toString();
}

// --- API ---

export const fetchGalleryNovels = async (
    filter: GalleryFilter, 
    config: SupabaseConfig,
    page: number = 0,
    limit: number = 12
): Promise<GalleryNovelMetadata[]> => {
    const supabase = getSupabaseClient(config);
    if (!supabase) {
        throw new Error("Supabase not configured");
    }

    let query = supabase
        .from('novels')
        .select(`
            id, title, author, genre, subgenre, description, word_count, visibility, likes, downloads, published_at, tags, content_hash, owner_id
        `);

    // Scope Filtering
    const userId = getUserId();
    if (filter.scope === 'mine') {
        // Show EVERYTHING that belongs to me (public OR private)
        query = query.eq('owner_id', userId);
    } else {
        // Show ONLY PUBLIC items from everyone
        query = query.eq('visibility', 'public');
    }

    // Filter by genre
    if (filter.genre && filter.genre !== 'All') {
        query = query.eq('genre', filter.genre);
    }

    // Filter by search text (Simple ILIKE)
    if (filter.search) {
        query = query.ilike('title', `%${filter.search}%`);
    }

    // Sort
    if (filter.sort === 'popular') {
        query = query.order('likes', { ascending: false });
    } else {
        query = query.order('published_at', { ascending: false });
    }

    // Pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
    }

    return (data || []).map((row: any) => {
        return {
            id: row.id,
            title: row.title,
            author: row.author,
            genre: row.genre,
            subgenre: row.subgenre,
            description: row.description,
            wordCount: row.word_count,
            visibility: row.visibility as NovelVisibility,
            likes: row.likes,
            downloads: row.downloads,
            publishedAt: row.published_at, 
            tags: row.tags || [],
            contentHash: row.content_hash,
            ownerId: row.owner_id
        };
    });
};

export const publishNovelToGallery = async (project: Project, visibility: NovelVisibility, config: SupabaseConfig): Promise<boolean> => {
    const supabase = getSupabaseClient(config);
    if (!supabase) {
        throw new Error("Supabase Client Init Failed: Check URL/Key format.");
    }

    console.log("[GalleryService] Initiating publish to:", config.url);
    const userId = getUserId();
    console.log("[GalleryService] Publishing as User:", userId);
    
    // 1. Compute Hash
    const hash = await computeProjectHash(project);

    // 2. Check for Duplicates
    const { data: existing } = await supabase
        .from('novels')
        .select('id, owner_id, visibility')
        .eq('content_hash', hash);

    // If an exact copy exists
    if (existing && existing.length > 0) {
        const match = existing[0];
        
        // Handle ownership check
        if (match.owner_id === userId) {
             console.log("[GalleryService] Exact content already published by user.");
             
             // If visibility changed (e.g. from private to public), update it
             if (match.visibility !== visibility) {
                 console.log(`[GalleryService] Updating visibility to ${visibility}`);
                 const { error: updateError } = await supabase
                    .from('novels')
                    .update({ visibility: visibility })
                    .eq('id', match.id);
                 
                 if (updateError) throw updateError;
             }
             
             // Treat as success (idempotent)
             return true;
        }

        console.warn("[GalleryService] Duplicate hash found from another user.");
        throw new Error("This exact version of the novel already exists in the Gallery.");
    }

    // Use UUID
    const id = generateUUID();

    // Prepare payload
    const payload = {
        id: id, 
        title: project.title,
        author: project.author,
        genre: project.genre || 'Fiction',
        subgenre: project.subgenre,
        description: project.chapters[0]?.scenes[0]?.summary || "No description provided.",
        word_count: countProjectWords(project),
        visibility: visibility,
        likes: 0,
        downloads: 0,
        published_at: Date.now(), 
        tags: [],
        content_hash: hash, 
        owner_id: userId, // MARK IDENTITY
        content: { ...project, contentHash: hash } 
    };

    const { data, error } = await supabase
        .from('novels')
        .insert(payload)
        .select(); 

    if (error) {
        console.error("[GalleryService] Supabase INSERT error:", error);
        throw error; 
    }

    return true;
};

export const likeNovel = async (novelId: string, currentLikes: number, config: SupabaseConfig): Promise<number> => {
    const supabase = getSupabaseClient(config);
    if (!supabase) return currentLikes;

    // Use .then(success, fail) instead of .catch because builder might not have catch
    return new Promise((resolve, reject) => {
        supabase.rpc('increment_likes', { row_id: novelId })
            .then((res: any) => {
                if (res.error) {
                    // Fallback to manual update
                    manualLikeUpdate(supabase, novelId, currentLikes)
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve(currentLikes + 1);
                }
            }, () => {
                // Network error or RPC missing -> Fallback
                manualLikeUpdate(supabase, novelId, currentLikes)
                    .then(resolve)
                    .catch(reject);
            });
    });
};

const manualLikeUpdate = async (supabase: any, novelId: string, currentLikes: number) => {
    const { error: updateError } = await supabase
        .from('novels')
        .update({ likes: currentLikes + 1 })
        .eq('id', novelId);
        
    if (updateError) throw updateError;
    return currentLikes + 1;
}

export const importNovelFromGallery = async (novelId: string, config: SupabaseConfig): Promise<Project | null> => {
    const supabase = getSupabaseClient(config);
    if (!supabase) {
        throw new Error("Supabase not configured");
    }

    const { data, error } = await supabase
        .from('novels')
        .select('*')
        .eq('id', novelId)
        .single();

    if (error || !data) {
        console.error("Supabase import error:", error);
        return null;
    }

    // Fire and forget download count
    const fallbackIncrement = () => {
        supabase
            .from('novels')
            .update({ downloads: data.downloads + 1 })
            .eq('id', novelId)
            .then();
    };

    // Fix: Use .then(onSuccess, onError) instead of .catch directly on builder
    // because PostgrestFilterBuilder might not implement catch in all environments.
    supabase.rpc('increment_downloads', { row_id: novelId }).then(
        (res: any) => {
            if (res.error) fallbackIncrement();
        },
        (err: any) => {
            fallbackIncrement();
        }
    );

    const projectData = data.content as Project;
    
    const importedProject: Project = {
        ...projectData,
        id: `imported_${Date.now()}_${projectData.id.slice(0,5)}`
    };

    return importedProject;
}
