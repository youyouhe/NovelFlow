
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CodexEntry, ChatMessage, WritingLanguage, AIConfig, SmartContinuationResponse, StoryStructureContext, CodexCategory, Scene, Chapter } from "../types";
import { AI_LENGTHS, AI_CONTEXT_SIZES, AI_CONTINUATION_MODES } from "../constants";

// Helper to format codex
const formatCodexForAI = (codex: CodexEntry[]): string => {
  if (codex.length === 0) return "No Codex entries available.";
  
  return codex.map(entry => `
    [Category: ${entry.category}]
    Name: ${entry.name}
    Description: ${entry.description}
    Tags: ${entry.tags.join(', ')}
  `).join('\n---\n');
};

const getLangInstruction = (lang: WritingLanguage): string => {
    const map: Record<string, string> = {
        'en': 'English',
        'zh': 'Simplified Chinese (简体中文)',
        'ja': 'Japanese (日本語)',
        'ko': 'Korean (한국어)',
        'es': 'Spanish (Español)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'it': 'Italian (Italiano)',
        'ru': 'Russian (Русский)',
        'pt': 'Portuguese (Português)'
    };
    return `IMPORTANT: You MUST write the output in ${map[lang] || 'English'}.`;
}

// Prepare Structure Context
const formatStructureContext = (struct?: StoryStructureContext): string => {
    if (!struct) return "";
    const currentPageInfo = struct.currentPageIndex !== undefined 
        ? `Currently Editing: Page ${struct.currentPageIndex + 1} of ${struct.currentScenePageCount ?? 0}`
        : '';
    return `
    === STORY STRUCTURE ===
    Project: ${struct.projectTitle}
    Genre: ${struct.genre} ${struct.subgenre ? `(${struct.subgenre})` : ''}
    Current Chapter: ${struct.chapterTitle}
    Current Scene: ${struct.sceneTitle} (Scene ${struct.sceneIndex + 1} of ${struct.totalScenesInChapter} in this chapter)
    Current Scene Stats: ${struct.currentSceneWordCount ?? 0} words, ${struct.currentScenePageCount ?? 0} pages.
    ${currentPageInfo ? `${currentPageInfo}.` : ''}
    ${struct.previousSceneSummary ? `Previous Scene Summary: ${struct.previousSceneSummary}` : ''}
    =======================
    `;
}

