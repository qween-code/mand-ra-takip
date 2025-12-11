import React from 'react';
import { clsx } from 'clsx';

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    loading?: boolean;
}

export function Table<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    emptyMessage = 'Kayıt bulunamadı',
    loading = false,
}: TableProps<T>) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={clsx(
                                        'px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={clsx(
                                        'transition-colors',
                                        onRowClick && 'cursor-pointer hover:bg-gray-50'
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={clsx(
                                                'px-6 py-4 text-sm text-gray-700',
                                                column.className
                                            )}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String((item as Record<string, unknown>)[column.key as string] ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
