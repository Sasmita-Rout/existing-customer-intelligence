import React, { useState } from 'react';
import { AccountInfoTab } from './components/tabs/AccountInfoTab';
import { RmgTab } from './components/tabs/RmgTab';
import { RecruitmentTab } from './components/tabs/TaTab';
import { AccountDataTab } from './components/tabs/AccountDataTab';

type Tab = 'Customer Intelligence Info' | 'RMG' | 'Recruitment' | 'Account Data';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Customer Intelligence Info');

    const tabs: { name: Tab; component: React.ReactNode }[] = [
        { name: 'Customer Intelligence Info', component: <AccountInfoTab /> },
        { name: 'RMG', component: <RmgTab /> },
        { name: 'Recruitment', component: <RecruitmentTab /> },
        { name: 'Account Data', component: <AccountDataTab /> },
    ];

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                     <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Accion Intelligence Operations
                    </h1>
                </div>
                 <nav className="mt-4">
                    <div className="flex space-x-2 sm:space-x-4 border-b border-slate-200">
                        {(['Customer Intelligence Info', 'RMG', 'Recruitment', 'Account Data'] as Tab[]).map(tab => (
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
            </header>
            
            <main className="flex-grow">
                {tabs.map(({ name, component }) => (
                    <div key={name} style={{ display: activeTab === name ? 'block' : 'none' }}>
                        {component}
                    </div>
                ))}
            </main>

            <footer className="py-8 mt-12 border-t border-slate-200">
                <div className="text-center">
                    <p className="text-sm text-slate-600">Copyright © 2025 Accionlabs. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;