const decideActionType = async (
    currentText: string,
    codex: CodexEntry[],
    language: WritingLanguage,
    config: AIConfig,
    structureContext?: StoryStructureContext
): Promise<'continue' | 'new_scene' | 'new_chapter'> => {
    try {
        const codexContext = formatCodexForAI(codex);
        const structContext = formatStructureContext(structureContext);
        const langInstruction = getLangInstruction(language);
        
        const wordCount = structureContext?.currentSceneWordCount || 0;
        const pageCount = structureContext?.currentScenePageCount || 0;
        const totalScenes = structureContext?.totalScenesInChapter || 0;
        
        const targetSceneWords = config.targetSceneWordCount || 2000;
        const targetScenesPerChapter = config.targetSceneCountPerChapter || 5;
        
        let pacingInstruction = "";
        const targetChapterWords = targetSceneWords * targetScenesPerChapter;
        
        if (wordCount > targetChapterWords * 1.5 || totalScenes > targetScenesPerChapter * 1.5) {
            pacingInstruction = `PACING ALERT: This chapter is extremely long (>${Math.floor(targetChapterWords * 1.5)} words or >${Math.floor(targetScenesPerChapter * 1.5)} scenes). Strongly recommend 'new_chapter'.`;
        } else if (wordCount > targetChapterWords || totalScenes > targetScenesPerChapter) {
            pacingInstruction = `PACING GUIDE: This chapter is getting long (>${targetChapterWords} words or >${targetScenesPerChapter} scenes). Consider 'new_chapter'.`;
        } else if (wordCount > targetSceneWords * 1.25) {
            pacingInstruction = `PACING ALERT: The current scene is very long (>${Math.floor(targetSceneWords * 1.25)} words). Strongly recommend 'new_scene'.`;
        } else if (wordCount > targetSceneWords * 0.75) {
            pacingInstruction = `PACING GUIDE: The current scene is getting long (>${Math.floor(targetSceneWords * 0.75)} words). Consider 'new_scene'.`;
        } else {
            pacingInstruction = "PACING GUIDE: The current scene is still developing. 'continue' unless there's a time jump or location change.";
        }

        const systemPrompt = `You are a story structure analyst. Analyze the current writing state and determine what action should be taken next.
        
        ${structContext}
        ${pacingInstruction}

        === SCENE COMPLETION CRITERIA ===
        A SCENE should trigger 'new_scene' when:
        1. The immediate conflict/goal is resolved
        2. A significant time jump occurs (hours, days, or later)
        3. Location changes to a different setting
        4. A new conversation starts with a different character focus
        5. The narrative perspective shifts from one character to another

        A CHAPTER should trigger 'new_chapter' when:
        1. A major story arc resolves (not just a scene goal)
        2. A time gap of days/weeks/months occurs
        3. The story moves to a completely new location/setting
        4. A major revelation/climax has been delivered
        5. The narrative structure shifts (e.g., Part 1 → Part 2)

        ${langInstruction}
        
        === CODEX (for context) ===
        ${codexContext}`;

        const limitedText = sliceContextByConfig(currentText, config);
        
        const userPrompt = `
        Current Story Context (truncated):
        "${limitedText}"

        Task: Based on the story context and criteria above, determine the most appropriate next action.
        
        Respond with EXACTLY ONE word only (no explanation, no punctuation):
        continue
        new_scene
        new_chapter
        `;

        if (config.provider === 'deepseek') {
            const result = await callDeepSeek(config, [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], 50, 0.3, false);
            
            const trimmed = result.trim().toLowerCase();
            if (['continue', 'new_scene', 'new_chapter'].includes(trimmed as any)) {
                return trimmed as 'continue' | 'new_scene' | 'new_chapter';
            }
            return 'continue';
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.3,
                    maxOutputTokens: 50
                }
            });
            
            const text = response.text?.trim().toLowerCase() || '';
            if (['continue', 'new_scene', 'new_chapter'].includes(text as any)) {
                return text as 'continue' | 'new_scene' | 'new_chapter';
            }
            return 'continue';
        }
    } catch (e) {
        console.error("Action decision failed:", e);
        return 'continue';
    }
};

// Slice text based on config
const sliceContextByConfig = (text: string, config: AIConfig): string => {
    const sizeId = config.contextSize || 'medium';
    const limit = AI_CONTEXT_SIZES.find(s => s.id === sizeId)?.chars || 3000;
    return text.slice(-limit);
}

// Helper to clean JSON string from Markdown
const parseTagsString = (str: string): string[] => {
    if (!str) return [];
    // Remove quotes from individual tags
    return str.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(s => s);
};

const cleanJsonString = (str: string): string => {
    if (!str) return "";
    
    // Remove markdown code blocks like ```json ... ``` or just ``` ... ``` at start/end
    let cleaned = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // If still not valid JSON, try to extract first JSON object/array from text
    try {
        JSON.parse(cleaned);
        return cleaned;
    } catch {
        // Try to find first complete JSON object {...} or array [...]
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try {
                JSON.parse(arrayMatch[0]);
                return arrayMatch[0];
            } catch {}
        }
        
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                JSON.parse(objectMatch[0]);
                return objectMatch[0];
            } catch {}
        }
    }
    
    return cleaned;
}

