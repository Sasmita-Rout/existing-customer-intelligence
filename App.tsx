import React from 'react';
import { CustomerIntelligenceApp } from './apps/CustomerIntelligence/CustomerIntelligenceApp';

const App: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div className="flex items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                           Customer Intelligence
                        </h1>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow">
                <CustomerIntelligenceApp />
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