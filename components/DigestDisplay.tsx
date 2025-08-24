import React from 'react';
import { DigestCard } from './DigestCard';
import type { DigestData } from '../types';
import { BriefcaseIcon } from './icons'; // A placeholder icon

interface DigestDisplayProps {
    digest: DigestData;
    onBack: () => void;
    isPdfMode?: boolean;
}

export const DigestDisplay: React.FC<DigestDisplayProps> = ({ digest, onBack, isPdfMode }) => {
    return (
        <div className="space-y-8">
            {!isPdfMode && (
                 <div className="flex justify-start mb-4 no-print">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>
            )}
            <DigestCard digest={digest} />
        </div>
    );
};