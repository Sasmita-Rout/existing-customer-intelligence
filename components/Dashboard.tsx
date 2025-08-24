import React from 'react';
import type { DigestData } from '../types';
import { ReportTile } from './ReportTile';

interface DashboardProps {
    digests: DigestData[];
    onView: (digestId: string) => void;
    onDownload: (digestId: string) => void;
    pdfLoadingId: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ digests, onView, onDownload, pdfLoadingId }) => {
    if (digests.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-white rounded-xl shadow-md border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700">No Reports Generated This Month</h3>
                <p className="mt-2 text-sm text-slate-500">
                    Use the panel on the left to generate a new customer intelligence report.
                </p>
            </div>
        );
    }

    return (
        <div>
             <h2 className="text-xl font-semibold text-slate-800 mb-4">This Month's Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {digests.map(digest => (
                    <ReportTile 
                        key={digest.id} 
                        digest={digest} 
                        onView={() => onView(digest.id)}
                        onDownload={() => onDownload(digest.id)}
                        isDownloading={digest.id === pdfLoadingId}
                    />
                ))}
            </div>
        </div>
    );
};