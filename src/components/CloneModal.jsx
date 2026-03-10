import React from 'react';
import { X, Calendar } from 'lucide-react';

export default function CloneModal({ isOpen, onClose, experiments, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-lg">기존 레시피 불러오기</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1 space-y-3">
                    {experiments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">저장된 실험 데이터가 없습니다.</div>
                    ) : (
                        experiments.map(exp => (
                            <button
                                key={exp.id}
                                onClick={() => onSelect(exp)}
                                className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex flex-col space-y-2 group"
                            >
                                <div className="flex items-center text-xs text-gray-500 font-medium">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(exp.date).toLocaleString()}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs w-full">
                                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded truncate group-hover:bg-white dark:group-hover:bg-gray-800">
                                        <span className="font-bold text-blue-600 block mb-1">무광 레시피</span>
                                        {exp.matteRecipe?.[0]?.materialName || '비어있음'} 외 {Math.max(0, (exp.matteRecipe?.length || 0) - 1)}종
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded truncate group-hover:bg-white dark:group-hover:bg-gray-800">
                                        <span className="font-bold text-orange-600 block mb-1">TOP 레시피</span>
                                        {exp.topRecipe?.[0]?.materialName || '비어있음'} 외 {Math.max(0, (exp.topRecipe?.length || 0) - 1)}종
                                    </div>
                                </div>
                                {exp.memo && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate w-full">
                                        메모: {exp.memo}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