// Robust Parser for Smart Responses
const parseSmartResponse = (text: string): SmartContinuationResponse => {
    const cleaned = cleanJsonString(text);
    
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("JSON parse failed, attempting regex recovery:", e);
        
        // Regex recovery for content: Matches "content": "..." allowing for escaped quotes
        // We capture until the next unescaped quote OR end of string (if truncated)
        const contentMatch = cleaned.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/s);
        
        if (contentMatch) {
            let content = contentMatch[1];
            // Decode JSON escapes
            try {
                // Wrap in quotes to use JSON.parse for correct unescaping
                // This handles \n, \", \uXXXX etc. correctly
                content = JSON.parse(`"${content}"`);
            } catch {
                // Manual unescape if strict parse fails (e.g. truncated end)
                 content = content
                    .replace(/\\n/g, '\n')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\t/g, '\t');
            }

            // Default to 'continue' action
            const actionMatch = cleaned.match(/"action"\s*:\s*"([^"]+)"/);
            const action = (actionMatch && ['continue', 'new_scene', 'new_chapter'].includes(actionMatch[1]))
                ? actionMatch[1] as any
                : 'continue';

             const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);

            return {
                action: action,
                title: titleMatch ? titleMatch[1] : undefined,
                content: content
            };
        }
        
        // If even regex failed, check if it's just raw text (fallback)
        if (!cleaned.trim().startsWith('{')) {
             return { action: 'continue', content: cleaned };
        }

        throw e;
    }
}

