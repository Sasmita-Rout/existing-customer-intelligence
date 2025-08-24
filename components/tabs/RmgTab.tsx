
import React from 'react';
import { DataTab } from './DataTab';
import { UsersIcon } from '../icons';

export const RmgTab: React.FC = () => {
    return (
        <DataTab
            tabName="Resource Management Group (RMG)"
            icon={UsersIcon}
            dataDescription="a list of employees currently on the bench in the Resource Management Group. It includes their skills, experience, location, and bench start date."
            welcomeMessage="I have the RMG bench data. Ask me questions like 'How many people know Java?' or 'List all employees on the bench in London'."
            staticFileUrl="/assets/benchdata.xlsx"
        />
    );
};