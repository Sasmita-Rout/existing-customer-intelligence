
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
                const backoffDelay = (isRateLimitError ? delay * 2 : delay) * Math.pow(2, i) + Math.floor(Math.random() * 1000);
                console.log(`API call failed (retriable). Attempt ${i + 1} of ${retries}. Retrying in ${backoffDelay}ms...`);
                await new Promise(res => setTimeout(res, backoffDelay));
            }
        }
    }
    console.error("API call failed after all retries.", lastError);
    throw lastError!;
};

const cleanupText = (text: string): string => {
    if (!text) return '';
    // This regex removes citation markers like [3], [14], or [3, 14]
    return text.replace(/\[\d+(,\s*\d+)*\]/g, ' ').replace(/\s+/g, ' ').trim();
};

export const generateCompanyFacts = async (companyName: string): Promise<string[]> => {
    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide 7 interesting and little-known "Did you know?" style facts about ${companyName}. The facts should be concise, engaging, and suitable for a professional audience.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        facts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        }
                    }
                }
            },
        }));
        const jsonText = response.text;
        const parsed = JSON.parse(jsonText);
        return parsed.facts || [];
    } catch (error) {
        console.error(`Failed to generate facts for ${companyName}:`, error);
        // Return empty array on failure to not block the main digest generation
        return [];
    }
};

export const generateCompanyDigest = async (companyName: string): Promise<DigestData> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
CRITICAL REQUIREMENT: All information retrieved for this digest MUST be from the last 3 months. Do not include any data, news, or reports older than this period.

Analyze recent news, financial reports, and market data for "${companyName}".
For 'newJoiners' and 'openPositions', you MUST consult sources like LinkedIn, Glassdoor, Indeed, Naukri, Monster, Dice, CareerBuilder, ZipRecruiter, TechCrunch, Nasscom, Comparably, other business journals, and official company career pages. For 'openPositions', capture a diverse set of global regions where available.

Generate a detailed corporate digest targeted at Accionlabs, a software service company looking for partnership or sales opportunities. It is crucial that you find and include data for all sections if publicly available. If a section's data is truly unavailable, return an empty array [] for list-based fields or an empty string "" for text fields, but you must exhaust all search capabilities first.

You MUST return your response as a single, valid JSON object. Do not include any text before or after the JSON. Do not use markdown backticks.