// DeepSeek specific caller
const callDeepSeek = async (
    config: AIConfig,
    messages: { role: string, content: string }[],
    maxTokens: number = 2048,
    temperature: number = 1.0,
    jsonMode: boolean = false
): Promise<string> => {
    const apiKey = config.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DeepSeek API Key missing. Please configure it in Settings or environment.");

    const sanitizedApiKey = apiKey.trim();

    if (!/^[\x20-\x7E]+$/.test(sanitizedApiKey)) {
        throw new Error("API Key contains invalid characters. Please check your DeepSeek API key.");
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sanitizedApiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            stream: false,
            max_tokens: maxTokens,
            temperature: temperature,
            response_format: jsonMode ? { type: "json_object" } : undefined
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`DeepSeek API Error: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// Basic text generation (for Rewrite or simple completion)
export const generateStoryContinuation = async (
  currentText: string,
  codex: CodexEntry[],
  instruction: string = "Continue the story naturally.",
  language: WritingLanguage = 'en',
  config: AIConfig,
  structureContext?: StoryStructureContext
): Promise<string> => {
  try {
    const codexContext = formatCodexForAI(codex);
    const structContext = formatStructureContext(structureContext);
    const langInstruction = getLangInstruction(language);
    
    const lengthConfig = AI_LENGTHS.find(l => l.id === (config.continuationLength || 'medium')) || AI_LENGTHS[1];
    const maxTokens = lengthConfig.tokens;
    const lengthInstruction = language === 'zh' ? lengthConfig.instruction.zh : lengthConfig.instruction.en;

    const limitedText = sliceContextByConfig(currentText, config);

    // Dynamic indentation logic
    const isCJK = ['zh', 'ja', 'ko'].includes(language);
    const indentSpaces = isCJK ? 4 : 2;
    const indentExample = " ".repeat(indentSpaces);

    const systemPrompt = `You are an expert fiction co-author. 
    ${langInstruction}
    ${lengthInstruction}
    ${structContext}
    
    CRITICAL FORMATTING RULES:
    1. Use DOUBLE LINE BREAKS (\\n\\n) to separate paragraphs.
    2. Indent the beginning of EVERY paragraph with ${indentSpaces} spaces (e.g. "${indentExample}The story...").
    3. Do NOT output dense "walls of text".
    4. Use the Codex to ensure consistency.
    
    === CODEX ===
    ${codexContext}`;

    const userPrompt = `Context: "${limitedText}"\nInstruction: ${instruction}`;

    if (config.provider === 'deepseek') {
        return await callDeepSeek(config, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], maxTokens);
    } else {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.8,
                maxOutputTokens: maxTokens,
            }
        });
        return response.text || "";
    }
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};

// SMART CONTINUATION: Determines if it should be a new scene/chapter
export const generateSmartContinuation = async (
    currentText: string,
    codex: CodexEntry[],
    instruction: string,
    language: WritingLanguage,
    config: AIConfig,
    structureContext?: StoryStructureContext
): Promise<SmartContinuationResponse> => {
    try {
        const codexContext = formatCodexForAI(codex);
        const structContext = formatStructureContext(structureContext);
        const langInstruction = getLangInstruction(language);
        
        const currentMode = config.continuationMode || 'general';
        const modeConfig = AI_CONTINUATION_MODES.find(m => m.id === currentMode);
        
        // Step 1: Determine action (either from explicit action or AI decision)
        let determinedAction: 'continue' | 'new_scene' | 'new_chapter';
        
        if (config.explicitAction) {
            determinedAction = config.explicitAction;
        } else {
            determinedAction = await decideActionType(currentText, codex, language, config, structureContext);
        }
        
        // Step 2: Prepare generation parameters
        const modeDefaultIgnoreLength = modeConfig?.ignoreLength || false;
        const userOverrideIgnoreLength = config.modeLengthOverrides?.[currentMode] ?? false;
        const ignoreLength = modeDefaultIgnoreLength || userOverrideIgnoreLength;
        
        const lengthConfig = AI_LENGTHS.find(l => l.id === (config.continuationLength || 'medium')) || AI_LENGTHS[1];
        const lengthInstruction = ignoreLength 
            ? "" 
            : (language === 'zh' ? lengthConfig.instruction.zh : lengthConfig.instruction.en);
        
        const limitedText = sliceContextByConfig(currentText, config);

        // Dynamic indentation logic
        const isCJK = ['zh', 'ja', 'ko'].includes(language);
        const indentSpaces = isCJK ? 4 : 2;

        const wordCount = structureContext?.currentSceneWordCount || 0;
        const pageCount = structureContext?.currentScenePageCount || 0;
        const totalScenes = structureContext?.totalScenesInChapter || 0;
        
        const targetSceneWords = config.targetSceneWordCount || 2000;
        const targetScenesPerChapter = config.targetSceneCountPerChapter || 5;
        
        let pacingInstruction = "";

        const targetChapterWords = targetSceneWords * targetScenesPerChapter;
        
        if (wordCount > targetChapterWords * 1.5 || totalScenes > targetScenesPerChapter * 1.5) {
            pacingInstruction = `PACING ALERT: This chapter is extremely long (>${Math.floor(targetChapterWords * 1.5)} words or >${Math.floor(targetScenesPerChapter * 1.5)} scenes). You MUST conclude the current narrative arc and output 'new_chapter' to start a fresh chapter.`;
        } else if (wordCount > targetChapterWords || totalScenes > targetScenesPerChapter) {
            pacingInstruction = `PACING GUIDE: This chapter is getting long (>${targetChapterWords} words or >${targetScenesPerChapter} scenes). Look for opportunities to conclude the current arc and transition to a 'new_chapter'.`;
        } else if (wordCount > targetSceneWords * 1.25) {
            pacingInstruction = `PACING ALERT: The current scene is very long (>${Math.floor(targetSceneWords * 1.25)} words). Unless this is a climactic moment, you should aggressively move to wrap up the scene and output 'new_scene'.`;
        } else if (wordCount > targetSceneWords * 0.75) {
            pacingInstruction = `PACING GUIDE: The current scene is getting long (>${Math.floor(targetSceneWords * 0.75)} words). Look for opportunities to conclude the scene and transition to a 'new_scene'.`;
        } else {
            pacingInstruction = "PACING GUIDE: The current scene is still developing. Continue naturally, but if a time jump or location change is needed, use 'new_scene'.";
        }

        const systemPrompt = `You are a smart novel writing assistant.
        Generate content based on the determined action.
        
        DETERMINED ACTION: ${determinedAction}
        
        Action Guidelines:
        1. 'continue': Continue the current scene naturally.
        2. 'new_scene': Gracefully conclude the current scene, then start a NEW SCENE with proper transition.
        3. 'new_chapter': Conclude the current narrative arc, then start a NEW CHAPTER with a title.
        
        ${structContext}
        ${pacingInstruction}

        ${langInstruction}
        ${lengthInstruction}
        ${ignoreLength ? "NOTE: For this continuation mode, you are NOT constrained by a specific word count. Generate as much or as little as needed for the scene." : ""}
        
        CRITICAL FORMATTING RULES:
        - When generating 'content', strictly use DOUBLE LINE BREAKS (\\n\\n) to separate paragraphs.
        - Start EVERY paragraph in 'content' with ${indentSpaces} spaces.
        - Ensure the output is readable and not a dense block of text.
        
        === CODEX ===
        ${codexContext}`;

        const userPrompt = `
        Current Story Context:
        "${limitedText}"
        
        User Instruction: ${instruction}
        
        IMPORTANT: Your response 'action' field MUST be "${determinedAction}".
        
        Respond in JSON format.
        `;

        if (config.provider === 'deepseek') {
            const jsonStr = await callDeepSeek(config, [
                { role: 'system', content: systemPrompt + " Output JSON strictly. Escape all newlines in strings as \\n. No markdown." },
                { role: 'user', content: userPrompt }
            ], lengthConfig.tokens, 0.8, true);
            
            return parseSmartResponse(jsonStr);
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.8,
                    maxOutputTokens: lengthConfig.tokens,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            action: { 
                                type: Type.STRING, 
                                enum: ["continue", "new_scene", "new_chapter"],
                                description: "Whether to continue text, or create a new scene/chapter."
                            },
                            title: { 
                                type: Type.STRING,
                                description: "The title of the new scene or chapter (if applicable)."
                            },
                            content: { 
                                type: Type.STRING,
                                description: `The generated story content. MUST use \\n\\n for paragraph breaks and start each paragraph with ${indentSpaces} spaces.`
                            },
                            summary: {
                                type: Type.STRING,
                                description: "A brief summary of the content (useful for new scene metadata)."
                            }
                        },
                        required: ["action", "content"]
                    }
                }
            });
            
            const text = response.text;
            if (!text) throw new Error("No response from AI");
            return parseSmartResponse(text);
        }

    } catch (e) {
        console.error("Smart continuation failed", e);
        return {
            action: 'continue',
            content: await generateStoryContinuation(currentText, codex, instruction, language, config, structureContext)
        };
    }
};

export const chatWithCodex = async (
  history: ChatMessage[],
  newMessage: string,
  codex: CodexEntry[],
  language: WritingLanguage = 'en',
  config: AIConfig,
  activeScene?: Scene,
  activeChapter?: Chapter
): Promise<string> => {
  try {
    const codexContext = formatCodexForAI(codex);
    const langInstruction = getLangInstruction(language);

    // Prepare active scene context (limit to recent context to save tokens)
    let sceneContext = "";
    if (activeScene && activeChapter) {
        const truncatedContent = activeScene.content ? activeScene.content.slice(-4000) : "(Scene is empty)";
        sceneContext = `
        === CURRENT WRITING CONTEXT ===
        Chapter: ${activeChapter.title}
        Scene: ${activeScene.title}
        Current Scene Content (Truncated):
        "${truncatedContent}"
        ===============================
        `;
    }

    const systemPrompt = `You are a helpful writing assistant (co-author).
    ${langInstruction}
    
    ${sceneContext}

    === CODEX (WORLD BIBLE) ===
    ${codexContext}
    
    Instructions:
    1. Answer questions based on the Codex and the Current Writing Context provided above.
    2. If the user asks to rewrite something, use the context provided.
    3. Keep answers concise unless asked for elaboration.
    `;

    if (config.provider === 'deepseek') {
         const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
            { role: 'user', content: newMessage }
         ];
         return await callDeepSeek(config, messages);
    } else {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Chat History:\n${history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')}\nUser: ${newMessage}`,
            config: { systemInstruction: systemPrompt }
        });
        return response.text || "";
    }
  } catch (error) {
    console.error("Chat error:", error);
    return "I encountered an error accessing the creative matrix.";
  }
};

