import React from 'react';
import type { DigestData } from '../../../types';
import { BuildingIcon, DownloadIcon, EyeIcon, SpinnerIcon } from './icons';

interface ReportTileProps {
    digest: DigestData;
    onView: () => void;
    onDownload: () => void;
    isDownloading: boolean;
}

export const ReportTile: React.FC<ReportTileProps> = ({ digest, onView, onDownload, isDownloading }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-slate-100 p-2 rounded-lg">
                        <BuildingIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 truncate">{digest.companyName}</h3>
                </div>
                <p className="text-xs text-slate-500">
                    Generated on: {new Date(parseInt(digest.id.split('-').pop() || '0')).toLocaleDateString()}
                </p>
            </div>
            <div className="flex space-x-2 mt-5">
                <button
                    onClick={onView}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View
                </button>
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isDownloading ? (
                        <>
                            <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};