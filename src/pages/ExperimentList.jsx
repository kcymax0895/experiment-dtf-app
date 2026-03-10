import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Download, Filter, Calendar, Beaker, Package, Edit, Trash2 } from 'lucide-react';
import { getAllExperiments, deleteExperiment } from '../db';

export default function ExperimentList() {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [showFilters, setShowFilters] = useState(false);
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [experiments, filterText]);

    const loadData = async () => {
        const data = await getAllExperiments();
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExperiments(data);
    };

    const applyFilters = () => {
        let result = experiments;
        if (filterText) {
            result = result.filter(exp => {
                const matchMemo = exp.memo && exp.memo.includes(filterText);
                const matchMatteRecipe = exp.matteRecipe && exp.matteRecipe.some(r => r.materialName && r.materialName.includes(filterText));
                const matchTopRecipe = exp.topRecipe && exp.topRecipe.some(r => r.materialName && r.materialName.includes(filterText));
                // backward-compat with old single recipe
                const matchRecipe = exp.recipe && exp.recipe.some(r => r.materialName && r.materialName.includes(filterText));
                const matchBatch = (exp.matteLayer?.batchId && exp.matteLayer.batchId.includes(filterText)) ||
                    (exp.topLayer?.batchId && exp.topLayer.batchId.includes(filterText));
                return matchMemo || matchMatteRecipe || matchTopRecipe || matchRecipe || matchBatch;
            });
        }
        setFilteredData(result);
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await deleteExperiment(id);
            loadData();
        }
    };

    const exportToExcel = () => {
        if (filteredData.length === 0) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }

        const exportData = [];

        filteredData.forEach(exp => {
            const baseRow = {
                '날짜': new Date(exp.date).toLocaleString(),
                '비고/메모': exp.memo || '',
            };

            // 무광 레시피
            const matteRec = exp.matteRecipe || exp.recipe || [];
            matteRec.forEach((mat, idx) => {
                if (mat.materialName) {
                    baseRow[`무광재료명_${idx + 1}`] = mat.materialName;
                    baseRow[`무광투입량_${idx + 1}`] = mat.amount || '';
                    baseRow[`무광비율_${idx + 1}`] = mat.ratio || '';
                }
            });

            // TOP 레시피
            const topRec = exp.topRecipe || [];
            topRec.forEach((mat, idx) => {
                if (mat.materialName) {
                    baseRow[`TOP재료명_${idx + 1}`] = mat.materialName;
                    baseRow[`TOP투입량_${idx + 1}`] = mat.amount || '';
                    baseRow[`TOP비율_${idx + 1}`] = mat.ratio || '';
                }
            });

            // Matte Layer
            const matte = exp.matteLayer || {};
            const matteEval = {
                'M_Batch_ID': matte.batchId || '',
                'M_레이어바': matte.layerBar || '',
                'M_무광종류': matte.matteType || '',
                'M_DRY조건': matte.dryCondition || '',
                'M_도포량': matte.coatingAmount || '',
                'M_코팅외관': matte.coatingAppearance || '',
                'M_슬립성': matte.slipCondition || '',
                'M_대전방지': matte.antiStatic || '',
                'M_얼룩': matte.stain || '',
                'M_이바리': matte.burr || '',
                'M_파우더털림': matte.powderShedding || '',
                'M_박리력_Min': matte.peelForceMin || '',
                'M_박리력_Max': matte.peelForceMax || '',
                'M_박리력_Avg': matte.peelForceAvg || '',
                'M_광택20º': matte.gloss20 || '',
                'M_광택60º': matte.gloss60 || '',
                'M_광택85º': matte.gloss85 || '',
            };

            // Top Layer
            const top = exp.topLayer || {};
            const topEval = {
                'T_Batch_ID': top.batchId || '',
                'T_ICC조건': top.iccCondition || '',
                'T_쉐이커조건': top.shakerCondition || '',
                'T_전사온도': top.transferTemp || '',
                'T_전사시간': top.transferTime || '',
                'T_전사압력': top.transferPressure || '',
                'T_색감': top.colorTone || '',
                'T_선명도': top.printClarity || '',
                'T_내마찰성': top.frictionResistance || '',
                'T_신율탄성': top.elasticity || '',
                'T_얼룩': top.stain || '',
                'T_이바리': top.burr || '',
                'T_흡수성': top.absorbency || '',
                'T_HOTPEEL': top.hotPeel || '',
                'T_COLDPEEL': top.coldPeel || '',
                'T_세탁견뢰도': top.washFastness || ''
            };

            exportData.push({ ...baseRow, ...matteEval, ...topEval });
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DTF_Tests_V4");

        XLSX.writeFile(wb, `DTF_Test_Log_V4_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-6 pt-4 px-2">
                <h2 className="text-2xl font-bold">DTF 기록장 (V4)</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 hover:bg-gray-200'}`}
                    >
                        <Filter size={20} />
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center space-x-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-3 py-2 rounded-lg font-bold shadow-sm"
                    >
                        <Download size={18} />
                        <span className="text-sm">엑셀</span>
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700 animate-slide-down">
                    <h3 className="font-bold mb-3 text-sm text-gray-500">데이터 검색</h3>
                    <input
                        type="text"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder="재료명, Batch ID, 메모 검색"
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            )}

            <div className="space-y-4 px-2">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Beaker size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 font-medium">기록된 실험이 없습니다.</p>
                    </div>
                ) : (
                    filteredData.map(exp => (
                        <div key={exp.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md">
                                    <Calendar size={12} className="mr-1" />
                                    <span>{new Date(exp.date).toLocaleDateString()} {new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/edit/${exp.id}`)}
                                        className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 font-bold flex items-center bg-blue-50 dark:bg-blue-900/20 rounded"
                                    >
                                        <Edit size={12} className="mr-1" />수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exp.id)}
                                        className="text-red-400 hover:text-red-600 text-xs px-2 py-1 font-bold flex items-center bg-red-50 dark:bg-red-900/20 rounded"
                                    >
                                        <Trash2 size={12} className="mr-1" />삭제
                                    </button>
                                </div>
                            </div>

                            {/* Recipe Summary */}
                            <div className="flex space-x-2 mb-3">
                                <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                                        <Package size={12} className="mr-1" /> 무광 레시피 ({(exp.matteRecipe || exp.recipe || []).filter(r => r.materialName).length}종)
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {(exp.matteRecipe || exp.recipe || [])[0]?.materialName || '-'}
                                    </div>
                                </div>
                                <div className="flex-1 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                    <div className="flex items-center text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">
                                        <Package size={12} className="mr-1" /> TOP 레시피 ({(exp.topRecipe || []).filter(r => r.materialName).length}종)
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {(exp.topRecipe || [])[0]?.materialName || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Batch IDs */}
                            {(exp.matteLayer?.batchId || exp.topLayer?.batchId) && (
                                <div className="flex space-x-2 mb-3">
                                    {exp.matteLayer?.batchId && (
                                        <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs truncate">
                                            <span className="font-bold text-blue-600 block mb-0.5">M Batch</span>
                                            {exp.matteLayer.batchId}
                                        </div>
                                    )}
                                    {exp.topLayer?.batchId && (
                                        <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs truncate">
                                            <span className="font-bold text-orange-600 block mb-0.5">T Batch</span>
                                            {exp.topLayer.batchId}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Photos */}
                            {exp.photos && exp.photos.length > 0 && (
                                <div className="flex space-x-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                                    {exp.photos.map((photo, i) => (
                                        <img key={i} src={photo} className="h-14 w-14 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm" alt="Exp" />
                                    ))}
                                </div>
                            )}

                            {exp.memo && (
                                <div className="text-xs text-gray-500 mt-2 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/30 line-clamp-2">
                                    <span className="font-bold mr-1">메모:</span> {exp.memo}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
