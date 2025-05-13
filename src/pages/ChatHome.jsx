import UpdatedNavbar from "../components/UpdatedNavbar";
import { useRef, useState, useEffect } from "react";
import { Send, SendHorizonal, ThumbsUp, ThumbsDown, Copy, TrendingUp, LineChart, Vote, Calendar } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SERVER_URL } from '../providers/server';

// Add the markdown components configuration
const componentsMD = {
    h1: ({ node, ...props }) => (
        <h1 className="text-2xl font-bold m-0 mb-3 mt-3" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-xl font-semibold m-0 mb-2 mt-2" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-lg font-semibold m-0 mb-2 mt-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
        <h4 className="text-base font-medium m-0 mb-1 mt-1" {...props} />
    ),
    p: ({ node, ...props }) => (
        <p className="text-sm leading-relaxed m-0 mb-2" {...props} />
    ),
    ul: ({ node, ...props }) => (
        <ul className="list-disc list-outside pl-4 text-sm leading-relaxed m-0 my-2 py-0" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal list-outside pl-4 text-sm leading-relaxed m-0 my-2 py-0" {...props} />
    ),
    li: ({ node, ...props }) => (
        <li className="leading-relaxed m-0 mb-1" {...props} />
    ),
    strong: ({ node, ...props }) => (
        <strong className="font-bold" {...props} />
    ),
    em: ({ node, ...props }) => (
        <em className="italic" {...props} />
    ),
    a: ({ node, ...props }) => (
        <a className="text-blue-400 hover:underline hover:text-blue-300" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-gray-600 pl-3 py-1 italic text-gray-300 leading-none m-0 my-2" {...props} />
    ),
    code: ({ node, inline, ...props }) => {
        if (inline) {
            return (
                <code className="bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono text-green-400" {...props} />
            );
        }
        return (
            <pre className="bg-gray-800 rounded p-3 text-sm overflow-x-auto leading-none m-0 my-2" {...props}>
                <code className="text-green-400">{props.children}</code>
            </pre>
        );
    },
    table: ({ node, ...props }) => (
        <div className="overflow-x-auto max-h-[60dvh] overflow-y-auto my-2">
            <table className="w-full border-collapse border border-white/20 my-0 py-0" {...props} />
        </div>
    ),
    thead: ({ node, ...props }) => (
        <thead className="bg-[#1a1a1a]" {...props} />
    ),
    tbody: ({ node, ...props }) => (
        <tbody className="divide-y divide-white/10" {...props} />
    ),
    tr: ({ node, ...props }) => (
        <tr className="border-b border-white/5 hover:bg-white/5" {...props} />
    ),
    th: ({ node, ...props }) => (
        <th className="py-2 px-3 text-white/70 text-xs font-medium text-left" {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className="py-2 px-3 text-white text-xs" {...props} />
    ),
};

function ChatHome({ messages, updateMessages, initialMessage, onSendMessage, setSelectedEnvironment }) {
    const textareaRef = useRef(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    
    // Generate unique user ID using timestamp
    const [userId] = useState(() => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `u_${timestamp}_${random}`;
    });

    // Generate unique session ID using timestamp
    const [sessionId] = useState(() => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `s_${timestamp}_${random}`;
    });

    useEffect(() => {
        const initializeSession = async () => {
            try {
                await fetch(`${SERVER_URL}/apps/test_agent/users/${userId}/sessions/${sessionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Error initializing session:', error);
            }
        };

        initializeSession();
    }, [sessionId, userId]); // Add userId as dependency

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);

        try {
            // Create initial message with empty response
            const newMessage = {
                user: input.trim(),
                response: "",
                time: new Date(),
                loading: true
            };
            
            updateMessages(prev => [...prev, newMessage]);
            setInput("");

            // Try to initialize session, but don't treat "already exists" as an error
            try {
                const sessionResponse = await fetch(`${SERVER_URL}/apps/test_agent/users/${userId}/sessions/${sessionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        state: {}
                    })
                });
                
                if (!sessionResponse.ok) {
                    const errorData = await sessionResponse.json();
                    if (!(sessionResponse.status === 400 && errorData.detail === `Session already exists: ${sessionId}`)) {
                        throw new Error('Failed to initialize session');
                    }
                }
            } catch (sessionError) {
                console.error('Session error:', sessionError);
            }

            // Use EventSource for SSE
            const response = await fetch(`${SERVER_URL}/run_sse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    app_name: "test_agent",
                    user_id: userId,  // Use the unique userId
                    session_id: sessionId,
                    new_message: {
                        role: "user",
                        parts: [{
                            text: input.trim()
                        }]
                    },
                    streaming: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const eventData = JSON.parse(line.slice(6));
                            
                            if (eventData.content?.parts) {
                                // Skip if it's not a partial message and doesn't contain function calls
                                const hasFunctionCall = eventData.content.parts.some(part => part.functionCall || part.functionResponse);
                                if (!eventData.partial && !hasFunctionCall) {
                                    continue;
                                }

                                const parts = eventData.content.parts.map(part => {
                                    if (part.text) {
                                        console.log(part.text);
                                        return part.text;
                                    } else if (part.functionCall) {
                                        return `<div class="bg-[#1a1a1a] border border-white/20 rounded-lg p-4 my-4 mx-0">
                                            <div class="text-xs text-white/70 mb-1">Function Call</div>
                                            <div class="text-sm text-white/90 font-semibold">${part.functionCall.name}</div>
                                        </div>`;
                                    } else if (part.functionResponse) {
                                        return ''; // Return empty string for function responses
                                    }
                                    return '';
                                }).filter(Boolean).join('\n');

                                if (parts) {
                                    accumulatedResponse += parts;
                                    updateMessages(prev => {
                                        const newMessages = [...prev];
                                        const lastMessage = { ...newMessages[newMessages.length - 1] };
                                        lastMessage.response = accumulatedResponse;
                                        newMessages[newMessages.length - 1] = lastMessage;
                                        return newMessages;
                                    });
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }

            // After the streaming loop is done, set loading = false for the last message
            updateMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = { ...newMessages[newMessages.length - 1] };
                lastMessage.loading = false;
                newMessages[newMessages.length - 1] = lastMessage;
                return newMessages;
            });
            setIsLoading(false);
            // Add a small delay before focusing
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 100);

        } catch (error) {
            console.error('Error in chat:', error);
            setError('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };

    // Add new function to simulate typing
    const simulateTyping = async (text) => {
        if (isLoading) return;
        
        // Clear any existing input
        setInput("");
        
        // Simulate typing with a smaller delay between characters
        for (let i = 0; i < text.length; i++) {
            setInput(prev => prev + text[i]);
            await new Promise(resolve => setTimeout(resolve, 10)); // Reduced from 30ms to 10ms
        }
        
        // Wait a moment after typing is complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Send the message
        handleSend();
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-[#000000] flex flex-col h-full">
            {messages.length === 0 ? (
                // Initial centered layout - exactly like NewChat
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="w-[95%] sm:w-[85%] md:w-[75%] min-w-[280px] max-w-[800px] mx-auto pt-2 sm:pt-4 px-2 sm:px-3">
                        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-1 text-center">
                            <span className="bg-gradient-to-r from-white via-gray-400 to-green-400 bg-clip-text text-transparent">
                                Research your trading ideas
                            </span>
                        </div>
                        <div className="text-base sm:text-lg text-white/70 mb-2 sm:mb-3 text-center">
                            Bullrun is your AI agent for investment research and trading
                        </div>
                        {error && (
                            <div className="text-red-500 mb-4 text-center">
                                {error}
                            </div>
                        )}
                        <div className="min-h-[80px] max-h-[200px] w-full border border-white/30 rounded-lg shadow-lg p-1 sm:p-2 bg-[#1a1a1a] backdrop-blur-sm flex gap-1">
                            <textarea
                                ref={textareaRef}
                                className={`flex-1 resize-none bg-transparent text-white outline-none text-base ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                style={{
                                    lineHeight: '1.5rem',
                                    maxHeight: '150px',
                                    overflow: 'auto'
                                }}
                                placeholder="Type your message to start a new chat..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <button
                                className={`px-3 h-fit my-auto py-2 bg-[#2e3d5c] text-white rounded-lg transition-colors flex items-center justify-center ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={handleSend}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <SendHorizonal className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 mt-2 sm:mt-3">
                            {/* Card 1 - Price and Market Data */}
                            <div 
                                onClick={() => simulateTyping("Compare AAPL, TSLA and NVDA Stock Price over the 2023-2024 period.")}
                                className="bg-transparent border border-white/20 rounded-lg p-2 sm:p-3 w-full text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow flex flex-col gap-1 cursor-pointer hover:bg-white/5"
                            >
                                <div className="font-semibold text-xs mb-1 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Price & Market Data
                                </div>
                                <div className="text-xs text-white/70">Compare AAPL, TSLA and NVDA Stock Price over the 2023-2024 period.</div>
                            </div>

                            {/* Card 2 - Company Information */}
                            <div 
                                onClick={() => simulateTyping("Is latest news about TSLA bullish or bearish?")}
                                className="bg-transparent border border-white/20 rounded-lg p-2 sm:p-3 w-full text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow flex flex-col gap-1 cursor-pointer hover:bg-white/5"
                            >
                                <div className="font-semibold text-xs mb-1 flex items-center gap-2">
                                    <LineChart className="w-4 h-4" />
                                    Company News
                                </div>
                                <div className="text-xs text-white/70">Is latest news about TSLA bullish or bearish?</div>
                            </div>

                            {/* Card 3 - Technical Analysis */}
                            <div 
                                onClick={() => simulateTyping("Compare technical indicators for AAPL, TSLA and NVDA.")}
                                className="bg-transparent border border-white/20 rounded-lg p-2 sm:p-3 w-full text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow flex flex-col gap-1 cursor-pointer hover:bg-white/5"
                            >
                                <div className="font-semibold text-xs mb-1 flex items-center gap-2">
                                    <Vote className="w-4 h-4" />
                                    Technical Analysis
                                </div>
                                <div className="text-xs text-white/70">Compare technical indicators for AAPL, TSLA and NVDA.</div>
                            </div>
                        </div>
                        
                        {/* New navigation links */}
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-sm text-white/60">
                            <button 
                                onClick={() => setSelectedEnvironment("Agents")} 
                                className="hover:text-white/90 transition-colors text-center"
                            >
                                Agents
                            </button>
                            <button 
                                onClick={() => setSelectedEnvironment("Pricing")} 
                                className="hover:text-white/90 transition-colors text-center"
                            >
                                Pricing
                            </button>
                            <button 
                                onClick={() => setSelectedEnvironment("Terms")} 
                                className="hover:text-white/90 transition-colors text-center"
                            >
                                Terms & Conditions
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Chat layout with messages
                <div className="flex-1 w-full flex flex-col overflow-hidden">
                    <div className="w-full mx-auto flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto">
                            <div className="w-[95%] sm:w-[85%] md:w-[75%] min-w-[280px] max-w-[800px] mx-auto pt-2 sm:pt-4 px-2 sm:px-3">
                                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-1 text-center">
                                    <span className="bg-gradient-to-r from-white via-gray-400 to-green-400 bg-clip-text text-transparent">
                                        Research your trading ideas
                                    </span>
                                </div>
                                <div className="text-base sm:text-lg text-white/70 mb-2 sm:mb-3 text-center">
                                    Bullrun is your AI agent for investment research and trading
                                </div>
                                {error && (
                                    <div className="text-red-500 mb-4 text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="mt-6 sm:mt-8 space-y-2 mb-8">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={idx === messages.length - 1 ? "mb-16" : ""}
                                        >
                                            <h2 className="text-3xl font-bold text-white mb-2 m-0">{msg.user}</h2>
                                            <div className="text-lg text-white min-h-[24px]">
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                                    remarkPlugins={[remarkGfm]}
                                                    components={componentsMD}
                                                >
                                                    {msg.response}
                                                </ReactMarkdown>
                                                {msg.loading && (
                                                    <div className="flex items-center py-1">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-500" />
                                                        <span className="ml-2 text-xs text-white/50">Thinking…</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-4 items-center">
                                                <button className="p-0.5" title="Copy to clipboard" onClick={() => handleCopy(msg.response)}>
                                                    <Copy className="w-3 h-3 text-white/60" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div ref={bottomRef} />
                            </div>
                        </div>

                        {/* Textarea section at bottom */}
                        <div className="w-[75%] min-w-[500px] max-w-[800px] mx-auto px-5 pb-10">
                            <div className="min-h-[80px] max-h-[200px] w-full border border-white/30 rounded-lg shadow-lg p-3 bg-[#1a1a1a] backdrop-blur-sm flex gap-2">
                                <textarea
                                    ref={textareaRef}
                                    className={`flex-1 resize-none bg-transparent text-white outline-none text-base ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    style={{
                                        lineHeight: '1.5rem',
                                        maxHeight: '150px',
                                        overflow: 'auto'
                                    }}
                                    placeholder="Type your message to start a new chat..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                <button
                                    className={`px-3 h-fit my-auto py-2 bg-[#2e3d5c] text-white rounded-lg transition-colors flex items-center justify-center ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    onClick={handleSend}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    ) : (
                                        <SendHorizonal className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatHome;