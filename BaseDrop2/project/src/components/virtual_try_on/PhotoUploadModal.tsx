import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

// Definimos la interfaz para las props
interface PhotoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void; // Aquí especificamos que 'file' es de tipo 'File'
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Aquí se define que puede ser 'File' o 'null'
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Puede ser 'string' o 'null'

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Usamos '?.' para asegurar que 'files' no sea 'undefined'
        if (file) handleFile(file);
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string); // Aseguramos que 'reader.result' sea de tipo 'string'
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
                
                <div className="relative bg-white rounded-lg w-full max-w-md p-6">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Photo</h3>

                    <div 
                        className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="space-y-1 text-center">
                            {previewUrl ? (
                                <div className="mb-4">
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="mx-auto h-64 w-64 object-cover rounded"
                                    />
                                </div>
                            ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                    <span>Upload a file</span>
                                    <input 
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                                selectedFile
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoUploadModal;
