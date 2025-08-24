
import React, { useState, useMemo } from 'react';
import { ChevronUpDownIcon } from './icons';

type SortDirection = 'asc' | 'desc';

interface Column<T> {
    key: keyof T | (string & {});
    header: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface SortableTableProps<T> {
    columns: Column<T>[];
    data: T[];
}

export const SortableTable = <T extends {}>({ columns, data }: SortableTableProps<T>) => {
    const [sortColumn, setSortColumn] = useState<keyof T | (string & {}) | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (columnKey: keyof T | (string & {})) => {
        if (sortColumn === columnKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortColumn) {
            return data;
        }

        return [...data].sort((a, b) => {
            const aValue = a[sortColumn as keyof T];
            const bValue = b[sortColumn as keyof T];

            // Basic comparison, assumes string, number or date string
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortColumn, sortDirection]);

    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                            >
                                {col.sortable ? (
                                    <button
                                        onClick={() => handleSort(col.key)}
                                        className="flex items-center space-x-1 group"
                                        aria-label={`Sort by ${col.header}`}
                                    >
                                        <span>{col.header}</span>
                                        <ChevronUpDownIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    </button>
                                ) : (
                                    col.header
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                            {columns.map((col) => (
                                <td key={String(col.key)} className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                    {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
