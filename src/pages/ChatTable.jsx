import UpdatedNavbar from "../components/UpdatedNavbar";
import { useRef, useState, useEffect } from "react";
import { Send, SendHorizonal, ThumbsUp, ThumbsDown, Copy, TrendingUp, LineChart, Vote, Filter, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

// Add the markdown components configuration
const componentsMD = {
    h1: ({ node, ...props }) => (
        <h1 className="text-2xl font-bold mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-xl font-semibold mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-lg font-semibold mb-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
        <h4 className="text-base font-medium mb-2" {...props} />
    ),
    p: ({ node, ...props }) => (
        <p className="text-sm leading-relaxed mb-2" {...props} />
    ),
    ul: ({ node, ...props }) => (
        <ul className="list-disc list-outside pl-2 text-sm leading-relaxed mb-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal list-outside pl-2 text-sm leading-relaxed mb-2" {...props} />
    ),
    li: ({ node, ...props }) => (
        <li className="leading-relaxed mb-1" {...props} />
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
        <blockquote className="border-l-4 border-gray-600 pl-2 py-0 italic text-gray-300 leading-none m-0" {...props} />
    ),
    code: ({ node, inline, ...props }) => {
        if (inline) {
            return (
                <code className="bg-gray-800 rounded px-1 py-0 text-sm font-mono text-green-400" {...props} />
            );
        }
        
        return (
            <pre className="bg-gray-800 rounded p-2 text-sm overflow-x-auto leading-none m-0" {...props}>
                <code className="text-green-400">{props.children}</code>
            </pre>
        );
    }
};

// Dummy stock data
const STOCKS = [
    {
        symbol: "NVDA",
        name: "Nvidia Corporation",
        price: 120.50,
        change: 2.30,
        changePct: 1.95,
        marketCap: "$2.97T",
        pe: 78.2,
        summary: [
            { label: "Performance", value: "STEADY PERFORMER" },
            { label: "Valuation", value: "OVERVALUED" },
            { label: "Growth", value: "STRONG" },
            { label: "Profitability", value: "HIGH MARGIN" },
            { label: "Technicals", value: "BULLISH" },
            { label: "Risk", value: "MODERATE" }
        ],
        chart: [120, 122, 121, 119, 123, 125, 124, 120, 121, 120, 120.5]
    },
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 195.30,
        change: -1.10,
        changePct: -0.56,
        marketCap: "$3.01T",
        pe: 32.1,
        summary: [
            { label: "Performance", value: "STEADY PERFORMER" },
            { label: "Valuation", value: "FAIR" },
            { label: "Growth", value: "STABLE" },
            { label: "Profitability", value: "HIGH MARGIN" },
            { label: "Technicals", value: "NEUTRAL" },
            { label: "Risk", value: "LOW" }
        ],
        chart: [196, 197, 198, 197, 196, 195, 194, 195, 195.5, 195.2, 195.3]
    }
];

// Mini line chart component
function MiniLineChart({ data }) {
    const width = 120, height = 32, min = Math.min(...data), max = Math.max(...data);
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(" ");
    return (
        <svg width={width} height={height} className="block">
            <polyline
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
                points={points}
            />
            <rect x="0" y="0" width={width} height={height} fill="none" stroke="#f87171" strokeWidth="0.5" />
        </svg>
    );
}