The JSON object must have the following structure:
{
  "overview": "A 1-paragraph summary of recent news, market performance, and general activities.",
  "keyHighlights": [
    "A list of exactly 2 of the most important recent highlights. Each highlight should be a concise string."
  ],
  "keyFinancials": [
    { "metric": "Market Cap", "value": "e.g., $2.1T" },
    { "metric": "P/E Ratio", "value": "e.g., 30.5" },
    { "metric": "YOY Revenue Growth", "value": "e.g., 15.2%" },
    { "metric": "Net Profit Margin", "value": "e.g., 25.1%" }
  ],
  "revenueGrowth": [
      { "period": "YYYY QX", "revenue": 50.5 },
      { "period": "YYYY QX", "revenue": 52.1 },
      { "period": "YYYY QX", "revenue": 55.3 }
  ],
  "quarterlyReleases": [
      "A bullet point summarizing a key takeaway from the most recent quarterly earnings release.",
      "Another significant finding or figure from a recent quarterly report."
  ],
  "newsAndPressReleases": [
      "A summary of a significant recent press release or major news story.",
      "Details of another important news item or announcement."
  ],
  "newJoiners": [
      "Full Name - New Role (e.g., CFO, VP of Engineering).",
      "Another significant new hire at the CXO or VP level."
  ],
  "techFocus": "A paragraph about the key technologies the company is currently focusing on or developing. This should complement the techDistribution data.",
  "techDistribution": [
      { "tech": "Primary Technology Area", "percentage": 40 },
      { "tech": "Secondary Technology Area", "percentage": 30 },
      { "tech": "Other", "percentage": 30 }
  ],
  "strategicAndHiringInsights": "A paragraph describing the company's future strategic direction and overall hiring trends, based on public statements and market analysis.",
  "openPositions": [
      { "title": "Senior Frontend Engineer", "link": "https://careers.example.com/job/123", "source": "LinkedIn", "datePosted": "YYYY-MM-DD", "region": "USA" },
      { "title": "Data Scientist", "link": "https://careers.example.com/job/456", "source": "Company Website", "datePosted": "YYYY-MM-DD", "region": "Remote" }
  ],
  "attentionPointsForAccionlabs": [
    "A bullet point identifying a potential opportunity for Accionlabs.",
    "Another bullet point highlighting a potential synergy with Accionlabs' services.",
    "A specific, actionable angle on how to pitch Accionlabs' services to solve a problem for this company.",
    "Another point of interest for Accionlabs based on the company's trajectory.",
    "A fifth actionable insight or recommendation for Accionlabs."
  ]
}
`;
    
    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: Source[] = groundingChunks
            .map(chunk => chunk.web)
            .filter((web): web is { uri: string; title: string; } => !!web && !!web.uri && !!web.title)
            .reduce((acc, current) => {
                if (!acc.some(item => item.uri === current.uri)) {
                    acc.push(current);
                }
                return acc;
            }, [] as Source[]);
        
        const jsonText = response.text;
        let parsedData;

        try {
            const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            parsedData = JSON.parse(cleanedJsonText);
        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", jsonText, parseError);
            throw new Error(`Failed to generate digest for ${companyName}. The AI returned malformed data.`);
        }
        
        const safeParsedData = {
            overview: '',
            keyHighlights: [],
            keyFinancials: [],
            revenueGrowth: [],
            quarterlyReleases: [],
            newsAndPressReleases: [],
            newJoiners: [],
            techFocus: '',
            techDistribution: [],
            strategicAndHiringInsights: '',
            openPositions: [],
            attentionPointsForAccionlabs: [],
            ...parsedData
        };

        safeParsedData.overview = cleanupText(safeParsedData.overview);
        safeParsedData.techFocus = cleanupText(safeParsedData.techFocus);
        safeParsedData.strategicAndHiringInsights = cleanupText(safeParsedData.strategicAndHiringInsights);
        safeParsedData.keyHighlights = safeParsedData.keyHighlights.map(cleanupText);
        safeParsedData.quarterlyReleases = safeParsedData.quarterlyReleases.map(cleanupText);
        safeParsedData.newsAndPressReleases = safeParsedData.newsAndPressReleases.map(cleanupText);
        safeParsedData.newJoiners = safeParsedData.newJoiners.map(cleanupText);
        safeParsedData.attentionPointsForAccionlabs = safeParsedData.attentionPointsForAccionlabs.map(cleanupText);
        
        safeParsedData.openPositions = Array.isArray(safeParsedData.openPositions)
            ? safeParsedData.openPositions.map((pos: Partial<OpenPosition>) => ({
                  title: cleanupText(pos.title || ''),
                  link: pos.link || '',
                  source: cleanupText(pos.source || ''),
                  datePosted: cleanupText(pos.datePosted || ''),
                  region: cleanupText(pos.region || 'N/A'),
              }))
            : [];

        return {
            id: `${companyName.replace(/\s+/g, '-')}-${Date.now()}`,
            companyName,
            overview: safeParsedData.overview,
            keyHighlights: safeParsedData.keyHighlights.filter(Boolean),
            keyFinancials: safeParsedData.keyFinancials.filter((d: FinancialMetric) => d && typeof d.metric === 'string' && typeof d.value === 'string'),
            revenueGrowth: safeParsedData.revenueGrowth.filter((d: RevenueDataPoint) => d && typeof d.period === 'string' && typeof d.revenue === 'number'),
            quarterlyReleases: safeParsedData.quarterlyReleases.filter(Boolean),
            newsAndPressReleases: safeParsedData.newsAndPressReleases.filter(Boolean),
            newJoiners: safeParsedData.newJoiners.filter(Boolean),
            techFocus: safeParsedData.techFocus,
            techDistribution: safeParsedData.techDistribution.filter((d: TechDistributionItem) => d && typeof d.tech === 'string' && typeof d.percentage === 'number'),
            strategicAndHiringInsights: safeParsedData.strategicAndHiringInsights,
            openPositions: safeParsedData.openPositions.filter((p: OpenPosition) => p && p.title && p.link),
            attentionPointsForAccionlabs: safeParsedData.attentionPointsForAccionlabs.filter(Boolean),
            sources,
        };
    } catch (error) {
        console.error(`Error generating digest for ${companyName}:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Failed to generate digest for ${companyName}. The API may be unavailable or the request may have been blocked.`);
    }
};

export const generateShortSummaryFromData = async (data: unknown[], dataDescription: string): Promise<string> => {
    // Use a small sample of data for a quick summary
    const dataSample = data.slice(0, 10);

    const prompt = `
        You are a data analyst. Your task is to provide a concise, factual summary of the provided data snippet, which represents ${dataDescription}.
        The summary MUST be a single paragraph and strictly under 150 characters.
        Do not add any conversational text or introductions like "This data shows...".
        Focus only on key facts like total counts, main categories, or overall status.

        Here is the data sample:
        \`\`\`json
        ${JSON.stringify(dataSample, null, 2)}
        \`\`\`
    `;

     try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        const text = response.text;
        if (typeof text === 'string') {
            return text.trim();
        }
        throw new Error("AI response did not contain valid text for summary.");
    } catch (error) {
        console.error("Error generating short summary:", error);
        return "Could not generate a summary for the provided data.";
    }
}

export const generateChatResponseFromData = async (question: string, data: unknown[], dataDescription: string): Promise<string> => {
    const prompt = `
        You are 'Accion Insights Bot', a helpful data analyst. Your ONLY task is to answer questions based on the JSON data provided about ${dataDescription}.
        If the answer is not in the data, say: "I'm sorry, but I cannot answer that question based on the provided data."

        FORMATTING RULES:
        - Use Markdown for all responses.
        - Use headings (#, ##), bullets (*), and bold text (**text**).
        - For lists of items, YOU MUST use a Markdown table.

        DATA:
        \`\`\`json
        ${JSON.stringify(data, null, 2)}
        \`\`\`

        Question: "${question}"
    `;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        }));
        const text = response.text;
        if (typeof text === 'string') {
            return text.trim();
        }
        throw new Error("AI response did not contain valid text for chat.");
    } catch (error) {
        console.error("Error generating chat response:", error);
        return "I'm sorry, I encountered an error while trying to process your request.";
    }
};
