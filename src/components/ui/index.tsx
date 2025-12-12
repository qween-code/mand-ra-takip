// ═══════════════════════════════════════════════════════════════════════════
// MANDIRA ASISTANI - UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LucideIcon } from 'lucide-react';

// Utility function for merging classes
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Card Components
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true, ...props }) => (
    <div
        className={cn(
            'glass-card p-6',
            hover && 'hover:border-[var(--border-visible)] hover:shadow-[var(--shadow-md)]',
            className
        )}
        {...props}
    >
        {children}
    </div>
);

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'primary' | 'success' | 'warning' | 'accent' | 'info';
    change?: {
        value: number;
        label: string;
    };
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    color = 'primary',
    change
}) => {
    const colorMap = {
        primary: { stat: 'stat-primary', icon: 'icon-primary' },
        success: { stat: 'stat-success', icon: 'icon-success' },
        warning: { stat: 'stat-warning', icon: 'icon-warning' },
        accent: { stat: 'stat-accent', icon: 'icon-accent' },
        info: { stat: 'stat-info', icon: 'icon-info' },
    };

    return (
        <Card className={cn('stat-card', colorMap[color].stat)}>
            <div className={cn('stat-icon', colorMap[color].icon)}>
                <Icon size={24} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
            {change && (
                <div className={cn('stat-change', change.value >= 0 ? 'positive' : 'negative')}>
                    {change.value >= 0 ? '↑' : '↓'} {Math.abs(change.value)}% {change.label}
                </div>
            )}
        </Card>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    className,
    disabled,
    ...props
}) => {
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        success: 'btn-success',
        danger: 'btn-danger',
    };

    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
        icon: 'btn-icon',
    };

    return (
        <button
            className={cn('btn', variantClasses[variant], sizeClasses[size], className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="loading-spinner w-4 h-4" />
            ) : (
                <>
                    {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
                    {children}
                </>
            )}
        </button>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon: Icon,
    className,
    ...props
}) => (
    <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Icon size={18} />
                </div>
            )}
            <input
                className={cn('input', Icon && 'pl-12', error && 'border-[var(--error)]', className)}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-[var(--error)] mt-1">{error}</p>}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Select
// ─────────────────────────────────────────────────────────────────────────────

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    className,
    ...props
}) => (
    <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <select className={cn('input select', error && 'border-[var(--error)]', className)} {...props}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="text-xs text-[var(--error)] mt-1">{error}</p>}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────────────────────

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', dot }) => {
    const variantClasses = {
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
        default: 'badge-default',
    };

    return (
        <span className={cn('badge', variantClasses[variant])}>
            {dot && <span className="w-2 h-2 rounded-full bg-current" />}
            {children}
        </span>
    );
};

// StatusBadge - pre-configured status badges
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
        active: { label: 'Aktif', variant: 'success' },
        sold: { label: 'Satıldı', variant: 'info' },
        deceased: { label: 'Vefat', variant: 'error' },
        sick: { label: 'Hasta', variant: 'warning' },
        pending: { label: 'Beklemede', variant: 'warning' },
        completed: { label: 'Tamamlandı', variant: 'success' },
        in_progress: { label: 'Devam Ediyor', variant: 'info' },
        planned: { label: 'Planlandı', variant: 'default' },
        failed: { label: 'Başarısız', variant: 'error' },
        paid: { label: 'Ödendi', variant: 'success' },
        partial: { label: 'Kısmi', variant: 'warning' },
        delivered: { label: 'Teslim Edildi', variant: 'success' },
        in_transit: { label: 'Yolda', variant: 'info' },
        cancelled: { label: 'İptal', variant: 'error' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant} dot>{config.label}</Badge>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading Spinner
// ─────────────────────────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className={cn('loading-spinner', sizeClasses[size], className)} />
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action
}) => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {Icon && (
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-6">
                <Icon size={32} className="text-[var(--text-muted)]" />
            </div>
        )}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
        {description && (
            <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">{description}</p>
        )}
        {action}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────────────────────────

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    loading,
    emptyMessage = 'Veri bulunamadı'
}: TableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <LoadingSpinner />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--text-secondary)]">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={column.className}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? 'cursor-pointer' : ''}
                        >
                            {columns.map((column) => (
                                <td key={column.key} className={column.className}>
                                    {column.render
                                        ? column.render(item)
                                        : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl animate-fadeIn',
                    sizeClasses[size]
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Date Picker
// ─────────────────────────────────────────────────────────────────────────────

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onChange,
    error
}) => (
    <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn('input', error && 'border-[var(--error)]')}
        />
        {error && <p className="text-xs text-[var(--error)] mt-1">{error}</p>}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────

interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
    <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        activeTab === tab.id
                            ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                >
                    {Icon && <Icon size={16} />}
                    {tab.label}
                </button>
            );
        })}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Quick Number Input (for milk entry)
// ─────────────────────────────────────────────────────────────────────────────

interface QuickNumberInputProps {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    unit?: string;
}

export const QuickNumberInput: React.FC<QuickNumberInputProps> = ({
    value,
    onChange,
    step = 0.5,
    min = 0,
    max = 100,
    unit = 'L'
}) => {
    const decrement = () => onChange(Math.max(min, value - step));
    const increment = () => onChange(Math.min(max, value + step));

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={decrement}
                className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center transition-colors"
            >
                <span className="text-xl text-[var(--text-secondary)]">−</span>
            </button>
            <div className="flex items-center gap-1 min-w-[80px] justify-center">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="w-16 text-center bg-transparent text-lg font-semibold text-[var(--text-primary)] outline-none"
                    step={step}
                    min={min}
                    max={max}
                />
                <span className="text-sm text-[var(--text-muted)]">{unit}</span>
            </div>
            <button
                onClick={increment}
                className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center transition-colors"
            >
                <span className="text-xl text-[var(--text-secondary)]">+</span>
            </button>
        </div>
    );
};
