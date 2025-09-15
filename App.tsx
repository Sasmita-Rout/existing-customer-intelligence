import React, { useState } from 'react';
import { CustomerIntelligenceApp } from './apps/CustomerIntelligence/CustomerIntelligenceApp';
import { AccionOperationsApp } from './apps/AccionOperations/AccionOperationsApp';
import { BuildingIcon, BriefcaseIcon } from './components/icons';

type View = 'home' | 'intelligence' | 'operations';

const AppCard: React.FC<{ title: string; description: string; icon: React.ElementType; onClick: () => void; }> = ({ title, description, icon: Icon, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
        <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <Icon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);


const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');

    const getHeaderTitle = () => {
        switch (currentView) {
            case 'intelligence':
                return "Customer Intelligence";
            case 'operations':
                return "Accion Operations";
            default:
                return "Accion Intelligence Operations";
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'intelligence':
                return <CustomerIntelligenceApp />;
            case 'operations':
                return <AccionOperationsApp />;
            case 'home':
            default:
                return (
                     <div className="mt-10">
                        <h2 className="text-center text-xl sm:text-2xl font-semibold text-slate-800 mb-8">Choose an application to start</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <AppCard
                                title="Customer Intelligence"
                                description="Generate detailed, data-driven intelligence reports on any company. Track reports and analyze market trends."
                                icon={BuildingIcon}
                                onClick={() => setCurrentView('intelligence')}
                            />
                            <AppCard
                                title="Accion Operations"
                                description="Analyze internal operational data. Chat with your RMG, Recruitment, and Account datasets."
                                icon={BriefcaseIcon}
                                onClick={() => setCurrentView('operations')}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div className="flex items-center">
                        {currentView !== 'home' && (
                            <button
                                onClick={() => setCurrentView('home')}
                                className="mr-4 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                aria-label="Back to Home"
                            >
                                &larr; Home
                            </button>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                           {getHeaderTitle()}
                        </h1>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow">
                {renderContent()}
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