function ChatFundamentals() {
    const textareaRef = useRef(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selected, setSelected] = useState(STOCKS[0]);

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

            // Simulate API call
            setTimeout(() => {
                setMessages(prev => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    lastMessage.response = "This is a simulated response for the home chat.";
                    lastMessage.loading = false;
                    return updated;
                });
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.error('Error in chat:', error);
            setError('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    // Update the tableData to include more metrics
    const tableData = [
        { metric: 'Market Cap', value: '$2.5T', change: '+2.3%', trend: 'up' },
        { metric: 'P/E Ratio', value: '28.5', change: '-0.5%', trend: 'down' },
        { metric: 'Forward P/E', value: '25.2', change: '-0.3%', trend: 'down' },
        { metric: 'PEG Ratio', value: '1.8', change: '-0.1', trend: 'down' },
        { metric: 'EPS', value: '$5.67', change: '+0.23', trend: 'up' },
        { metric: 'Revenue', value: '$394.3B', change: '+8.2%', trend: 'up' },
        { metric: 'Profit Margin', value: '21.4%', change: '+0.8%', trend: 'up' },
        { metric: 'Operating Margin', value: '30.2%', change: '+1.1%', trend: 'up' },
        { metric: 'ROE', value: '147.3%', change: '+5.2%', trend: 'up' },
        { metric: 'ROA', value: '28.6%', change: '+2.1%', trend: 'up' },
        { metric: 'Debt/Equity', value: '1.8', change: '-0.2', trend: 'down' },
        { metric: 'Current Ratio', value: '1.4', change: '+0.1', trend: 'up' },
        { metric: 'Dividend Yield', value: '0.65%', change: '+0.02%', trend: 'up' },
        { metric: 'Beta', value: '1.2', change: '-0.1', trend: 'down' },
        { metric: '52W High', value: '$198.23', change: '+2.3%', trend: 'up' },
        { metric: '52W Low', value: '$124.17', change: '-1.2%', trend: 'down' },
    ];

    return (
        <div className="bg-[#000000] flex flex-col h-full">
            {/* Always show the chat layout with table */}
            <div className="flex-1 w-full flex flex-col overflow-hidden">
                <div className="w-full mx-auto flex flex-col h-full">
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="w-[95%] sm:w-[85%] md:w-[75%] min-w-[280px] max-w-[800px] mx-auto pt-4 sm:pt-8 px-3 sm:px-5">

                            {/* Fundamentals Table Section */}
                            <div className="bg-[#1a1a1a] rounded-lg p-2 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-semibold text-white">Fundamental Metrics</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-1 text-white/70 hover:text-white text-xs"
                                        >
                                            <Filter className="w-3 h-3" />
                                            Filters
                                            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                        <select className="bg-[#2a2a2a] text-white/70 text-xs rounded px-2 py-1">
                                            <option>Last Quarter</option>
                                            <option>Last Year</option>
                                            <option>Last 5 Years</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Filters Section - Now in a separate card */}
                                {showFilters && (
                                    <div className="bg-[#2a2a2a] rounded-lg p-2 mb-2">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div>
                                                <label className="block text-xs text-white/70 mb-1">Metric Type</label>
                                                <select className="w-full bg-[#1a1a1a] text-white text-xs rounded p-1">
                                                    <option>All Metrics</option>
                                                    <option>Growth</option>
                                                    <option>Valuation</option>
                                                    <option>Profitability</option>
                                                    <option>Liquidity</option>
                                                    <option>Efficiency</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-white/70 mb-1">Sort By</label>
                                                <select className="w-full bg-[#1a1a1a] text-white text-xs rounded p-1">
                                                    <option>Value</option>
                                                    <option>Change</option>
                                                    <option>Metric Name</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-white/70 mb-1">View</label>
                                                <select className="w-full bg-[#1a1a1a] text-white text-xs rounded p-1">
                                                    <option>Table</option>
                                                    <option>Chart</option>
                                                    <option>Both</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-white/70 mb-1">Group By</label>
                                                <select className="w-full bg-[#1a1a1a] text-white text-xs rounded p-1">
                                                    <option>None</option>
                                                    <option>Category</option>
                                                    <option>Trend</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-1 px-2 text-white/70 text-xs font-medium">Metric</th>
                                                <th className="text-right py-1 px-2 text-white/70 text-xs font-medium">Value</th>
                                                <th className="text-right py-1 px-2 text-white/70 text-xs font-medium">Change</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((row, index) => (
                                                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-1 px-2 text-white text-xs">{row.metric}</td>
                                                    <td className="py-1 px-2 text-white text-xs text-right">{row.value}</td>
                                                    <td className={`py-1 px-2 text-right text-xs ${
                                                        row.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {row.change}
                                                    </td>
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
                                        <div className="text-lg text-white min-h-[24px] whitespace-pre-wrap">
                                            {msg.loading ? (
                                                <div className="flex items-center py-1">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-500" />
                                                    <span className="ml-2 text-xs text-white/50">Thinking…</span>
                                                </div>
                                            ) : (
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeHighlight]}
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
}export default ChatFundamentals;

