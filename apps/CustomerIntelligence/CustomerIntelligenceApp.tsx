import React, { useState, useCallback, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { InputPanel } from './components/InputPanel';
import { DigestDisplay } from './components/DigestDisplay';
import { Dashboard } from './components/Dashboard';
import { FactPopup } from './components/FactPopup';
import { PdfViewerModal } from './components/PdfViewerModal';
import { generateCompanyDigest, generateCompanyFacts } from '../../services/geminiService';
import { getDigestsForCurrentMonth, saveDigest } from '../../services/storageService';
import type { DigestData } from '../../types';
import { SpinnerIcon } from './components/icons';

export const CustomerIntelligenceApp: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'generating' | 'digest'>('dashboard');
    const [savedDigests, setSavedDigests] = useState<DigestData[]>([]);
    const [currentDigest, setCurrentDigest] = useState<DigestData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State for "Did you know" facts
    const [facts, setFacts] = useState<string[]>([]);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);

    // State for PDF operations
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
    const [digestForPdf, setDigestForPdf] = useState<DigestData | null>(null);
    const [pdfAction, setPdfAction] = useState<'view' | 'download' | null>(null);
    const pdfCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSavedDigests(getDigestsForCurrentMonth());
    }, []);

    // Effect to cycle through facts during loading
    useEffect(() => {
        if (view === 'generating' && facts.length > 0) {
            const interval = setInterval(() => {
                setCurrentFactIndex(prevIndex => (prevIndex + 1) % facts.length);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [view, facts]);
    
    const generateAndProcessPdf = useCallback(async () => {
        if (!pdfCardRef.current || !pdfLoadingId || !pdfAction) {
            return;
        }

        const digest = savedDigests.find(d => d.id === pdfLoadingId);
        if (!digest) {
            setError("Could not find the selected report.");
            setPdfLoadingId(null);
            setDigestForPdf(null);
            setPdfAction(null);
            return;
        }

        try {
            const canvas = await html2canvas(pdfCardRef.current, {
                scale: 2,
                useCORS: true,
                windowWidth: 1200,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.width / canvas.height;
            let imgWidth = pdfWidth - 20;
            let imgHeight = imgWidth / canvasAspectRatio;
            let pageCount = Math.ceil(imgHeight / (pdfHeight - 20));
            for (let i = 0; i < pageCount; i++) {
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, -(pdfHeight - 20) * i + 10, imgWidth, imgHeight);
            }

            if (pdfAction === 'download') {
                pdf.save(`digest-${digest.companyName.replace(/\s+/g, '-')}.pdf`);
            } else { // 'view'
                const url = pdf.output('bloburl');
                setPdfUrl(url.toString());
            }
        } catch (err) {
            console.error("PDF Generation Error:", err);
            setError("Failed to generate the PDF. Please try again.");
        } finally {
            // Cleanup state after operation
            setPdfLoadingId(null);
            setDigestForPdf(null);
            setPdfAction(null);
        }
    }, [pdfLoadingId, pdfAction, savedDigests]);

    // This effect triggers the PDF generation once the component is rendered off-screen
    useEffect(() => {
        if (digestForPdf && pdfAction && pdfCardRef.current) {
            // A short timeout can help ensure all images/styles are loaded before capture
            const timer = setTimeout(() => {
                generateAndProcessPdf();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [digestForPdf, pdfAction, generateAndProcessPdf]);

    const handleGenerateDigest = useCallback(async (company: string) => {
        if (!company) {
            setError("Please enter a company name.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setView('generating');
        setFacts([]);
        setCurrentFactIndex(0);

        try {
            const fetchedFacts = await generateCompanyFacts(company);
            setFacts(fetchedFacts);

            const digest = await generateCompanyDigest(company);
            saveDigest(digest);
            setSavedDigests(getDigestsForCurrentMonth());
            setCurrentDigest(digest);
            setView('digest');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setView('dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleBackToDashboard = () => {
        setCurrentDigest(null);
        setError(null);
        setView('dashboard');
    };

    const handlePdfRequest = (digestId: string, action: 'view' | 'download') => {
        if (pdfLoadingId) return; // Prevent multiple requests

        const digest = savedDigests.find(d => d.id === digestId);
        if (digest) {
            setError(null);
            setPdfAction(action);
            setPdfLoadingId(digestId);
            setDigestForPdf(digest); // This will trigger the useEffect
        }
    };
    
    const handleClosePdfViewer = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
    };

    const renderContent = () => {
        if (view === 'generating') {
            return (
                 <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                    <SpinnerIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
                    <p className="text-lg font-semibold text-slate-700">Generating Digest...</p>
                    <p className="text-sm text-slate-500">This may take a moment.</p>
                </div>
            );
        }
        if (view === 'digest' && currentDigest) {
            return <DigestDisplay digest={currentDigest} onBack={handleBackToDashboard} />;
        }
        return (
            <Dashboard 
                digests={savedDigests} 
                onView={(id) => handlePdfRequest(id, 'view')}
                onDownload={(id) => handlePdfRequest(id, 'download')}
                pdfLoadingId={pdfLoadingId}
            />
        );
    };

    return (
        <div className="w-full">
            {view === 'generating' && facts.length > 0 && <FactPopup fact={facts[currentFactIndex]} />}
            {pdfUrl && <PdfViewerModal url={pdfUrl} onClose={handleClosePdfViewer} />}
            
            {/* Off-screen renderer for PDF generation */}
            {digestForPdf && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1200px' }}>
                    <div ref={pdfCardRef}>
                         <DigestDisplay digest={digestForPdf} onBack={() => {}} isPdfMode={true} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-8">
                         <InputPanel onGenerate={handleGenerateDigest} isLoading={isLoading} />
                    </div>
                </aside>

                <div className="lg:col-span-8 xl:col-span-9">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};