import React, { useState, useRef, useMemo, forwardRef } from 'react';
import type { DigestData, OpenPosition } from '../../../types';
import { BuildingIcon, DownloadIcon, SpinnerIcon, LinkIcon, ChartBarIcon, TrendingUpIcon, NewsIcon, UsersIcon, BriefcaseIcon, LightBulbIcon, TargetIcon } from './icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FinancialsTable } from './FinancialsTable';
import { SortableTable } from './SortableTable';

interface DigestCardProps {
    digest: DigestData;
}

const Section: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; className?: string }> = ({ title, icon: Icon, children, className = '' }) => (
    <div className={className}>
        <div className="flex items-center mb-4 pb-2 border-b border-slate-200">
            {Icon && <Icon className="h-6 w-6 mr-3 text-indigo-600" />}
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        </div>
        {children}
    </div>
);

const BulletList: React.FC<{items: string[]}> = ({ items }) => {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-500">No information available for this section.</p>;
    }
    return (
        <ul className="space-y-3 list-inside">
            {items.map((point, index) => (
               <li key={index} className="flex items-start">
                 <span className="text-slate-400 font-bold mr-3 mt-1">&#8227;</span>
                 <span className="text-slate-600 leading-relaxed">{point}</span>
               </li>
            ))}
        </ul>
    );
}

const openPositionsColumns = [
    {
        key: 'title',
        header: 'Position',
        sortable: true,
        render: (item: OpenPosition) => (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center group">
                {item.title}
                <LinkIcon className="h-3 w-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
        )
    },
    {
        key: 'region',
        header: 'Region',
        sortable: true,
    },
    {
        key: 'source',
        header: 'Source',
        sortable: true,
    },
    {
        key: 'datePosted',
        header: 'Date Posted',
        sortable: true,
    }
];

