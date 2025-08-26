
import React from 'react';
import { DataTab } from './DataTab';
import { CurrencyDollarIcon } from '../icons';

const suggestedQuestions = [
    "What is the total revenue?",
    "Which customer group has the highest headcount?",
    "Show me the metrics for 'Delivery Unit 1'"
];


export const AccountDataTab: React.FC = () => {
     return (
        <DataTab
            tabName="Account Data"
            icon={CurrencyDollarIcon}
            dataDescription="a set of tables with delivery unit metrics and customer group metrics. This data includes revenue and headcount for a specific month."
            welcomeMessage="I have the account data. Ask me a question, or try one of the suggestions below."
            staticFileUrl="/assets/Revenue.xlsx"
            suggestedQuestions={suggestedQuestions}
        />
    );
};