export const generateCodexEntry = async (
    name: string, 
    category: string, 
    context: string, 
    language: WritingLanguage = 'en',
    config: AIConfig
): Promise<string> => {
    try {
        const langInstruction = getLangInstruction(language);
        const systemPrompt = `You are a world-building assistant. ${langInstruction}`;
        const userPrompt = `Name: ${name}\nCategory: ${category}\nContext: ${context}`;

        if (config.provider === 'deepseek') {
             return await callDeepSeek(config, [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
             ]);
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: { systemInstruction: systemPrompt }
            });
            return response.text || "";
        }
    } catch (error) {
        console.error("Codex generation error:", error);
        return "";
    }
}

export const extractEntitiesFromText = async (
    text: string,
    existingCodexNames: string[],
    language: WritingLanguage = 'en',
    config: AIConfig
): Promise<CodexEntry[]> => {
    try {
        const langInstruction = getLangInstruction(language);
        const systemPrompt = `You are an expert editor for novels.
        ${langInstruction}
        Your task is to analyze the provided text and identify potential Codex entries (Characters, Locations, Items, Lore, Factions, Systems, Species, Events).
        
        Rules:
        1. Ignore entities that are already in this list: ${existingCodexNames.join(', ')}.
        2. Only extract IMPLICIT or EXPLICIT significant entities.
        3. Provide a brief description based ONLY on the text provided.
        4. Return a valid JSON array.
        `;

        const userPrompt = `
        Text to analyze:
        "${text}"
        
        Extract new entities.
        `;

        const schema = {
             type: Type.ARRAY,
             items: {
                 type: Type.OBJECT,
                 properties: {
                     name: { type: Type.STRING },
                     category: { type: Type.STRING, enum: ["Character", "Location", "Item", "Lore", "Faction", "System", "Species", "Event"] },
                     description: { type: Type.STRING },
                     tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                 },
                 required: ["name", "category", "description", "tags"]
             }
        };

         if (config.provider === 'deepseek') {
              const jsonStr = await callDeepSeek(config, [
                  { role: 'system', content: systemPrompt + " Output strictly JSON array of objects with keys: name, category, description, tags. No markdown." },
                  { role: 'user', content: userPrompt }
              ], 4096, 1, true);
              
               const cleaned = cleanJsonString(jsonStr);
               
               // Try to parse JSON with fallback for malformed responses
               let parsed: any;
               try {
                   parsed = JSON.parse(cleaned);
               } catch (parseError) {
                   console.warn("JSON parse failed in scan, attempting regex extraction:", parseError);
                   
                   // Fallback: Extract entities using regex patterns
                   const entities: any[] = [];
                   const nameMatches = cleaned.matchAll(/"name"\s*:\s*"([^"]+)"/g);
                   const categoryMatches = cleaned.matchAll(/"category"\s*:\s*"([^"]+)"/g);
                   const descMatches = cleaned.matchAll(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/g);
                   const tagsMatches = cleaned.matchAll(/"tags"\s*:\s*\[(.*?)\]/g);
                   
                   const nameArr = Array.from(nameMatches);
                   const categoryArr = Array.from(categoryMatches);
                   const descArr = Array.from(descMatches);
                   const tagsArr = Array.from(tagsMatches);
                   
                   const count = Math.min(nameArr.length, categoryArr.length, descArr.length);
                   for (let i = 0; i < count; i++) {
                       entities.push({
                           name: nameArr[i][1],
                           category: categoryArr[i][1],
                           description: descArr[i][1],
                           tags: tagsArr[i] ? parseTagsString(tagsArr[i][1]) : []
                       });
                   }
                   
                   parsed = entities;
               }
               
               if (!Array.isArray(parsed)) {
                   console.error("Parsed result is not an array:", parsed);
                   return [];
               }
               
               const categoryMap: Record<string, CodexCategory> = {
                   'character': CodexCategory.Character,
                   'characters': CodexCategory.Character,
                   '人物': CodexCategory.Character,
                   'location': CodexCategory.Location,
                   'locations': CodexCategory.Location,
                   '地点': CodexCategory.Location,
                   'item': CodexCategory.Item,
                   'items': CodexCategory.Item,
                   '物品': CodexCategory.Item,
                   'lore': CodexCategory.Lore,
                   '设定': CodexCategory.Lore,
                   'faction': CodexCategory.Faction,
                   'factions': CodexCategory.Faction,
                   '组织': CodexCategory.Faction,
                   'system': CodexCategory.System,
                   'systems': CodexCategory.System,
                   '系统': CodexCategory.System,
                   'species': CodexCategory.Species,
                   'race': CodexCategory.Species,
                   'races': CodexCategory.Species,
                   '种族': CodexCategory.Species,
                   'event': CodexCategory.Event,
                   'events': CodexCategory.Event,
                   '事件': CodexCategory.Event
               };
               
               return parsed.map((item: any) => {
                   const rawCategory = item.category || 'Character';
                   const normalizedCategory = categoryMap[rawCategory.toLowerCase()] || CodexCategory.Character;
                   
                   return {
                       ...item,
                       category: normalizedCategory,
                       id: `auto_${Date.now()}_${Math.random()}`
                   };
               });
         } else {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const response = await ai.models.generateContent({
                 model: 'gemini-3-flash-preview',
                 contents: userPrompt,
                 config: {
                     systemInstruction: systemPrompt,
                     responseMimeType: "application/json",
                     responseSchema: schema
                 }
             });
              const text = response.text;
              if(!text) return [];
              const cleaned = cleanJsonString(text);
              const parsed = JSON.parse(cleaned);
              return parsed.map((item: any) => {
                  const rawCategory = item.category || 'Character';
                  
                  // Normalize AI's category output to match enum values
                  const categoryMap: Record<string, CodexCategory> = {
                      'character': CodexCategory.Character,
                      'characters': CodexCategory.Character,
                      '人物': CodexCategory.Character,
                      'location': CodexCategory.Location,
                      'locations': CodexCategory.Location,
                      '地点': CodexCategory.Location,
                      'item': CodexCategory.Item,
                      'items': CodexCategory.Item,
                      '物品': CodexCategory.Item,
                      'lore': CodexCategory.Lore,
                      '设定': CodexCategory.Lore,
                      'faction': CodexCategory.Faction,
                      'factions': CodexCategory.Faction,
                      '组织': CodexCategory.Faction,
                      'system': CodexCategory.System,
                      'systems': CodexCategory.System,
                      '系统': CodexCategory.System,
                      'species': CodexCategory.Species,
                      'race': CodexCategory.Species,
                      'races': CodexCategory.Species,
                      '种族': CodexCategory.Species,
                      'event': CodexCategory.Event,
                      'events': CodexCategory.Event,
                      '事件': CodexCategory.Event
                  };
                  
                  const normalizedCategory = categoryMap[rawCategory.toLowerCase()] || CodexCategory.Character;
                  
                  return {
                      ...item,
                      category: normalizedCategory,
                      id: `auto_${Date.now()}_${Math.random()}`
                  };
              });
        }

    } catch (e) {
        console.error("Extraction error", e);
        return [];
    }
}

