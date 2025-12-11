import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
}) => {
    const variants: Record<BadgeVariant, string> = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    };

    const dotColors: Record<BadgeVariant, string> = {
        default: 'bg-gray-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
    };

    return (
        <span className={clsx(
            'inline-flex items-center font-medium rounded-full',
            variants[variant],
            sizes[size]
        )}>
            {dot && (
                <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])} />
            )}
            {children}
        </span>
    );
};

// Predefined status badges for common use cases
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        active: { label: 'Aktif', variant: 'success' },
        sold: { label: 'Satıldı', variant: 'info' },
        deceased: { label: 'Vefat', variant: 'danger' },
        sick: { label: 'Hasta', variant: 'warning' },
        pending: { label: 'Beklemede', variant: 'warning' },
        completed: { label: 'Tamamlandı', variant: 'success' },
        in_progress: { label: 'Devam Ediyor', variant: 'info' },
        planned: { label: 'Planlandı', variant: 'default' },
        failed: { label: 'Başarısız', variant: 'danger' },
        paid: { label: 'Ödendi', variant: 'success' },
        partial: { label: 'Kısmi', variant: 'warning' },
        delivered: { label: 'Teslim Edildi', variant: 'success' },
        in_transit: { label: 'Yolda', variant: 'info' },
        cancelled: { label: 'İptal', variant: 'danger' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };

    return <Badge variant={config.variant} dot>{config.label}</Badge>;
};
