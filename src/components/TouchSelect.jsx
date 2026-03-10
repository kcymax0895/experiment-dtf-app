import React from 'react';

export default function TouchSelect({ label, value, onChange, optionsType }) {
    // Types: 'OXTriangle' (○, △, ✕), 'Boolean' (無, 有)

    let options = [];
    if (optionsType === 'OXTriangle') {
        options = [
            { label: '○', value: '○', bg: 'bg-primary-500', text: 'text-white' },
            { label: '△', value: '△', bg: 'bg-orange-400', text: 'text-white' },
            { label: '✕', value: '✕', bg: 'bg-danger-500', text: 'text-white' }
        ];
    } else if (optionsType === 'Boolean') {
        options = [
            { label: '無 (없음)', value: '無', bg: 'bg-success-500', text: 'text-white' },
            { label: '有 (있음)', value: '有', bg: 'bg-danger-500', text: 'text-white' }
        ];
    }

    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{label}</label>}
            <div className="flex space-x-2">
                {options.map((opt) => {
                    const isSelected = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`flex-1 py-3 px-2 rounded-xl text-lg font-bold transition-colors shadow-sm
                ${isSelected
                                    ? `${opt.bg} ${opt.text} ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900`
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
