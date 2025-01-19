import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { X, Video, VideoOff, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { Groq } from 'groq-sdk';

// API key
const GROQ_API_KEY = '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';

const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

// Lista actualizada de videos de YouTube
const YOUTUBE_VIDEOS = [
    { 
        id: 'y_4k2Kzf1gg', 
        title: 'YouTube video player'
    },
    { 
        id: 'dQw4w9WgXcQ', 
        title: 'Rick Astley - Never Gonna Give You Up'
    },
    { 
        id: 'kJQP7kiw5Fk', 
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee'
    },
];

interface VideoCallComponentProps {
    onClose: () => void;
}

export default function EnhancedVideoCallComponent({ onClose }: VideoCallComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [facePosition, setFacePosition] = useState<'center' | 'left' | 'right'>('center');
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const youtubeContainerRef = useRef<HTMLDivElement>(null);
    const lastPositionRef = useRef<'center' | 'left' | 'right'>('center');

    const ANALYSIS_COOLDOWN = 3000; // 3 segundos de cooldown entre análisis

    useEffect(() => {
        enableStream();
        return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        };
    }, []);

    useEffect(() => {
        let detectionInterval: NodeJS.Timeout;
        if (stream && videoRef.current) {
        detectionInterval = setInterval(detectFacePosition, 100);
        }
        return () => clearInterval(detectionInterval);
    }, [stream]);

    useEffect(() => {
        const resizeYoutubeContainer = () => {
        if (youtubeContainerRef.current) {
            const containerWidth = youtubeContainerRef.current.offsetWidth;
            const containerHeight = youtubeContainerRef.current.offsetHeight;
            const aspectRatio = 16 / 9;
            let width = containerWidth;
            let height = containerWidth / aspectRatio;

            if (height > containerHeight) {
            height = containerHeight;
            width = containerHeight * aspectRatio;
            }

            youtubeContainerRef.current.style.width = `${width}px`;
            youtubeContainerRef.current.style.height = `${height}px`;
        }
        };

        resizeYoutubeContainer();
        window.addEventListener('resize', resizeYoutubeContainer);

        return () => {
        window.removeEventListener('resize', resizeYoutubeContainer);
        };
    }, []);

    async function enableStream() {
        try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(newStream);
        if (videoRef.current) {
            videoRef.current.srcObject = newStream;
        }
        } catch (err) {
        console.error('Error accessing the camera', err);
        }
    }

    function detectFacePosition() {
        if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let leftSum = 0;
            let rightSum = 0;

            for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if ((i / 4) % canvas.width < canvas.width / 2) {
                leftSum += brightness;
            } else {
                rightSum += brightness;
            }
            }

            const newPosition = leftSum > rightSum * 1.10 ? 'left' : 
                                rightSum > leftSum * 1.10 ? 'right' : 
                                'center';

            if (newPosition !== lastPositionRef.current) {
            setFacePosition(newPosition);
            if (newPosition !== 'center' && Date.now() - lastAnalysisTime > ANALYSIS_COOLDOWN) {
                captureAndAnalyzeImage();
            }
            lastPositionRef.current = newPosition;
            }
        }
        }
    }

    async function captureAndAnalyzeImage() {
        if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
            
            try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                {
                    role: "user",
                    content: [
                    {
                        type: "text",
                        text: "Da una sugerencia de moda y estilo para la persona que estas viendo en la imagen basado en lbel,esika, y cyzone y algunos de sus productos de sus catalogos, polvos,labiales etc.Tienes que responder de manera muy amable y formal para que los usuarios se sientan comodos en tus recomendaciones.Tienes que contestar como si estuvieras hablando con una persona, es decir solo las recomendaciones, ignora introducciones o saludos ve al grano.Todoas las recomendaciones deben ser de productos de lbel,esika y cyzone"
                    },
                    {
                        type: "image_url",
                        image_url: {
                        url: imageDataUrl
                        }
                    }
                    ]
                }
                ],
                model: "llama-3.2-11b-vision-preview",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
            });

            if (chatCompletion.choices && chatCompletion.choices.length > 0) {
                const description = chatCompletion.choices[0].message?.content || '';
                setAnalysis(description);
                if (!isSpeaking) {
                speakAnalysis(description);
                }
            }
            } catch (error) {
            console.error('Error analyzing image:', error);
            }
            setLastAnalysisTime(Date.now());
        }
        }
    }

    const toggleVideo = () => {
        if (stream) {
        stream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setIsVideoOff(!isVideoOff);
        }
    };

    const speakAnalysis = (text: string) => {
        if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        } else if (analysis) {
        speakAnalysis(analysis);
        }
    };

    const nextVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % YOUTUBE_VIDEOS.length);
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="relative w-full h-full flex">
            <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            />
            
            {/* Face position guide */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 ${
            facePosition === 'center' ? 'border-white' :
            facePosition === 'left' ? 'border-green-500' :
            'border-red-500'
            }`}>
            <div className="absolute top-0 left-1/2 w-px h-full bg-current transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-current transform -translate-y-1/2"></div>
            </div>

            {/* YouTube video container */}
            <div ref={youtubeContainerRef} className="absolute left-4 bottom-24 z-20 w-[32%] h-[35%] bg-white bg-opacity-80 rounded-lg overflow-hidden flex items-center justify-center">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEOS[currentVideoIndex].id}?autoplay=0&controls=1&rel=0`}
                title={YOUTUBE_VIDEOS[currentVideoIndex].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
            />
            <Button
                variant="outline"
                size="small"
                onClick={nextVideo}
                className="absolute top-2 right-2 bg-white bg-opacity-50 hover:bg-opacity-100"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            </div>

            {/* Analysis display */}
            <div className="absolute right-4 bottom-24 z-20 w-64 h-48 bg-white bg-opacity-80 rounded-lg p-4 overflow-y-auto">
            <div className="text-black">
                <h3 className="font-bold mb-2">Análisis en tiempo real:</h3>
                <p>{analysis || 'Esperando análisis...'}</p>
            </div>
            </div>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4 z-20">
            <div className="flex justify-center items-center space-x-4">
                <Button
                variant="outline"
                size="small"
                onClick={toggleVideo}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 backdrop-blur-sm rounded-full text-black w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                >
                {isVideoOff ? (
                    <VideoOff className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                ) : (
                    <Video className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                )}
                </Button>
                <Button
                variant="outline"
                size="small"
                onClick={toggleSpeech}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 backdrop-blur-sm rounded-full text-black w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                >
                {isSpeaking ? (
                    <VolumeX className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                ) : (
                    <Volume2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                )}
                </Button>
            </div>
            </div>

            {/* Close button */}
            <Button
            variant="primary"
            size="small"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
            >
            <X className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
            </Button>

            <canvas ref={canvasRef} className="hidden" width="640" height="480" />
        </div>
        </div>
    );
}