export const generateNovelOpening = async (
    title: string,
    author: string,
    genre: string,
    subgenre: string,
    language: WritingLanguage = 'en',
    config: AIConfig
): Promise<string> => {
    try {
        const langInstruction = getLangInstruction(language);
        // Dynamic indentation logic
        const isCJK = ['zh', 'ja', 'ko'].includes(language);
        const indentSpaces = isCJK ? 4 : 2;
        const indentExample = " ".repeat(indentSpaces);
        
        const systemPrompt = `You are a bestselling novelist specializing in ${genre} and ${subgenre}.
        ${langInstruction}
        
        Your task is to write an engaging opening scene for a new novel.
        Title: ${title}
        Author: ${author}
        
        Requirements:
        1. Start DIRECTLY with the story. Do not write "Here is the opening..." or meta-commentary.
        2. Hook the reader immediately with action, atmosphere, or intrigue.
        3. Match the tone of the genre (${genre} - ${subgenre}).
        4. Length: Approximately 400-600 words.
        5. Use DOUBLE LINE BREAKS (\\n\\n) to separate paragraphs.
        6. Indent the beginning of EVERY paragraph with ${indentSpaces} spaces (e.g. "${indentExample}The story...").
        `;

        const userPrompt = `Write the opening scene for "${title}".`;

        if (config.provider === 'deepseek') {
             return await callDeepSeek(config, [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
             ], 4096);
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.9, // Higher temp for creativity
                    maxOutputTokens: 4096
                }
            });
            return response.text || "";
        }
    } catch (e) {
        console.error("Opening generation error", e);
        // Fail silently or return empty string so UI can fallback
        throw e;
    }
}

