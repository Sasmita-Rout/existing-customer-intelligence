import React, { useState } from 'react';
import { SpinnerIcon } from './icons';

interface InputPanelProps {
    onGenerate: (company: string) => void;
    isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
    const [companyInput, setCompanyInput] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const company = companyInput.trim();
        if (company) {
            onGenerate(company);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="company-name" className="block text-sm font-medium text-slate-700 mb-1">
                            Company Name
                        </label>
                        <p className="text-xs text-slate-500 mb-2">Enter a company name to generate a report.</p>
                        <input
                            type="text"
                            id="company-name"
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            placeholder="e.g. Tesla"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || companyInput.trim() === ''}
                        className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                Generating...
                            </>
                        ) : (
                            'Generate Digest'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};