

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Chatbot } from '../Chatbot';
import { SpinnerIcon, UploadCloudIcon, DocumentTextIcon, OneDriveIcon } from '../icons';

interface DataTabProps {
    tabName: string;
    dataDescription: string;
    welcomeMessage: string;
    icon: React.ElementType;
    staticFileUrl?: string;
    suggestedQuestions?: string[];
    systemInstruction?: string;
}

const DataUploader: React.FC<{ 
    onLocalFileUpload: (file: File) => void;
    onOneDriveClick: () => void;
    disabled: boolean 
}> = ({ onLocalFileUpload, onOneDriveClick, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(isEntering);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onLocalFileUpload(files[0]);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
             onLocalFileUpload(files[0]);
        }
    }

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div>
            <div 
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={handleClick}
                role="button"
                aria-label="File upload zone for local files"
                tabIndex={0}
            >
                <UploadCloudIcon className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">Drop your file here or click to browse</h3>
                <p className="text-sm text-slate-500 mt-1">Supports .xlsx, .csv and .json files (Max 2MB)</p>
                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv, .json"
                    onChange={handleChange}
                    disabled={disabled}
                />
            </div>

            <div className="relative flex items-center justify-center my-6">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-sm font-semibold">OR</span>
                <div className="flex-grow border-t border-slate-300"></div>
            </div>

            <button 
                onClick={onOneDriveClick}
                disabled={disabled}
                className="w-full flex justify-center items-center px-4 py-3 border border-slate-300 text-sm font-semibold rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors duration-200"
            >
                <OneDriveIcon className="h-5 w-5 mr-2"/>
                Select from OneDrive
            </button>
        </div>
    );
};

const loadingMessages = [
    'Loading required data file...',
    'Analyzing file structure...',
    'Extracting key data points...',
    'Preparing chatbot...',
    'Finalizing interface...'
];

export const DataTab: React.FC<DataTabProps> = ({ tabName, dataDescription, welcomeMessage, icon: Icon, staticFileUrl, suggestedQuestions, systemInstruction }) => {
    const ONEDRIVE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
    const isStatic = !!staticFileUrl;

    const [data, setData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(isStatic);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        if (isLoading) {
            setLoadingMessage(loadingMessages[0]);
            const interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const processAndSetData = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            if (file.size > 2 * 1024 * 1024) {
                throw new Error("File size exceeds the 2MB limit. Please upload a smaller file.");
            }
            
            let jsonData: any[];

            if (file.name.match(/\.(json)$/i)) {
                const text = await file.text();
                jsonData = JSON.parse(text);
            } else if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
                const fileData = await file.arrayBuffer();
                const workbook = XLSX.read(fileData, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                jsonData = XLSX.utils.sheet_to_json(worksheet);
            } else {
                throw new Error("Invalid file type. Please upload an Excel (.xlsx, .xls), .csv, or .json file.");
            }

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error("The uploaded file is empty, not a valid JSON array, or could not be parsed correctly.");
            }

            setData(jsonData);
        } catch (err) {
            console.error("File processing error:", err);
            setError(err instanceof Error ? err.message : "An error occurred while processing the file.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        const loadStaticFile = async () => {
            if (!staticFileUrl) return;
            setIsLoading(true);

            try {
                const response = await fetch(staticFileUrl);
                if (!response.ok) {
                    throw new Error(`Could not fetch the required data file from ${staticFileUrl}. Make sure the file exists in the /assets directory.`);
                }
                const blob = await response.blob();
                const fileNameFromUrl = decodeURIComponent(staticFileUrl.split('/').pop() || 'data');
                const file = new File([blob], fileNameFromUrl, { type: blob.type });
                await processAndSetData(file);
            } catch (err) {
                console.error("Static file loading error:", err);
                setError(err instanceof Error ? err.message : "Failed to load initial data.");
                setIsLoading(false);
            }
        };

        loadStaticFile();
    }, [staticFileUrl, processAndSetData]);

    const handleLocalFileUpload = (file: File) => {
        processAndSetData(file);
    };

    const handleOneDriveSuccess = async (files: any) => {
        try {
            if (!files.value || files.value.length === 0) {
                throw new Error("No file selected from OneDrive.");
            }
            const fileInfo = files.value[0];
            const downloadUrl = fileInfo["@microsoft.graph.downloadUrl"];
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error(`Failed to download file from OneDrive: ${response.statusText}`);
            }
            const fileBlob = await response.blob();
            const file = new File([fileBlob], fileInfo.name, { type: fileBlob.type });
            await processAndSetData(file);
        } catch (e) {
            console.error("OneDrive file processing failed:", e);
            setError(e instanceof Error ? e.message : "Failed to download or process the file from OneDrive.");
        }
    };
    
    const handleOneDriveClick = () => {
        if (ONEDRIVE_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
            setError("OneDrive integration is not configured. A developer must provide a Client ID in the code.");
            return;
        }

        const odOptions = {
            clientId: ONEDRIVE_CLIENT_ID, action: "download", multiSelect: false, advanced: { filter: ".xlsx, .csv, .json" },
            success: handleOneDriveSuccess,
            cancel: () => {},
            error: (e: any) => {
                console.error("OneDrive Picker Error:", e);
                setError("An error occurred with the OneDrive picker. Please ensure popups are enabled and try again.");
            }
        };
        (window as any).OneDrive.open(odOptions);
    };

    const handleReset = () => {
        setData(null); setError(null);
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] bg-white rounded-xl shadow-md border border-slate-200">
                <SpinnerIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
                <p className="text-lg font-semibold text-slate-700">Processing data...</p>
                <p className="text-sm text-slate-500 mt-2 transition-opacity duration-500">{loadingMessage}</p>
            </div>
        );
    }
    
    if (data) {
         return (
            <div className="space-y-6">
                 {!isStatic && (
                    <div className="flex justify-end">
                        <button 
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            Upload New File
                        </button>
                    </div>
                )}
                 <Chatbot 
                    dataSource={data}
                    dataDescription={dataDescription}
                    title={`${tabName} Data Chatbot`}
                    welcomeMessage={welcomeMessage}
                    suggestedQuestions={suggestedQuestions}
                    systemInstruction={systemInstruction}
                 />
            </div>
        );
    }

     if (error) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
                {!isStatic && <DataUploader onLocalFileUpload={handleLocalFileUpload} onOneDriveClick={handleOneDriveClick} disabled={isLoading} />}
            </div>
        )
    }
    
    if (isStatic) {
         return (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] bg-white rounded-xl shadow-md border border-slate-200">
                <p className="text-lg font-semibold text-slate-700">Waiting for data...</p>
            </div>
        );
    }
    
    return (
         <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
             <div className="flex items-center mb-6 pb-4 border-b border-slate-200">
                <Icon className="h-8 w-8 mr-4 text-indigo-600" />
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800">{tabName} Insights</h2>
                    <p className="text-slate-500">Upload your data file to get started.</p>
                </div>
            </div>
             <DataUploader onLocalFileUpload={handleLocalFileUpload} onOneDriveClick={handleOneDriveClick} disabled={isLoading} />
        </div>
    );
};
