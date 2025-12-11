import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className,
    id,
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
            <input
                id={inputId}
                className={clsx(
                    'block w-full rounded-lg border px-4 py-2.5 text-gray-900 shadow-sm transition-colors',
                    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
                    error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
            {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    className,
    id,
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
            <textarea
                id={inputId}
                className={clsx(
                    'block w-full rounded-lg border px-4 py-2.5 text-gray-900 shadow-sm transition-colors',
                    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none',
                    error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
    );
};
