
import React from 'react';
import { DataTab } from './DataTab';
import { UsersIcon } from '../icons';

const suggestedQuestions = [
    "How many people are on the Bench?",
    "List everyone in the ATG group",
    "Who has Python skills?"
];

export const RmgTab: React.FC = () => {
    return (
        <DataTab
            tabName="Resource Management Group (RMG)"
            icon={UsersIcon}
            dataDescription="a list of employees in the Resource Management Group. It includes their skills, experience, location, and overall status."
            welcomeMessage="I have the RMG data. Ask me a question, or try one of the suggestions below."
            staticFileUrl="/assets/benchdata.xlsx"
            suggestedQuestions={suggestedQuestions}
        />
    );
};
