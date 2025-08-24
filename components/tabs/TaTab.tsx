
import React from 'react';
import { DataTab } from './DataTab';
import { BriefcaseIcon } from '../icons';

export const RecruitmentTab: React.FC = () => {
    return (
         <DataTab
            tabName="Recruitment"
            icon={BriefcaseIcon}
            dataDescription="a list of current open job positions in the company. It includes job titles, departments, locations, and posting dates."
            welcomeMessage="I have the open positions data. Feel free to ask 'How many Senior Engineer roles are open?' or 'Which roles are open in the USA?'"
            staticFileUrl="/assets/TAG_Json.json"
        />
    );
};
