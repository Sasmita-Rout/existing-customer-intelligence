
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { DigestData, Source, FinancialMetric, RevenueDataPoint, TechDistributionItem, OpenPosition } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    let lastError: unknown;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            let shouldRetry = false;
            let isRateLimitError = false;

            if (error instanceof Error && error.message) {
                if (error.message.includes('"code":500') || error.message.includes('"status":"INTERNAL"')) {
                    shouldRetry = true;
                } else if (error.message.includes('"code":429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    shouldRetry = true;
                    isRateLimitError = true;
                }
            }

            if (!shouldRetry) {
                throw lastError;
            }
            
            if (i < retries - 1) {
                const backoffDelay = (isRateLimitError ? delay * Math.pow(2, i) : delay) + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
        }
    }
    throw lastError;
};

const digestSchema = {
    type: Type.OBJECT,
    properties: {
        overview: { type: Type.STRING, description: "A concise overview of the company's current situation, focusing on recent performance, market position, and key strategic initiatives. Should be a single paragraph." },
        keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 bullet points highlighting the most critical recent developments, such as major product launches, significant financial results, or strategic partnerships." },
        keyFinancials: { 
            type: Type.ARRAY, 
            items: { 
                type: Type.OBJECT, 
                properties: {
                    metric: { type: Type.STRING, description: "The name of the financial metric (e.g., 'Market Cap', 'P/E Ratio', 'YOY Revenue Growth', 'Net Profit Margin')." },
                    value: { type: Type.STRING, description: "The value of the metric, formatted as a string (e.g., '$1.2 Trillion', '25.5', '15.2%', '12.1%')." }
                },
                required: ["metric", "value"]
            },
            description: "A list of 3-4 key financial metrics."
        },
        revenueGrowth: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING, description: "The financial period (e.g., '2025 Q1', '2025 Q2 (Est.)')." },
                    revenue: { type: Type.NUMBER, description: "The revenue in billions of USD." }
                },
                required: ["period", "revenue"]
            },
            description: "An array of the last 2-3 reported or estimated quarterly revenue figures."
        },
        quarterlyReleases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key takeaways from the most recent quarterly earnings reports." },
        newsAndPressReleases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Summaries of significant news and press releases from the last 3 months." },
        newJoiners: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of new executive hires (CXO, VP level) in the last 3 months, formatted as 'Name, Title'." },
        techFocus: { type: Type.STRING, description: "A detailed paragraph on the company's primary technology focus, including key technologies, platforms, and innovations." },
        techDistribution: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    tech: { type: Type.STRING, description: "The technology category." },
                    percentage: { type: Type.NUMBER, description: "The estimated percentage of focus on this technology." }
                },
                required: ["tech", "percentage"]
            },
            description: "An estimated breakdown of the company's technology focus by percentage."
        },
        strategicAndHiringInsights: { type: Type.STRING, description: "Analysis of the company's strategic direction and its implications on hiring trends. Should be a single paragraph." },
        openPositions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING }, link: { type: Type.STRING }, source: { type: Type.STRING }, datePosted: { type: Type.STRING, description: "Format as YYYY-MM-DD" }, region: { type: Type.STRING }
                },
                required: ["title", "link", "source", "datePosted", "region"]
            },
            description: "A diverse list of 5-10 currently open positions with job titles, regions, and direct links to the job postings."
        },
        attentionPointsForAccionlabs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable insights and potential opportunities for Accionlabs based on the company's strategy, tech focus, and needs." }
    },
     required: [
        "overview", "keyHighlights", "keyFinancials", "revenueGrowth", "quarterlyReleases", 
        "newsAndPressReleases", "newJoiners", "techFocus", "techDistribution", 
        "strategicAndHiringInsights", "openPositions", "attentionPointsForAccionlabs"
    ]
};