export const DigestCard = forwardRef<HTMLDivElement, DigestCardProps>(({ digest }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const cardRef = ref || internalRef;
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        const cardElement = (cardRef as React.RefObject<HTMLDivElement>)?.current;
        if (!cardElement || isDownloading) return;
        setIsDownloading(true);

        const cardClone = cardElement.cloneNode(true) as HTMLElement;
        const noPrintElements = cardClone.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.remove());

        cardClone.style.position = 'absolute';
        cardClone.style.left = '-9999px';
        cardClone.style.top = '0px';
        cardClone.style.width = '1200px'; 
        cardClone.style.margin = '0';
        cardClone.style.padding = '32px';

        document.body.appendChild(cardClone);
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(cardClone, {
                scale: 2, useCORS: true, windowWidth: cardClone.scrollWidth, windowHeight: cardClone.scrollHeight, logging: false,
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
            
            pdf.save(`digest-${digest.companyName.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("An error occurred while generating the PDF.");
        } finally {
            document.body.removeChild(cardClone);
            setIsDownloading(false);
        }
    };
    
    const regionSummary = useMemo(() => {
        if (!digest.openPositions || digest.openPositions.length === 0) return null;
        const counts = digest.openPositions.reduce((acc, pos) => {
            const region = pos.region || 'N/A';
            acc[region] = (acc[region] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(counts).map(([region, count]) => `${region}: ${count}`).join(' | ');
    }, [digest.openPositions]);

    const hasFinancials = (digest.revenueGrowth && digest.revenueGrowth.length > 0) || 
                          (digest.keyFinancials && digest.keyFinancials.length > 0) || 
                          (digest.quarterlyReleases && digest.quarterlyReleases.length > 0);

    return (
        <div ref={cardRef} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 transition-shadow hover:shadow-xl printable-area">
            <header className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-center h-16 w-16">
                        <BuildingIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">{digest.companyName}</h2>
                </div>
                 <div className="flex space-x-2 no-print">
                    <button 
                        onClick={handleDownloadPdf} 
                        disabled={isDownloading}
                        className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                        title="Download as PDF"
                    >
                        {isDownloading ? (
                            <>
                                <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Downloading...
                            </>
                        ) : (
                             <>
                                <DownloadIcon className="h-5 w-5 mr-2" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="space-y-10">
                {digest.overview && (
                    <Section title="Overview">
                        <p className="text-slate-600 leading-relaxed">{digest.overview}</p>
                    </Section>
                )}

                {digest.keyHighlights && digest.keyHighlights.length > 0 && (
                    <Section title="Key Highlights">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {digest.keyHighlights.map((highlight, index) => (
                                 <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start">
                                    <span className="text-indigo-500 font-bold mr-3 mt-1">&#8227;</span>
                                    <p className="text-slate-700 flex-grow">{highlight}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
                
                {hasFinancials && (
                    <Section title="Financial Performance" icon={ChartBarIcon}>
                        <div className="space-y-8">
                            {(digest.revenueGrowth && digest.revenueGrowth.length > 0 || digest.keyFinancials && digest.keyFinancials.length > 0) &&
                                <div className="grid md:grid-cols-5 gap-8 items-start">
                                    {digest.revenueGrowth && digest.revenueGrowth.length > 0 && (
                                        <div className="md:col-span-3">
                                            <h4 className="text-md font-semibold text-slate-700 mb-3">Quarterly Revenue Growth</h4>
                                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                                <table className="min-w-full divide-y divide-slate-200">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Period</th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue (USD)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-slate-200">
                                                        {digest.revenueGrowth.map((item, index) => (
                                                            <tr key={index} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{item.period}</td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{`${item.revenue}B`}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {digest.keyFinancials && digest.keyFinancials.length > 0 && (
                                        <div className="md:col-span-2">
                                            <h4 className="text-md font-semibold text-slate-700 mb-3">Key Metrics</h4>
                                            <FinancialsTable data={digest.keyFinancials} />
                                        </div>
                                    )}
                                </div>
                            }
                            {digest.quarterlyReleases && digest.quarterlyReleases.length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-slate-700 mb-3">Quarterly Releases</h4>
                                    <BulletList items={digest.quarterlyReleases} />
                                </div>
                            )}
                        </div>
                    </Section>
                )}
                
                {digest.newsAndPressReleases && digest.newsAndPressReleases.length > 0 && (
                    <Section title="News and Press Releases" icon={NewsIcon}>
                        <BulletList items={digest.newsAndPressReleases} />
                    </Section>
                )}

                {digest.newJoiners && digest.newJoiners.length > 0 && (
                    <Section title="New Joiners (CXO, VP)" icon={UsersIcon}>
                        <BulletList items={digest.newJoiners} />
                    </Section>
                )}
                
                {(digest.techFocus || (digest.techDistribution && digest.techDistribution.length > 0)) && (
                    <Section title="Technology in Focus">
                         <div className="grid md:grid-cols-5 gap-8 items-start mt-4">
                            {digest.techFocus && (
                                <div className={(digest.techDistribution && digest.techDistribution.length > 0) ? "md:col-span-3" : "md:col-span-5"}>
                                    <p className="text-slate-600 leading-relaxed mb-4">{digest.techFocus}</p>
                                </div>
                            )}
                            {digest.techDistribution && digest.techDistribution.length > 0 && (
                                <div className={digest.techFocus ? "md:col-span-2" : "md:col-span-5"}>
                                   <h4 className="text-md font-semibold text-slate-700 mb-3">Tech Distribution</h4>
                                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Technology</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Focus</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {digest.techDistribution.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{item.tech}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{`${item.percentage}%`}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                         </div>
                    </Section>
                )}

                {digest.strategicAndHiringInsights && (
                    <Section title="Strategic & Hiring Insights" icon={TrendingUpIcon}>
                        <p className="text-slate-600 leading-relaxed">{digest.strategicAndHiringInsights}</p>
                    </Section>
                )}
                
                {digest.openPositions && digest.openPositions.length > 0 && (
                    <Section title="Open Positions" icon={BriefcaseIcon}>
                        {regionSummary && (
                            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600">
                                <span className="font-semibold text-slate-700">Positions by Region: </span> {regionSummary}
                            </div>
                        )}
                        <SortableTable 
                            columns={openPositionsColumns} 
                            data={digest.openPositions} 
                        />
                    </Section>
                )}

                {digest.attentionPointsForAccionlabs && digest.attentionPointsForAccionlabs.length > 0 && (
                    <Section title="Attention Points for Accionlabs" icon={TargetIcon}>
                         <div className="bg-indigo-50 border-l-4 border-indigo-400 p-5 rounded-r-md">
                            <BulletList items={digest.attentionPointsForAccionlabs} />
                        </div>
                    </Section>
                )}

            </div>

            <footer className="mt-10 pt-6 border-t border-slate-200">
                {digest.sources.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-base font-semibold text-slate-800 mb-3">Further Reading & Sources</h4>
                        <ul className="space-y-2">
                            {digest.sources.map((source, index) => (
                                <li key={index} className="flex items-start">
                                    <LinkIcon className="h-4 w-4 text-slate-400 mr-3 mt-1 flex-shrink-0" />
                                    <a
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline break-all"
                                        title={source.uri}
                                    >
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 <div className="text-xs text-slate-500 text-center mt-6">
                    <span>Copyright © 2025 Accionlabs. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
});