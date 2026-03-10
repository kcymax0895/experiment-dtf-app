import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function PhotoUploader({ photos, onChange }) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                onChange([...photos, event.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        onChange(newPhotos);
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                사진 기록
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                        <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={() => cameraInputRef.current.click()}
                    className="flex-1 flex items-center justify-center space-x-2 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 py-3 rounded-xl transition-colors font-bold"
                >
                    <Camera size={24} />
                    <span>카메라 촬영</span>
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl transition-colors font-bold border border-gray-200 dark:border-gray-700"
                >
                    <ImageIcon size={24} />
                    <span>갤러리</span>
                </button>
            </div>

            {/* Hidden inputs */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={cameraInputRef}
                onChange={handleFileChange}
            />
            <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </div>
    );
}