// --- IMAGE GENERATION ---

// 1. Generate the PROMPT for the image generator (Master-level prompt engineering)
export const generateImageDescription = async (
    selectedText: string,
    config: AIConfig
): Promise<string> => {
    const systemPrompt = `You are a world-class concept artist, cinematographer, and art director.
    Your task is to read a selected segment of a story and convert it into a HIGH-FIDELITY IMAGE GENERATION PROMPT.
    
    The prompt should be comma-separated and optimized for top-tier models like Midjourney v6, Stable Diffusion XL, or DALL-E 3.
    
    Include:
    - Main Subject (character, action, focal point)
    - Detailed Environment/Setting
    - Lighting (e.g., volumetric, cinematic, chiaroscuro, golden hour)
    - Atmosphere/Mood (e.g., ethereal, ominous, serene)
    - Camera/Perspective (e.g., wide angle, macro, low angle)
    - Art Style (e.g., photorealistic, oil painting, cyberpunk, watercolor, 8k render, unreal engine 5)
    
    Output ONLY the raw prompt string. Do not add "Here is the prompt:" or any other text.
    `;
    
    const userPrompt = `Story Segment:\n"${selectedText}"\n\nGenerate Image Prompt.`;
    
    try {
        if (config.provider === 'deepseek') {
             return await callDeepSeek(config, [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
             ]);
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: { systemInstruction: systemPrompt }
            });
            return response.text || "";
        }
    } catch (e) {
        console.error("Image prompt generation error", e);
        throw e;
    }
}