export const generateCompanyDigest = async (companyName: string): Promise<DigestData> => {
    const prompt = `
        Generate a comprehensive, data-driven intelligence digest for the company: "${companyName}".
        Act as a senior business analyst. Your audience is a tech services company looking for partnership and sales opportunities.
        
        CRITICAL INSTRUCTIONS:
        1.  ALL information retrieved must be from the last 3 months ONLY. Disregard any data, news, or reports older than that.
        2.  The output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, conversation, or markdown formatting before or after the JSON object.
        3.  For any section where recent (last 3 months) data is truly unavailable, return an empty array [] for list-based fields or an empty string "" for text fields. Do not invent data.
        4.  For the 'openPositions' section, find at least 5 real, currently open positions and provide direct links to the job postings.
    `;

    try {
        const result = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: digestSchema,
                tools: [{ googleSearch: {} }],
            },
        }));

        const rawText = result.text;
        
        // Resilient JSON parsing
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
            console.error("Malformed AI response:", rawText);
            throw new Error("Failed to find a valid JSON object in the AI's response.");
        }
        const jsonString = rawText.substring(jsonStart, jsonEnd + 1);

        let parsedData: Omit<DigestData, 'id' | 'companyName' | 'sources'>;
        try {
            parsedData = JSON.parse(jsonString);
        } catch(e) {
            console.error("Failed to parse JSON response from AI:", rawText);
            throw new Error(`Failed to parse JSON response from AI: ${rawText}`);
        }

        const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: Source[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri ?? '',
                title: chunk.web?.title ?? 'Untitled Source'
            }))
            .filter(source => source.uri);

        const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

        return {
            ...parsedData,
            id: `digest-${companyName.replace(/\s+/g, '_')}-${Date.now()}`,
            companyName: companyName,
            sources: uniqueSources,
        };
    } catch (error) {
        console.error(`Error generating digest for ${companyName}:`, error);
        throw new Error(`Failed to generate digest for ${companyName}. The AI returned malformed data.`);
    }
};

export const generateCompanyFacts = async (companyName: string): Promise<string[]> => {
    const prompt = `Generate 3-4 interesting, little-known "Did you know?" style facts about ${companyName}. Each fact should be on a new line.`;
    try {
        const result = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        }));
        const text = result.text;
        if (!text) return [];
        return text.split('\n').map(fact => fact.replace(/^[*-]\s*/, '').trim()).filter(Boolean);
    } catch (error) {
        console.error("Fact generation failed:", error);
        return [`The AI is currently busy generating your main report for ${companyName}.`];
    }
};

export const generateChatResponseFromData = async (question: string, data: unknown[], dataDescription: string): Promise<string> => {
    let dataSample = data;
    let isSampled = false;

    // Limit data size to prevent overly large requests
    if (data.length > 500) {
        dataSample = data.slice(0, 500);
        isSampled = true;
    }

    const dataString = JSON.stringify(dataSample, null, 2);

    const prompt = `
        You are a helpful AI assistant integrated into a data analysis chatbot.
        Your task is to answer questions based ONLY on the structured data provided below. This data was extracted from a spreadsheet file.
        The data is about: ${dataDescription}.

        Here is the data, presented as an array of objects where each object represents a row from the original file:
        \`\`\`json
        ${dataString}
        \`\`\`
        ${isSampled ? "Note: You are only seeing a sample of the first 500 rows of a larger dataset. Your answer should reflect this by stating you are working with a sample if relevant." : ""}

        Answer the following user question based strictly on the data provided above.
        - The data represents rows from a spreadsheet. The keys in each JSON object are the column headers.
        - If the answer is in the data, provide it clearly and concisely.
        - If the data can be summarized in a table, format your response using Markdown tables.
        - Do not make up information or answer questions that cannot be addressed by the data.
        - If the question cannot be answered from the data, say "I cannot answer that question based on the provided data."

        User Question: "${question}"
    `;

    try {
        const result = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        }));
        
        const responseText = result.text;
        
        // Add a check for empty or blocked responses.
        if (!responseText || responseText.trim() === '') {
            const safetyRatings = result.candidates?.[0]?.safetyRatings;
            if (safetyRatings && safetyRatings.some(rating => rating.blocked)) {
                 throw new Error("The response was blocked for safety reasons. Please rephrase your question.");
            }
            throw new Error("AI response did not contain valid text for chat.");
        }
        
        return responseText;
    } catch (error) {
        console.error("Error generating chat response:", error);
        throw error; // Re-throw to be caught by the UI
    }
};
