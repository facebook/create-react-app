import { InputHTMLAttributes, ReactNode, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helper?: string;
    leadingIcon?: ReactNode;
}

export function Input({
    label,
    error,
    helper,
    leadingIcon,
    className = '',
    id: providedId,
    ...props
}: InputProps) {
    const generatedId = useId();
    const id = providedId ?? generatedId;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="mb-1 block text-sm font-medium text-slate-700"
                >
                    {label}
                    {props.required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
            )}
            <div className="relative">
                {leadingIcon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        {leadingIcon}
                    </div>
                )}
                <input
                    id={id}
                    className={[
                        'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
                        'placeholder:text-slate-400 focus:outline-none focus:ring-2',
                        error
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                            : 'border-slate-300 focus:border-indigo-400 focus:ring-indigo-300',
                        leadingIcon ? 'pl-10' : '',
                        className,
                    ].join(' ')}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
            {!error && helper && (
                <p className="mt-1 text-xs text-slate-500">{helper}</p>
            )}
        </div>
    );
}
