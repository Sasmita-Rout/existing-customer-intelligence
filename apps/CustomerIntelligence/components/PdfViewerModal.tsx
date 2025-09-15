import React from 'react';
import { XMarkIcon } from '../../../components/icons';

interface PdfViewerModalProps {
    url: string;
    onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ url, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">PDF Preview</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                        aria-label="Close PDF viewer"
                    >
                        <XMarkIcon className="h-6 w-6 text-slate-600" />
                    </button>
                </header>
                <div className="flex-grow">
                    <iframe
                        src={url}
                        title="PDF Preview"
                        className="w-full h-full border-0"
                    />
                </div>
            </div>
        </div>
    );
};
