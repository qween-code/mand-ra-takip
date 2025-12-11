import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    placeholder = 'Seçiniz...',
    className,
    id,
    value,
    onChange,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={inputId}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={clsx(
                        'block w-full rounded-lg border px-4 py-2.5 pr-10 text-gray-900 shadow-sm transition-colors appearance-none bg-white',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200',
                        className
                    )}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
    );
};
