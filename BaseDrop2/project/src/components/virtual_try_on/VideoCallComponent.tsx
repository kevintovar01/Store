import { useEffect, useRef, useState } from 'react';
import { Button } from '../common/Button';
import { X, Gift, Video, VideoOff, MessageSquare, Settings } from 'lucide-react';

interface VideoCallComponentProps {
    onClose: () => void;
}

export default function VideoCallComponent({
    onClose,
}: VideoCallComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const cleanupMediaStream = () => {
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStream(null);
        }
    };

    const enableStream = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing the camera', err);
        }
    };

    useEffect(() => {
        const options = {
            root: null,
            threshold: 0.1,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            const isVisible = entry.isIntersecting;
            setIsVideoVisible(isVisible);

            if (isVisible) {
                if (!stream) {
                    enableStream();
                } else {
                    stream.getVideoTracks().forEach(track => {
                        track.enabled = true;
                    });
                }
            } else {
                if (stream) {
                    stream.getVideoTracks().forEach(track => {
                        track.enabled = false;
                    });
                }
            }
        };

        observerRef.current = new IntersectionObserver(handleIntersection, options);

        if (videoRef.current) {
            observerRef.current.observe(videoRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            cleanupMediaStream();
        };
    }, [stream]);

    const toggleVideo = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                const track = videoTracks[0];
                track.enabled = !track.enabled;
                setIsVideoOff(!isVideoOff);
            }
        }
    };

    const handleClose = () => {
        cleanupMediaStream();
        onClose();
    };

    const VideoStatusIndicator = () => (
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${
            isVideoVisible ? 'bg-green-500' : 'bg-red-500'
        } text-white text-sm z-30`}>
            {isVideoVisible ? 'Camera Active' : 'Camera Disabled'}
        </div>
    );

    return (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full overflow-y-auto bg-black z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex">
                <div className="flex-grow">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>

                <VideoStatusIndicator />

                <div className="absolute left-4 bottom-24 z-10">
                    <div className="bg-white bg-opacity-80 w-32 h-32 rounded-lg flex items-center justify-center text-sm font-semibold shadow-lg">
                        Featured Product
                    </div>
                </div>

                <div className="absolute right-4 bottom-24 z-10">
                    <div className="bg-white bg-opacity-80 w-32 h-32 rounded-lg flex items-center justify-center text-sm font-semibold shadow-lg">
                        Product / Banner
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="small"
                    className="absolute right-4 top-[45%] -translate-y-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 z-20"
                    onClick={() => alert('Gift feature clicked!')}
                >
                    <Gift className="h-8 w-8" />
                </Button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4 z-20">
                    <div className="flex justify-center items-center space-x-4">
                        <Button
                            variant="outline"
                            size="small"
                            onClick={toggleVideo}
                            className="bg-white bg-opacity-80 rounded-full text-black w-12 h-12"
                        >
                            {isVideoOff ? (
                                <VideoOff className="h-6 w-6" />
                            ) : (
                                <Video className="h-6 w-6" />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleClose}
                            className="bg-white bg-opacity-80 rounded-full text-black w-12 h-12"
                        >
                            <MessageSquare className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="small"
                            className="bg-white bg-opacity-80 rounded-full text-black w-12 h-12"
                        >
                            <Settings className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <Button
                    variant="primary"
                    size="small"
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-12 h-12"
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
