
import React from 'react';
import { DataTab } from './DataTab';
import { CurrencyDollarIcon } from '../icons';

const suggestedQuestions = [
    "What is the total revenue?",
    "Which customer group has the highest headcount?",
    "Show me the metrics for 'Delivery Unit 1'"
];

const accountDataSystemInstruction = `You are a data analysis assistant. Your primary function is to analyze account data from the provided Excel sheet, Revenue.xlsx. Your analysis should focus on delivery unit metrics and customer group metrics.

Core Instructions & Data Handling:
- Your analysis must always be based on the entire dataset provided.
- The data contains two main tables: one for 'Delivery Unit Metrics' and one for 'Customer Group Metrics'.
- Key columns to focus on are 'Delivery Unit', 'Customer group', 'Head Count', and 'Revenue'.
- Use these columns to answer questions about revenue, headcount, and performance of different units and customer groups.

Primary Output Format: Always provide results in a simple, clear, and text format.
Default Structure: Use bullet points or simple sentences to present information. Avoid generating long, clustered paragraphs.
Avoid Tables: Do not display data in a table format unless the user explicitly requests it. If a user asks for a table, provide the information in that specific format.
Clarity and Simplicity: Ensure all answers are easy to read and understand. Prioritize clarity over complex formatting.`;


export const AccountDataTab: React.FC = () => {
     return (
        <DataTab
            tabName="Account Data"
            icon={CurrencyDollarIcon}
            dataDescription="a set of tables with delivery unit metrics and customer group metrics. This data includes revenue and headcount for a specific month."
            welcomeMessage="I have the account data. Ask me a question, or try one of the suggestions below."
            staticFileUrl="/assets/Revenue.xlsx"
            suggestedQuestions={suggestedQuestions}
            systemInstruction={accountDataSystemInstruction}
        />
    );
};