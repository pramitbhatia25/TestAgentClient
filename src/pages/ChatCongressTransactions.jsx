import { useRef, useState, useEffect } from "react";
import { SendHorizonal, Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Autocomplete, AutocompleteItem, DateRangePicker } from '@heroui/react';
import { transactionsData } from '../rawData/transactionsData';
import { SERVER_URL } from '../providers/server';

// Markdown components config (reuse from ChatFundamentals)
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
            <pre className="bg-gray-800 rounded p-3 text-sm overflow-x-auto whitespace-pre m-0 my-2" {...props}>
                <code className="text-green-400 whitespace-pre">{props.children}</code>
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


// Add this above the ChatCongressTransactions function:
const uniqueSymbols = Array.from(new Set(transactionsData.map(t => t.ticker)));
const uniqueRepresentatives = Array.from(new Set(transactionsData.map(t => t.representative)));

// Helper to get stock name from STOCKS or fallback to symbol
const getStockName = (symbol) => {
    const stock = STOCKS.find(s => s.symbol === symbol);
    return stock ? stock.name : symbol;
};

// Add handleCopy function
const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
};

function ChatCongressTransactions() {
    const textareaRef = useRef(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const isInitialMount = useRef(true);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedRepresentative, setSelectedRepresentative] = useState("");
    const [sessionId] = useState(`s_congress_${Date.now()}`);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 150);
            textarea.style.height = `${newHeight}px`;
        }
    };

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
            
            setMessages(prev => [...prev, newMessage]);
            setInput("");
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }

            // Try to initialize session
            try {
                const sessionResponse = await fetch(`${SERVER_URL}/apps/test_agent/users/u_123/sessions/${sessionId}`, {
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
                    user_id: "u_123",
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
                                        return '';
                                    }
                                    return '';
                                }).filter(Boolean).join('\n');

                                if (parts) {
                                    accumulatedResponse += parts;
                                    setMessages(prev => {
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
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = { ...newMessages[newMessages.length - 1] };
                lastMessage.loading = false;
                newMessages[newMessages.length - 1] = lastMessage;
                return newMessages;
            });
            setIsLoading(false);

        } catch (error) {
            console.error('Error in chat:', error);
            setError('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };

    // Filter transactions by selected filters
    const filteredTransactions = transactionsData.filter(row => {
        // Stock filter
        const stockMatch = selectedSymbol ? row.ticker === selectedSymbol : true;
        // Year filter
        const yearMatch = selectedYear ? row.disclosureYear.toString() === selectedYear : true;
        // Representative filter
        const representativeMatch = selectedRepresentative ? row.representative === selectedRepresentative : true;
        return stockMatch && yearMatch && representativeMatch;
    });

    // Update the handleSelectionChange function
    const handleSelectionChange = (key) => {
        setSelectedSymbol(key === "all" ? "" : key);
    };

    // Add this function to handle clearing the date range
    const handleClearDateRange = () => {
        setDateRange({ start: null, end: null });
    };

    const handleYearChange = (key) => {
        setSelectedYear(key === "all" ? "" : key);
    };

    // Add handler for representative selection
    const handleRepresentativeChange = (key) => {
        setSelectedRepresentative(key === "all" ? "" : key);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="bg-[#000000] flex flex-col h-full">
            <div className="flex-1 w-full flex flex-col overflow-hidden">
                <div className="w-full mx-auto flex flex-col h-full">
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto">
                    <div className="w-[95%] sm:w-[85%] md:w-[75%] min-w-[280px] max-w-[800px] mx-auto pt-2 sm:pt-4 px-3 sm:px-5">
                    <div className="w-full flex flex-col gap-4 mb-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    {/* Stock Picker - 25% width */}
                                    <div className="flex-[0.25]">
                                        <Autocomplete
                                            className="w-full"
                                            selectedKey={selectedSymbol}
                                            onSelectionChange={handleSelectionChange}
                                            placeholder="Select stock..."
                                            size="sm"
                                            classNames={{
                                                base: "w-full",
                                                trigger: "bg-[#1a1a1a] text-white text-sm rounded-lg border border-white/30 focus:border-white/50 focus:outline-none",
                                                value: "text-white",
                                                listbox: "bg-[#1a1a1a] text-white",
                                                popover: "bg-[#1a1a1a]"
                                            }}
                                        >
                                            <AutocompleteItem key="all" value="All Stocks">
                                                All Stocks
                                            </AutocompleteItem>
                                            {uniqueSymbols.map(symbol => (
                                                <AutocompleteItem key={symbol} value={symbol}>
                                                    {symbol}
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    </div>

                                    {/* Representative Picker - 35% width */}
                                    <div className="flex-[0.35]">
                                        <Autocomplete
                                            className="w-full"
                                            selectedKey={selectedRepresentative}
                                            onSelectionChange={handleRepresentativeChange}
                                            placeholder="Select representative..."
                                            size="sm"
                                            classNames={{
                                                base: "w-full",
                                                trigger: "bg-[#1a1a1a] text-white text-sm rounded-lg border border-white/30 focus:border-white/50 focus:outline-none",
                                                value: "text-white",
                                                listbox: "bg-[#1a1a1a] text-white",
                                                popover: "bg-[#1a1a1a]"
                                            }}
                                        >
                                            <AutocompleteItem key="all" value="All Representatives">
                                                All Representatives
                                            </AutocompleteItem>
                                            {uniqueRepresentatives.map(rep => (
                                                <AutocompleteItem key={rep} value={rep}>
                                                    {rep}
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    </div>

                                    {/* Year Picker - 25% width */}
                                    <div className="flex-[0.25]">
                                        <Autocomplete
                                            className="w-full"
                                            selectedKey={selectedYear}
                                            onSelectionChange={handleYearChange}
                                            placeholder="Select year..."
                                            size="sm"
                                            classNames={{
                                                base: "w-full",
                                                trigger: "bg-[#1a1a1a] text-white text-sm rounded-lg border border-white/30 focus:border-white/50 focus:outline-none",
                                                value: "text-white",
                                                listbox: "bg-[#1a1a1a] text-white",
                                                popover: "bg-[#1a1a1a]"
                                            }}
                                        >
                                            <AutocompleteItem key="all" value="All Years">
                                                All Years
                                            </AutocompleteItem>
                                            {Array.from(new Set(transactionsData.map(t => t.disclosureYear))).sort().map(year => (
                                                <AutocompleteItem key={year.toString()} value={year.toString()}>
                                                    {year}
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions Table Section */}
                            <div className="bg-[#1a1a1a] rounded-lg p-2 mb-6">
                                <div className="overflow-x-auto max-h-[60dvh] overflow-y-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Disclosure Year</th>
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Representative</th>
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Disclosure Date</th>
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Ticker</th>
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Asset Description</th>
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Type</th>
                                                <th className="text-right py-1 px-2 text-white/70 text-xs font-medium">Amount</th>
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">District</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((row, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-1 px-2 text-white text-xs">{row.disclosureYear}</td>
                                                    <td className="py-1 px-2 text-white text-xs">{row.representative}</td>
                                                    <td className="py-1 px-2 text-white text-xs">{new Date(row.disclosureDate).toLocaleDateString()}</td>
                                                    <td className="py-1 px-2 text-white text-xs">{row.ticker}</td>
                                                    <td className="py-1 px-2 text-white text-xs">{row.assetDescription}</td>
                                                    <td className="py-1 px-2 text-white text-xs">{row.type}</td>
                                                    <td className="py-1 px-2 text-white text-xs text-right">{row.amount}</td>
                                                    <td className="py-1 px-2 text-white text-xs">{row.district}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Messages Section */}
                            <div className="mt-6 sm:mt-8">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">{msg.user}</h2>
                                        <div className="text-lg text-white min-h-[24px]">
                                            {msg.loading ? (
                                                <div className="flex items-center py-1">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-500" />
                                                    <span className="ml-2 text-xs text-white/50">Thinking…</span>
                                                </div>
                                            ) : (
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                                    remarkPlugins={[remarkGfm]}
                                                    components={componentsMD}
                                                >
                                                    {msg.response}
                                                </ReactMarkdown>
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

                    {/* Fixed input section at bottom */}
                    <div className="w-[95%] sm:w-[85%] md:w-[75%] min-w-[280px] max-w-[800px] mx-auto px-3 sm:px-5 pb-10">
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
                                onInput={adjustTextareaHeight}
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
        </div>
    );
}

export default ChatCongressTransactions;
