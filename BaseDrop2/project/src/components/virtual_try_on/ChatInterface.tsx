import { useState, useRef, useEffect } from 'react';
import { Input } from '../common/input';
import { Button } from '../common/Button';
import { ScrollArea } from '../common/scroll-area';
import { Send, Camera, Bot, Minimize2, Maximize2, MinusSquare, MessageCircle, Paperclip } from 'lucide-react';
import PhotoUploadModal from './PhotoUploadModal';
import VideoCallComponent from './VideoCallComponent';

interface Message {
    id: number;
    text?: string;
    image?: string;
    sender: 'user' | 'bot';
}

interface ChatInterfaceProps {
    onVideoCall: () => void;
}

export default function ChatInterface({ onVideoCall }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [windowState, setWindowState] = useState<'normal' | 'maximized' | 'minimized'>('minimized');
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
    const [isVideoCallActive, setIsVideoCallActive] = useState<boolean>(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            const newMessage: Message = {
                id: Date.now(),
                text: input.trim(),
                sender: 'user',
            };
            setMessages([...messages, newMessage]);
            setInput('');

            // Simulate bot response
            setTimeout(() => {
                const botResponse: Message = {
                    id: Date.now(),
                    text: 'This is a simulated response from the chatbot.',
                    sender: 'bot',
                };
                setMessages((prevMessages) => [...prevMessages, botResponse]);
            }, 1000);
        }
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                const newMessage: Message = {
                    id: Date.now(),
                    image: reader.result.toString(),
                    sender: 'user',
                };
                setMessages([...messages, newMessage]);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleOpenPhotoModal = () => {
        setIsPhotoModalOpen(true);
    };

    const handleClosePhotoModal = () => {
        setIsPhotoModalOpen(false);
    };

    const toggleMaximize = () => {
        setWindowState(windowState === 'maximized' ? 'normal' : 'maximized');
    };

    const toggleMinimize = () => {
        setWindowState(windowState === 'minimized' ? 'normal' : 'minimized');
    };

    const handleVideoCall = () => {
        setIsVideoCallActive(true);
        setWindowState('maximized'); // Maximizar el chat cuando se presiona el botón de cámara
    };

    const handleVideoCallClose = () => {
        setIsVideoCallActive(false);
        setWindowState('normal'); // Volver al estado normal del chat cuando se cierra el video
    };

    if (windowState === 'minimized') {
        return (
            <Button
                onClick={toggleMinimize}
                className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform-gpu transition-all duration-200 ease-in-out flex items-center justify-center"
                title="Open Chat"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    const containerClasses = `
        fixed 
        ${windowState === 'maximized' ? 'inset-0' : 'bottom-4 right-4 w-96 h-[600px]'}
        bg-gradient-to-br from-blue-50 to-indigo-100 
        shadow-lg rounded-lg 
        flex flex-col 
        transform-gpu 
        transition-all duration-200 ease-in-out
    `;

    return (
        <div className={containerClasses}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <Bot className="h-6 w-6" />
                    <h2 className="text-xl font-bold">AI Assistant</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="small"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-colors duration-200"
                        onClick={handleVideoCall}
                    >
                        <Camera className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="small"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-colors duration-200"
                        onClick={toggleMaximize}
                        title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
                    >
                        <Maximize2 className={`h-5 w-5 ${windowState === 'maximized' ? 'rotate-180' : ''} transition-transform duration-200`} />
                    </Button>
                    <Button
                        variant="outline"
                        size="small"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-colors duration-200"
                        onClick={toggleMinimize}
                        title="Minimize"
                    >
                        <MinusSquare className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto relative">
                {isVideoCallActive ? (
                    <div className="absolute inset-0 flex">
                        <VideoCallComponent onClose={handleVideoCallClose} className="w-1/2 border-r border-gray-300" />
                        <ScrollArea className="w-1/2">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    <div
                                        className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                            message.sender === 'user'
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-white text-gray-800 shadow-md'
                                        }`}
                                    >
                                        {message.text ? message.text : null}
                                        {message.image ? (
                                            <img
                                                src={message.image}
                                                alt="Uploaded"
                                                className="rounded-md mt-2"
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </ScrollArea>
                    </div>
                ) : (
                    <ScrollArea>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                        message.sender === 'user'
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-white text-gray-800 shadow-md'
                                    }`}
                                >
                                    {message.text ? message.text : null}
                                    {message.image ? (
                                        <img
                                            src={message.image}
                                            alt="Uploaded"
                                            className="rounded-md mt-2"
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </ScrollArea>
                )}
            </div>
            <div className="p-4 bg-white border-t border-indigo-100 rounded-b-lg">
                <div className="flex space-x-2 items-center">
                    <label htmlFor="image-upload" className="cursor-pointer" onClick={handleOpenPhotoModal}>
                        <Paperclip className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                    </label>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-grow border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Button onClick={handleSend} className="bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <PhotoUploadModal
                isOpen={isPhotoModalOpen}
                onClose={handleClosePhotoModal}
                onUpload={handleImageUpload}
            />
        </div>
    );
}
