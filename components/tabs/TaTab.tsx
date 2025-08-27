

import React from 'react';
import { DataTab } from './DataTab';
import { BriefcaseIcon } from '../icons';

const suggestedQuestions = [
    "How many Senior Engineer roles are open?",
    "Which roles are open in the USA?",
    "List all open positions for the 'Data' department"
];

export const RecruitmentTab: React.FC = () => {
    return (
         <DataTab
            tabName="Recruitment"
            icon={BriefcaseIcon}
            dataDescription="a list of current open job positions in the company. It includes job titles, departments, locations, and posting dates."
            welcomeMessage="I have the open positions data. Ask me a question, or try one of the suggestions below."
            staticFileUrl="/assets/TAGMaster.xlsx"
            suggestedQuestions={suggestedQuestions}
        />
    );
};