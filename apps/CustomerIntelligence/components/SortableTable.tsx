import React, { useState, useMemo, ReactNode } from 'react';

const ChevronUpDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 inline-block text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);

const SortUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 inline-block text-slate-600">
        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L6.22 8.78a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
    </svg>
);

const SortDownIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 inline-block text-slate-600">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.03-3.03a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.47 12.47a.75.75 0 111.06-1.06l3.03 3.03V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
    </svg>
);


export interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
}

interface SortConfig<T> {
    key: keyof T | string;
    direction: 'ascending' | 'descending';
}

interface SortableTableProps<T> {
    columns: Column<T>[];
    data: T[];
}

export const SortableTable = <T extends {}>({ columns, data }: SortableTableProps<T>) => {
    const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof T];
                const bValue = b[sortConfig.key as keyof T];
                
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: keyof T | string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionIcon = (key: keyof T | string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronUpDownIcon />;
        }
        return sortConfig.direction === 'ascending' ? <SortUpIcon/> : <SortDownIcon />;
    };

    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key as string}
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                            >
                                {column.sortable ? (
                                    <button
                                        type="button"
                                        onClick={() => requestSort(column.key)}
                                        className="flex items-center font-medium text-slate-500 hover:text-slate-700"
                                    >
                                        {column.header}
                                        <span className="ml-1">{getSortDirectionIcon(column.key)}</span>
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                            {columns.map((column) => (
                                <td key={column.key as string} className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                    {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};