// 2. Generate the ACTUAL IMAGE
export const generateImage = async (
    prompt: string,
    config: AIConfig
): Promise<string> => {
    const provider = config.imageProvider || 'gemini';
    const model = config.imageModel || (provider === 'gemini' ? 'gemini-2.5-flash-image' : 'dall-e-3');

    try {
        if (provider === 'gemini') {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: model,
                contents: { parts: [{ text: prompt }] },
                // Note: Standard generateContent for gemini image models returns the image
                config: {} 
            });
            
            // Extract image from parts
            const candidates = response.candidates;
            if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        return part.inlineData.data; // Base64 string
                    }
                }
            }
            throw new Error("No image data found in Gemini response.");

        } else if (provider === 'openai_compatible') {
            const baseUrl = config.imageBaseUrl || 'https://api.openai.com/v1';
            const apiKey = config.imageApiKey;
            const size = config.imageSize || '1024x1024';
            
            if (!apiKey) throw new Error("Image API Key is missing.");

            const res = await fetch(`${baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    size: size,
                    response_format: "b64_json" 
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Image API Error: ${errText}`);
            }

            const data = await res.json();
            
            // Handle Base64 response
            if (data.data?.[0]?.b64_json) {
                return data.data[0].b64_json;
            }
            // Handle URL response (Download content)
            if (data.data?.[0]?.url) {
                const imageUrl = data.data[0].url;
                try {
                    // Attempt to fetch the image data to store it permanently
                    const imageRes = await fetch(imageUrl);
                    const blob = await imageRes.blob();
                    return await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64Url = reader.result as string;
                            // Remove the data:image/xxx;base64, prefix to just get raw string
                            // Editor expects raw base64 string for the data URI construction
                            const base64Raw = base64Url.split(',')[1];
                            resolve(base64Raw);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn("Failed to download image from URL, returning URL instead.", err);
                    // Fallback: Return the URL directly if download fails (CORS, etc)
                    return imageUrl;
                }
            }
            
            throw new Error("No image data (b64_json or url) found in response.");
        }
        
        throw new Error("Unknown Image Provider");
    } catch (e) {
        console.error("Image generation failed", e);
        throw e;
    }
}
