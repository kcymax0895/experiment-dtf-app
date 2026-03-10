import React, { useState } from 'react';
import { Plus, Trash2, ClipboardPaste } from 'lucide-react';

export default function DynamicRecipeTable({ title, recipe, onChange, colorTheme }) {
    const MAX_ROWS = 20;
    const [showPaste, setShowPaste] = useState(false);

    const addRow = () => {
        if (recipe.length < MAX_ROWS) {
            onChange([...recipe, { materialName: '', amount: '', ratio: '' }]);
        }
    };

    const removeRow = (index) => {
        const newRecipe = [...recipe];
        newRecipe.splice(index, 1);
        if (newRecipe.length === 0) {
            newRecipe.push({ materialName: '', amount: '', ratio: '' });
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

            const materialName = cols[0] ? cols[0].trim() : '';

            // 헤더 줄 복사 시 건너뛰기
            const isHeader = cols.some(c => c && (c.includes('NV(%)') || c.trim() === 'g' || c.includes('ONE COTTING') || c.includes('Top')));
            if (isHeader) continue;

            let amount = '';
            let ratio = '';

            // 엑셀 원본 구조: [재료명, NV(%), g(투입량), NV g, 비율]
            if (cols.length >= 3) {
                // cols[2]가 실제 투입량(g)
                amount = cols[2] ? cols[2].trim() : '';
            } else if (cols.length === 2) {
                // 만약 2칸만 복사한 경우 대비
                amount = cols[1] ? cols[1].trim() : '';
            }

            if (cols.length >= 5) {
                // cols[4]가 실제 비율
                ratio = cols[4] ? cols[4].trim() : '';
            }

            parsedRecipe.push({ materialName, amount, ratio });
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
                    <p className="text-xs text-gray-500 mb-2 font-medium">엑셀에서 복사한 데이터(재료명, 투입량, 비율) 배열을 아래 빈칸에 붙여넣기(Ctrl+V) 하세요.</p>
                    <textarea
                        className="w-full h-20 p-2 text-sm border rounded focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="여기에 붙여넣기 해주세요..."
                        onChange={handlePasteExcel}
                        autoFocus
                    />
                </div>
            )}

            <div className="overflow-x-auto pb-2">
                <div className="min-w-[420px] px-2 pt-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-1 mb-2 font-bold text-[11px] text-center text-gray-400">
                        <div className="col-span-5 text-left pl-1">재료명 (Material)</div>
                        <div className="col-span-3">투입량</div>
                        <div className="col-span-3">비율 (%)</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-1.5">
                        {recipe.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-1 items-center">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        value={row.materialName}
                                        onChange={(e) => handleChange(idx, 'materialName', e.target.value)}
                                        placeholder="재료명"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={row.amount}
                                        onChange={(e) => handleChange(idx, 'amount', e.target.value)}
                                        placeholder="0"
                                        className={`${inputClass} text-center`}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={row.ratio}
                                        onChange={(e) => handleChange(idx, 'ratio', e.target.value)}
                                        placeholder="0"
                                        className={`${inputClass} text-center`}
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
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
