import React, { useState } from 'react';
import ChatInterface from '../components/virtual_try_on/ChatInterface';
import VideoCallComponent from '../components/virtual_try_on/VideoCallComponent';
import PhotoUploadModal from '../components/virtual_try_on/PhotoUploadModal';

const VirtualTryOn: React.FC = () => {
    const [showChat, setShowChat] = useState<boolean>(false);
    const [showVideo, setShowVideo] = useState<boolean>(false);
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null); // Asegúrate de que el tipo sea string o null

    const handleUseCamera = () => {
        setShowVideo(true);
        setShowChat(true);
    };

    const handleCloseVideo = () => {
        setShowVideo(false);
    };

    const handleVideoCall = () => {
        setShowVideo(true);
    };

    const handlePhotoUpload = (file: File) => { // Especificamos que 'file' es de tipo 'File'
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string); // Aseguramos que 'reader.result' sea de tipo 'string'
        };
        reader.readAsDataURL(file);
        setShowChat(true);
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Virtual Try-On</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <p className="text-lg text-gray-700 mb-4">
                    Experience our AI-powered virtual try-on feature. Upload a photo or use your camera to see how our products look on you!
                </p>
                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="mr-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Upload Photo
                    </button>
                    <button 
                        onClick={handleUseCamera}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Use Camera
                    </button>
                </div>

                {/* Preview Area */}
                {!showVideo && (
                    <div className="mt-8 flex justify-center">
                        <div className="w-full max-w-md aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                            {uploadedImage ? (
                                <img 
                                    src={uploadedImage} 
                                    alt="Uploaded preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <p className="flex items-center justify-center text-gray-500">Preview will appear here</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat Interface */}
                {showChat && (
                    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-40">
                        <ChatInterface onVideoCall={handleVideoCall} />
                    </div>
                )}

                {/* Video Call Component */}
                {showVideo && (
                    <VideoCallComponent onClose={handleCloseVideo} />
                )}

                {/* Upload Modal */}
                <PhotoUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handlePhotoUpload} // Pasamos la función al modal
                />
            </div>
        </div>
    );
};

export default VirtualTryOn;
