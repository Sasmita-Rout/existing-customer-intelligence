
import React from 'react';
import { DataTab } from './DataTab';
import { CurrencyDollarIcon } from '../icons';

export const AccountDataTab: React.FC = () => {
     return (
        <DataTab
            tabName="Account Data"
            icon={CurrencyDollarIcon}
            dataDescription="a set of tables with delivery unit metrics and customer group metrics. This data includes revenue and headcount for a specific month."
            welcomeMessage="I have the account data you provided. You can ask me questions like 'What is the total revenue?' or 'Which customer group has the highest headcount?'"
        />
    );
};
