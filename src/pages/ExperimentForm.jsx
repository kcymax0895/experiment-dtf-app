import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Save, Mic } from 'lucide-react';
import { addExperiment, getAllExperiments } from '../db';
import DynamicRecipeTable from '../components/DynamicRecipeTable';
import TouchSelect from '../components/TouchSelect';
import PhotoUploader from '../components/PhotoUploader';
import CloneModal from '../components/CloneModal';

export default function ExperimentForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('matte');
    const [isListening, setIsListening] = useState(false);

    const [isCloneModalOpen, setCloneModalOpen] = useState(false);
    const [pastExperiments, setPastExperiments] = useState([]);

    const defaultRecipeRow = { materialName: '', amount: '', ratio: '' };

    const [formData, setFormData] = useState({
        matteRecipe: [{ ...defaultRecipeRow }],
        topRecipe: [{ ...defaultRecipeRow }],
        matteLayer: {
            batchId: '',
            layerBar: '',
            matteType: '',
            dryCondition: '',
            coatingAmount: '',
            coatingAppearance: '○',
            slipCondition: '○',
            antiStatic: '○',
            stain: '無',
            burr: '無',
            powderShedding: '',
            peelForceMin: '',
            peelForceMax: '',
            peelForceAvg: '',
            gloss20: '',
            gloss60: '',
            gloss85: ''
        },
        topLayer: {
            batchId: '',
            iccCondition: '',
            shakerCondition: '',
            transferTemp: '',
            transferTime: '',
            transferPressure: '',
            colorTone: '○',
            printClarity: '○',
            frictionResistance: '○',
            elasticity: '○',
            stain: '無',
            burr: '無',
            absorbency: '',
            hotPeel: '',
            coldPeel: '',
            washFastness: ''
        },
        memo: '',
        photos: []
    });

    const handleMatteRecipeChange = (newRecipe) => setFormData(prev => ({ ...prev, matteRecipe: newRecipe }));
    const handleTopRecipeChange = (newRecipe) => setFormData(prev => ({ ...prev, topRecipe: newRecipe }));

    const handleMatteChange = (field, value) => {
        setFormData(prev => ({ ...prev, matteLayer: { ...prev.matteLayer, [field]: value } }));
    };

    const handleTopChange = (field, value) => {
        setFormData(prev => ({ ...prev, topLayer: { ...prev.topLayer, [field]: value } }));
    };

    const openCloneModal = async () => {
        const data = await getAllExperiments();
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPastExperiments(data);
        setCloneModalOpen(true);
    };

    const handleCloneSelect = (selectedExp) => {
        setFormData(prev => ({
            ...prev,
            matteRecipe: selectedExp.matteRecipe || selectedExp.recipe || [{ ...defaultRecipeRow }],
            topRecipe: selectedExp.topRecipe || [{ ...defaultRecipeRow }],
        }));
        setCloneModalOpen(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const newExp = { ...formData, date: new Date().toISOString() };
            await addExperiment(newExp);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const toggleVoiceMemo = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다. (크롬 브라우저를 사용해주세요)');
            return;
        }

        if (isListening) {
            // Because we create a new instance inside the function, stopping an old instance directly is tricky without state hook for the instance,
            // but for simple mobile usage, auto-stopping upon result or error is sufficient. 
            // We just let the UI handle it by not starting a new one.
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                memo: prev.memo ? prev.memo + ' ' + transcript : transcript
            }));
            setIsListening(false);
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    const inputClass = "w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base sm:text-lg transition-shadow shadow-sm mb-4";
    const labelClass = "block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300";

    return (
        <div className="max-w-md mx-auto animate-fade-in relative flex flex-col min-h-screen pb-64">
            <div className="flex justify-between items-center mb-6 pt-4 px-4 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 w-full backdrop-blur-md bg-opacity-90 py-3 inset-x-0">
                <h2 className="text-2xl font-bold">DTF 테스트 기록 V4</h2>
                <button
                    onClick={openCloneModal}
                    className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50 px-3 py-2 rounded-lg font-bold shadow-sm"
                >
                    <Copy size={18} />
                    <span className="text-sm">레시피 복제</span>
                </button>
            </div>

            <CloneModal
                isOpen={isCloneModalOpen}
                onClose={() => setCloneModalOpen(false)}
                experiments={pastExperiments}
                onSelect={handleCloneSelect}
            />

            <div className="px-4">
                {/* 1. Two separate recipe tables */}
                <div className="space-y-4 mb-6">
                    <DynamicRecipeTable
                        title="🔵 무광(이형층) 배합비"
                        recipe={formData.matteRecipe}
                        onChange={handleMatteRecipeChange}
                        colorTheme="blue"
                    />
                    <DynamicRecipeTable
                        title="🟠 TOP(수용층) 배합비"
                        recipe={formData.topRecipe}
                        onChange={handleTopRecipeChange}
                        colorTheme="orange"
                    />
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl bg-gray-200 dark:bg-gray-800 p-1 mb-6 shadow-sm sticky top-[72px] z-10 w-full backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('matte')}
                        className={`flex-1 py-3 px-2 rounded-lg font-bold text-[13px] sm:text-sm transition-colors ${activeTab === 'matte' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        🔵 무광(이형층) 평가
                    </button>
                    <button
                        onClick={() => setActiveTab('top')}
                        className={`flex-1 py-3 px-2 rounded-lg font-bold text-[13px] sm:text-sm transition-colors ${activeTab === 'top' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        🟠 TOP(수용층) 평가
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                    {activeTab === 'matte' && (
                        <div className="animate-fade-in space-y-2">
                            <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400 border-b pb-2">무광(이형층) 평가 데이터</h3>

                            <label className={labelClass}>Batch ID</label>
                            <input type="text" value={formData.matteLayer.batchId} onChange={(e) => handleMatteChange('batchId', e.target.value)} className={inputClass} placeholder="입력" />

                            <label className={labelClass}>레이어바 (#)</label>
                            <input type="text" value={formData.matteLayer.layerBar} onChange={(e) => handleMatteChange('layerBar', e.target.value)} className={inputClass} placeholder="예: #10" />

                            <label className={labelClass}>무광 종류</label>
                            <input type="text" value={formData.matteLayer.matteType} onChange={(e) => handleMatteChange('matteType', e.target.value)} className={inputClass} placeholder="무광 종류 입력" />

                            <label className={labelClass}>DRY 조건</label>
                            <input type="text" value={formData.matteLayer.dryCondition} onChange={(e) => handleMatteChange('dryCondition', e.target.value)} className={inputClass} placeholder="조건 입력" />

                            <label className={labelClass}>도포량 (g/m²)</label>
                            <input type="number" step="0.1" value={formData.matteLayer.coatingAmount} onChange={(e) => handleMatteChange('coatingAmount', e.target.value)} className={inputClass} placeholder="단위: g/m²" />

                            {/* Selectors */}
                            <TouchSelect label="코팅 외관" value={formData.matteLayer.coatingAppearance} onChange={(v) => handleMatteChange('coatingAppearance', v)} optionsType="OXTriangle" />
                            <TouchSelect label="슬립성" value={formData.matteLayer.slipCondition} onChange={(v) => handleMatteChange('slipCondition', v)} optionsType="OXTriangle" />
                            <TouchSelect label="대전방지" value={formData.matteLayer.antiStatic} onChange={(v) => handleMatteChange('antiStatic', v)} optionsType="OXTriangle" />
                            <TouchSelect label="얼룩 유무" value={formData.matteLayer.stain} onChange={(v) => handleMatteChange('stain', v)} optionsType="Boolean" />
                            <TouchSelect label="이바리" value={formData.matteLayer.burr} onChange={(v) => handleMatteChange('burr', v)} optionsType="Boolean" />

                            <label className={labelClass}>파우더 털림 (0~1.0)</label>
                            <input type="number" step="0.1" min="0" max="1" value={formData.matteLayer.powderShedding} onChange={(e) => handleMatteChange('powderShedding', e.target.value)} className={inputClass} placeholder="0 ~ 1.0" />

                            {/* 박리력 → Min / Max / Avg */}
                            <label className={labelClass}>박리력 (Min / Max / Avg)</label>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div>
                                    <input type="number" step="0.01" value={formData.matteLayer.peelForceMin} onChange={(e) => handleMatteChange('peelForceMin', e.target.value)} className={`${inputClass} !mb-1 text-center`} placeholder="Min" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">Min</span>
                                </div>
                                <div>
                                    <input type="number" step="0.01" value={formData.matteLayer.peelForceMax} onChange={(e) => handleMatteChange('peelForceMax', e.target.value)} className={`${inputClass} !mb-1 text-center`} placeholder="Max" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">Max</span>
                                </div>
                                <div>
                                    <input type="number" step="0.01" value={formData.matteLayer.peelForceAvg} onChange={(e) => handleMatteChange('peelForceAvg', e.target.value)} className={`${inputClass} !mb-1 text-center`} placeholder="Avg" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">Avg</span>
                                </div>
                            </div>

                            {/* GU Values */}
                            <label className={labelClass}>광택 (GU)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <input type="number" value={formData.matteLayer.gloss20} onChange={(e) => handleMatteChange('gloss20', e.target.value)} className={`${inputClass} !mb-1 text-center`} placeholder="20º" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">20º</span>
                                </div>
                                <div>
                                    <input type="number" value={formData.matteLayer.gloss60} onChange={(e) => handleMatteChange('gloss60', e.target.value)} className={`${inputClass} !mb-1 text-center`} placeholder="60º" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">60º</span>
                                </div>
                                <div>
                                    <input type="number" value={formData.matteLayer.gloss85} onChange={(e) => handleMatteChange('gloss85', e.target.value)} className={`${inputClass} !mb-1 text-center`} placeholder="85º" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">85º</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'top' && (
                        <div className="animate-fade-in space-y-2">
                            <h3 className="text-lg font-bold mb-4 text-orange-600 dark:text-orange-400 border-b pb-2">TOP(수용층) 평가 데이터</h3>

                            <label className={labelClass}>Batch ID</label>
                            <input type="text" value={formData.topLayer.batchId} onChange={(e) => handleTopChange('batchId', e.target.value)} className={inputClass} placeholder="입력" />

                            <label className={labelClass}>인쇄 ICC 조건</label>
                            <input type="text" value={formData.topLayer.iccCondition} onChange={(e) => handleTopChange('iccCondition', e.target.value)} className={inputClass} placeholder="ICC 프로파일 등" />

                            <label className={labelClass}>쉐이커 조건</label>
                            <input type="text" value={formData.topLayer.shakerCondition} onChange={(e) => handleTopChange('shakerCondition', e.target.value)} className={inputClass} placeholder="쉐이커 조건 입력" />

                            <label className={labelClass}>전사 조건</label>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div>
                                    <input type="number" value={formData.topLayer.transferTemp} onChange={(e) => handleTopChange('transferTemp', e.target.value)} className={`${inputClass} !mb-1 text-center px-1`} placeholder="온도" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">온도(℃)</span>
                                </div>
                                <div>
                                    <input type="number" value={formData.topLayer.transferTime} onChange={(e) => handleTopChange('transferTime', e.target.value)} className={`${inputClass} !mb-1 text-center px-1`} placeholder="시간" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">시간(s)</span>
                                </div>
                                <div>
                                    <input type="number" step="0.1" value={formData.topLayer.transferPressure} onChange={(e) => handleTopChange('transferPressure', e.target.value)} className={`${inputClass} !mb-1 text-center px-1`} placeholder="압력" />
                                    <span className="block text-[10px] sm:text-xs text-center font-bold text-gray-400">압력(bar)</span>
                                </div>
                            </div>

                            {/* Selectors */}
                            <TouchSelect label="색감" value={formData.topLayer.colorTone} onChange={(v) => handleTopChange('colorTone', v)} optionsType="OXTriangle" />
                            <TouchSelect label="인쇄 선명도" value={formData.topLayer.printClarity} onChange={(v) => handleTopChange('printClarity', v)} optionsType="OXTriangle" />
                            <TouchSelect label="내마찰성" value={formData.topLayer.frictionResistance} onChange={(v) => handleTopChange('frictionResistance', v)} optionsType="OXTriangle" />
                            <TouchSelect label="신율/탄성" value={formData.topLayer.elasticity} onChange={(v) => handleTopChange('elasticity', v)} optionsType="OXTriangle" />
                            <TouchSelect label="얼룩 유무" value={formData.topLayer.stain} onChange={(v) => handleTopChange('stain', v)} optionsType="Boolean" />
                            <TouchSelect label="이바리" value={formData.topLayer.burr} onChange={(v) => handleTopChange('burr', v)} optionsType="Boolean" />

                            {/* Decimals & Grades */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelClass}>흡수성 (0~1.0)</label>
                                    <input type="number" step="0.1" min="0" max="1" value={formData.topLayer.absorbency} onChange={(e) => handleTopChange('absorbency', e.target.value)} className={inputClass} placeholder="0 ~ 1.0" />
                                </div>
                                <div>
                                    <label className={labelClass}>세탁 견뢰도 (1~5급)</label>
                                    <input type="number" min="1" max="5" value={formData.topLayer.washFastness} onChange={(e) => handleTopChange('washFastness', e.target.value)} className={inputClass} placeholder="1 ~ 5급" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelClass}>HOTPEEL (0~1.0)</label>
                                    <input type="number" step="0.1" min="0" max="1" value={formData.topLayer.hotPeel} onChange={(e) => handleTopChange('hotPeel', e.target.value)} className={inputClass} placeholder="0 ~ 1.0" />
                                </div>
                                <div>
                                    <label className={labelClass}>COLDPEEL (0~1.0)</label>
                                    <input type="number" step="0.1" min="0" max="1" value={formData.topLayer.coldPeel} onChange={(e) => handleTopChange('coldPeel', e.target.value)} className={inputClass} placeholder="0 ~ 1.0" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom UI for Memo, Photos, and Save */}
            <div className="fixed bottom-0 left-0 right-0 z-20 w-full max-w-md mx-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 max-h-[40vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <label className={`${labelClass} !mb-0`}>비고 / 특이사항</label>
                    <button
                        type="button"
                        onClick={toggleVoiceMemo}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm ${isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <Mic size={14} className={isListening ? 'animate-bounce' : ''} />
                        <span>{isListening ? '듣는 중...' : '음성 녹음'}</span>
                    </button>
                </div>
                <textarea
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    placeholder="현장 특이사항을 이곳에 넓게 자유롭게 적어주세요!"
                    className={`${inputClass} !p-3 !mb-3 min-h-[80px] resize-y bg-gray-50 dark:bg-gray-800 focus:bg-white`}
                />

                <div className="mb-4">
                    <PhotoUploader
                        photos={formData.photos}
                        onChange={(photos) => setFormData({ ...formData, photos })}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-2xl text-xl font-bold shadow-xl transition-transform active:scale-95 disabled:opacity-50"
                >
                    <Save size={24} />
                    <span>모든 테스트 결과 저장하기</span>
                </button>
            </div>
        </div>
    );
}
