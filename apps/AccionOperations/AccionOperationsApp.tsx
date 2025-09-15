import React, { useState } from 'react';
import { RmgTab } from './tabs/RmgTab';
import { RecruitmentTab } from './tabs/RecruitmentTab';
import { AccountDataTab } from './tabs/AccountDataTab';

type OperationsTab = 'RMG' | 'Recruitment' | 'Account Data';

export const AccionOperationsApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<OperationsTab>('RMG');

    const tabs: { name: OperationsTab; component: React.ReactNode }[] = [
        { name: 'RMG', component: <RmgTab /> },
        { name: 'Recruitment', component: <RecruitmentTab /> },
        { name: 'Account Data', component: <AccountDataTab /> },
    ];

    return (
        <div>
            <nav>
                <div className="flex space-x-2 sm:space-x-4 border-b border-slate-200">
                    {(['RMG', 'Recruitment', 'Account Data'] as OperationsTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 sm:px-4 py-3 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none ${
                                activeTab === tab
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                            aria-current={activeTab === tab ? 'page' : undefined}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </nav>
            <main className="flex-grow mt-6">
                {tabs.map(({ name, component }) => (
                    <div key={name} style={{ display: activeTab === name ? 'block' : 'none' }}>
                        {component}
                    </div>
                ))}
            </main>
        </div>
    );
};
