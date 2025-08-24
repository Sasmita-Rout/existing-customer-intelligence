
import React from 'react';
import type { FinancialMetric } from '../types';

interface FinancialsTableProps {
    data: FinancialMetric[];
}

export const FinancialsTable: React.FC<FinancialsTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-sm text-slate-500">No financial metrics available.</p>;
    }

    return (
        <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Metric
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Value
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {data.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{item.metric}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
