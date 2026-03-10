import React, { useState } from 'react';
import { Plus, Trash2, ClipboardPaste } from 'lucide-react';

export default function DynamicRecipeTable({ title, recipe, onChange, colorTheme }) {
    const MAX_ROWS = 20;
    const [showPaste, setShowPaste] = useState(false);

    const addRow = () => {
        if (recipe.length < MAX_ROWS) {
            onChange([...recipe, { materialName: '', nvPercent: '', amount: '', nvg: '', ratio: '' }]);
        }
    };

    const removeRow = (index) => {
        const newRecipe = [...recipe];
        newRecipe.splice(index, 1);
        if (newRecipe.length === 0) {
            newRecipe.push({ materialName: '', nvPercent: '', amount: '', nvg: '', ratio: '' });
        }
        onChange(newRecipe);
    };

    const handleChange = (index, field, value) => {
        const newRecipe = [...recipe];
        newRecipe[index] = { ...newRecipe[index], [field]: value };
        onChange(newRecipe);
    };

    const handlePasteExcel = (e) => {
        const text = e.target.value;
        if (!text.trim()) return;

        const rows = text.trim().split('\n');
        const parsedRecipe = [];

        for (const row of rows) {
            if (row.trim() === '') continue;
            const cols = row.split('\t');

            // 헤더 줄 복사 시 건너뛰기
            const isHeader = cols.some(c => c && (c.includes('NV(%)') || c.trim() === 'g' || c.includes('ONE COTTING') || c.includes('Top')));
            if (isHeader) continue;

            const materialName = cols[0] ? cols[0].trim() : '';
            const nvPercent = cols[1] ? cols[1].trim() : '';
            const amount = cols[2] ? cols[2].trim() : '';
            const nvg = cols[3] ? cols[3].trim() : '';
            const ratio = cols[4] ? cols[4].trim() : '';

            parsedRecipe.push({ materialName, nvPercent, amount, nvg, ratio });
            if (parsedRecipe.length >= MAX_ROWS) break;
        }

        if (parsedRecipe.length > 0) {
            onChange(parsedRecipe);
        }
        setShowPaste(false);
    };

    const inputClass = "w-full p-2.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-shadow";

    // Theme colors based on layer type
    const isMatte = colorTheme === 'matte';
    const headerBg = isMatte ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30';
    const headerText = isMatte ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300';
    const btnBg = isMatte ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';

    return (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className={`flex justify-between items-center p-3 ${headerBg}`}>
                <h3 className={`font-bold text-sm ${headerText}`}>
                    {title} (최대 {MAX_ROWS}개)
                </h3>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setShowPaste(!showPaste)}
                        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-md font-bold transition-colors shadow-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}
                    >
                        <ClipboardPaste size={14} />
                        <span>엑셀 붙여넣기</span>
                    </button>
                    <button
                        type="button"
                        onClick={addRow}
                        disabled={recipe.length >= MAX_ROWS}
                        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-md disabled:opacity-50 font-bold ${btnBg}`}
                    >
                        <Plus size={14} />
                        <span>행 추가</span>
                    </button>
                </div>
            </div>

            {showPaste && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 animate-fade-in">
                    <p className="text-xs text-gray-500 mb-2 font-medium">엑셀 표를 통째로 복사해서 빈칸에 붙여넣기(Ctrl+V) 하세요.</p>
                    <textarea
                        className="w-full h-20 p-2 text-sm border rounded focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="[재료명, NV(%), g, NV g, 비율] 5칸 표를 여기에 붙여넣어주세요..."
                        onChange={handlePasteExcel}
                        autoFocus
                    />
                </div>
            )}

            <div className="overflow-x-auto pb-2">
                <div className="min-w-[650px] px-2 pt-2">
                    {/* Header */}
                    <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_40px] gap-2 mb-2 font-bold text-[11px] text-center text-gray-400 items-center">
                        <div className="text-left pl-1">재료명 (Material)</div>
                        <div>NV(%)</div>
                        <div>투입량(g)</div>
                        <div>NV g</div>
                        <div>비율(%)</div>
                        <div></div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-1.5">
                        {recipe.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_40px] gap-2 items-center">
                                <div>
                                    <input
                                        type="text"
                                        value={row.materialName || ''}
                                        onChange={(e) => handleChange(idx, 'materialName', e.target.value)}
                                        placeholder="재료명"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.nvPercent || ''}
                                        onChange={(e) => handleChange(idx, 'nvPercent', e.target.value)}
                                        placeholder="%"
                                        className={`${inputClass} text-center`}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.amount || ''}
                                        onChange={(e) => handleChange(idx, 'amount', e.target.value)}
                                        placeholder="g"
                                        className={`${inputClass} text-center`}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.nvg || ''}
                                        onChange={(e) => handleChange(idx, 'nvg', e.target.value)}
                                        placeholder="0"
                                        className={`${inputClass} text-center`}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.ratio || ''}
                                        onChange={(e) => handleChange(idx, 'ratio', e.target.value)}
                                        placeholder="%"
                                        className={`${inputClass} text-center`}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeRow(idx)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
