import React from 'react';

export default function RatingButton({ label, value, onChange }) {
    const options = [
        { label: '우수', bg: 'bg-primary-500', text: 'text-white' },
        { label: '보통', bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' },
        { label: '불량', bg: 'bg-danger-500', text: 'text-white' }
    ];

    return (
        <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="flex space-x-2">
                {options.map((opt) => {
                    const isSelected = value === opt.label;
                    return (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => onChange(opt.label)}
                            className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-colors shadow-sm
                ${isSelected
                                    ? `${opt.bg} ${opt.text} ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-900`
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                }
              `}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
