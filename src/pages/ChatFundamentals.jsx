import UpdatedNavbar from "../components/UpdatedNavbar";
import { useRef, useState, useEffect } from "react";
import { Send, SendHorizonal, ThumbsUp, ThumbsDown, Copy, TrendingUp, LineChart, Vote, Filter, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import Plot from 'react-plotly.js';
import { Autocomplete, AutocompleteItem } from "@heroui/react";
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

// Dummy stock data
const STOCKS = [
    // Technology
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "NVDA", name: "Nvidia Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOG", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "CRM", name: "Salesforce Inc." },
    { symbol: "ORCL", name: "Oracle Corporation" },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "CSCO", name: "Cisco Systems Inc." },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "IBM", name: "International Business Machines" },
    { symbol: "TXN", name: "Texas Instruments Inc." },
    { symbol: "QCOM", name: "Qualcomm Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices Inc." },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "MU", name: "Micron Technology Inc." },
    { symbol: "SNOW", name: "Snowflake Inc." },
    { symbol: "PANW", name: "Palo Alto Networks Inc." },
    { symbol: "ZS", name: "Zscaler Inc." },
    
    // Financial Services
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "BAC", name: "Bank of America Corp." },
    { symbol: "WFC", name: "Wells Fargo & Co." },
    { symbol: "GS", name: "Goldman Sachs Group Inc." },
    { symbol: "MS", name: "Morgan Stanley" },
    { symbol: "C", name: "Citigroup Inc." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "AXP", name: "American Express Co." },
    { symbol: "PYPL", name: "PayPal Holdings Inc." },
    
    // Healthcare
    { symbol: "UNH", name: "UnitedHealth Group Inc." },
    { symbol: "LLY", name: "Eli Lilly and Co." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "PFE", name: "Pfizer Inc." },
    { symbol: "MRK", name: "Merck & Co. Inc." },
    { symbol: "ABBV", name: "AbbVie Inc." },
    { symbol: "BMY", name: "Bristol-Myers Squibb" },
    { symbol: "AMGN", name: "Amgen Inc." },
    { symbol: "GILD", name: "Gilead Sciences Inc." },
    { symbol: "CVS", name: "CVS Health Corp." },
    
    // Consumer Discretionary
    { symbol: "HD", name: "Home Depot Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "COST", name: "Costco Wholesale Corp." },
    { symbol: "MCD", name: "McDonald's Corp." },
    { symbol: "PG", name: "Procter & Gamble Co." },
    { symbol: "KO", name: "Coca-Cola Co." },
    { symbol: "PEP", name: "PepsiCo Inc." },
    { symbol: "SBUX", name: "Starbucks Corp." },
    { symbol: "TGT", name: "Target Corp." },
    
    // Energy
    { symbol: "XOM", name: "Exxon Mobil Corp." },
    { symbol: "CVX", name: "Chevron Corp." },
    { symbol: "NEE", name: "NextEra Energy Inc." },
    { symbol: "DUK", name: "Duke Energy Corp." },
    { symbol: "SO", name: "Southern Co." },
    { symbol: "AEP", name: "American Electric Power" },
    { symbol: "WEC", name: "WEC Energy Group Inc." },
    { symbol: "PPL", name: "PPL Corp." },
    { symbol: "FE", name: "FirstEnergy Corp." },
    { symbol: "XEL", name: "Xcel Energy Inc." },
    
    // Telecommunications
    { symbol: "T", name: "AT&T Inc." },
    { symbol: "VZ", name: "Verizon Communications" },
    { symbol: "TMUS", name: "T-Mobile US Inc." },
    { symbol: "CHT", name: "Chunghwa Telecom" },
    { symbol: "LUMN", name: "Lumen Technologies" },
    { symbol: "VIV", name: "Telefonica Brasil" },
    
    // Industrial
    { symbol: "HON", name: "Honeywell International" },
    { symbol: "BA", name: "Boeing Co." },
    { symbol: "CAT", name: "Caterpillar Inc." },
    { symbol: "DE", name: "Deere & Co." },
    { symbol: "GE", name: "General Electric Co." },
    { symbol: "UPS", name: "United Parcel Service" },
    { symbol: "DHR", name: "Danaher Corp." },
    { symbol: "FDX", name: "FedEx Corp." },
    { symbol: "ETN", name: "Eaton Corp." },
    
    // Real Estate
    { symbol: "SPG", name: "Simon Property Group" },
    { symbol: "AMT", name: "American Tower Corp." },
    { symbol: "PLD", name: "Prologis Inc." },
    { symbol: "EQIX", name: "Equinix Inc." },
    { symbol: "DLR", name: "Digital Realty Trust" },
    { symbol: "O", name: "Realty Income Corp." },
    { symbol: "VTR", name: "Ventas Inc." },
    { symbol: "CBRE", name: "CBRE Group Inc." },
    
    // Consumer Discretionary
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "DIS", name: "Walt Disney Co." },
    { symbol: "GM", name: "General Motors Co." },
    { symbol: "F", name: "Ford Motor Co." },
    { symbol: "RIVN", name: "Rivian Automotive" },
    { symbol: "NKE", name: "Nike Inc." },
    { symbol: "XLY", name: "Consumer Discretionary Select Sector SPDR" },
    { symbol: "LULU", name: "Lululemon Athletica" },
    { symbol: "ETSY", name: "Etsy Inc." },
    { symbol: "RCL", name: "Royal Caribbean Cruises" },
    
    // Materials
    { symbol: "LIN", name: "Linde plc" },
    { symbol: "LHX", name: "L3Harris Technologies" },
    { symbol: "NUE", name: "Nucor Corp." },
    { symbol: "ECL", name: "Ecolab Inc." },
    { symbol: "APD", name: "Air Products & Chemicals" },
    { symbol: "FCX", name: "Freeport-McMoRan Inc." },
    { symbol: "SHW", name: "Sherwin-Williams Co." },
    { symbol: "PPG", name: "PPG Industries Inc." },
    { symbol: "MOS", name: "Mosaic Co." },
    { symbol: "CMP", name: "Compass Minerals" }
];

// Update the INTERVALS constant with the correct options
const INTERVALS = [
    { id: "1m", name: "1 Month" },
    { id: "3m", name: "3 Months" },
    { id: "1y", name: "1 Year" },
    { id: "3y", name: "3 Years" }
];

// Update INDICATORS to include stock price
const INDICATORS = [
    {
        id: "price",
        name: "Stock Price",
        description: "Current stock price and historical data"
    },
    {
        id: "rsi",
        name: "Relative Strength Index (RSI)",
        description: "Momentum oscillator measuring speed and change of price movements"
    },
    {
        id: "macd",
        name: "Moving Average Convergence Divergence (MACD)",
        description: "Trend-following momentum indicator showing relationship between moving averages"
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
    const [selected, setSelected] = useState(STOCKS.find(stock => stock.symbol === "NVDA"));
    const [selectedIndicator, setSelectedIndicator] = useState("price");
    const [selectedInterval, setSelectedInterval] = useState("1m");
    const [stockData, setStockData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [oneMonthData, setOneMonthData] = useState(null);
    const isInitialMount = useRef(true);
    const [sessionId] = useState(`s_fundamentals`);

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
            
            // Use functional update to ensure we're working with latest state
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

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    // Update the fetchStockData function to handle empty responses
    const fetchStockData = async (symbol, interval) => {
        setIsLoadingData(true);
        try {
            const response = await fetch(`https://stock-data-1032123744845.us-central1.run.app/get-full-history/${symbol}?interval=${interval}`);
            const data = await response.json();
            
            // Handle empty response
            if (!data.history || data.history.length === 0) {
                setStockData(null);
                setError('No data available for this interval');
                return;
            }
            
            setStockData(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Failed to fetch stock data');
            setStockData(null);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Add a function to fetch 1-month data
    const fetchOneMonthData = async (symbol) => {
        try {
            const response = await fetch(`https://stock-data-1032123744845.us-central1.run.app/get-full-history/${symbol}?interval=1m`);
            const data = await response.json();
            setOneMonthData(data);
        } catch (error) {
            console.error('Error fetching 1-month data:', error);
        }
    };

    // Update the useEffect to fetch both 1-month data and interval data
    useEffect(() => {
        if (selected?.symbol) {
            fetchOneMonthData(selected.symbol);
            fetchStockData(selected.symbol, selectedInterval);
        }
    }, [selected?.symbol, selectedInterval]);

    return (
        <div className="bg-[#000000] flex flex-col h-full">
            <div className="flex-1 w-full flex flex-col overflow-hidden">
                <div className="w-full mx-auto flex flex-col h-full">
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="w-[95%] sm:w-[85%] md:w-[75%] min-w-[280px] max-w-[800px] mx-auto pt-2 sm:pt-4 px-3 sm:px-5">
                            {/* Stock and Indicator Selection */}
                            <div className="mb-4 flex items-center gap-4">
                                {/* Stock Picker - 30% width */}
                                <div className="flex-[0.3]">
                                    <Autocomplete
                                        className="w-full"
                                        selectedKey={selected?.symbol}
                                        onSelectionChange={(key) => setSelected(STOCKS.find(stock => stock.symbol === key))}
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
                                        {STOCKS.map(stock => (
                                            <AutocompleteItem key={stock.symbol} value={stock.symbol}>
                                                {stock.symbol}
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                </div>
                                {/* Indicator Picker - 50% width */}
                                <div className="flex-[0.5]">
                                    <Autocomplete
                                        className="w-full"
                                        selectedKey={selectedIndicator}
                                        onSelectionChange={(key) => setSelectedIndicator(key)}
                                        placeholder="Select indicator..."
                                        size="sm"
                                        classNames={{
                                            base: "w-full",
                                            trigger: "bg-[#1a1a1a] text-white text-sm rounded-lg border border-white/30 focus:border-white/50 focus:outline-none",
                                            value: "text-white",
                                            listbox: "bg-[#1a1a1a] text-white",
                                            popover: "bg-[#1a1a1a]"
                                        }}
                                    >
                                        {INDICATORS.map(indicator => (
                                            <AutocompleteItem key={indicator.id} value={indicator.id}>
                                                <div className="flex flex-col">
                                                    <span>{indicator.name}</span>
                                                    <span className="text-xs text-white/60">{indicator.description}</span>
                                                </div>
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                </div>
                                {/* Full Analysis Button - 20% width */}
                                <div className="flex-[0.2]">
                                    <button
                                        className={`w-full px-3 py-1 text-sm rounded-lg transition-colors ${
                                            selected 
                                                ? 'bg-[#2e3d5c] text-white hover:bg-[#3a4d6e]' 
                                                : 'bg-[#2a2a2a] text-white/40 cursor-not-allowed'
                                        }`}
                                        disabled={!selected}
                                        onClick={async () => {
                                            if (selected) {
                                                const message = `Do a complete analysis of ${selected.symbol}`;
                                                setInput(message);
                                                // Wait for the next render cycle
                                                await new Promise(resolve => setTimeout(resolve, 0));
                                                handleSend();
                                            }
                                        }}
                                    >
                                        Full Analysis
                                    </button>
                                </div>
                            </div>

                            {/* Stock Details with Chart */}
                            {selected ? (
                                <div className="mb-4">
                                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-lg font-semibold">
                                                    ${oneMonthData?.history?.[oneMonthData.history.length - 1]?.price?.toFixed(2) || '--'}
                                                </span>
                                                {oneMonthData?.history && oneMonthData.history.length > 1 && (
                                                    <span className={`text-sm ${
                                                        oneMonthData.history[oneMonthData.history.length - 1].price >= oneMonthData.history[oneMonthData.history.length - 2].price 
                                                            ? 'text-green-400' 
                                                            : 'text-red-400'
                                                    }`}>
                                                        {oneMonthData.history[oneMonthData.history.length - 1].price >= oneMonthData.history[oneMonthData.history.length - 2].price ? '+' : ''}
                                                        {(oneMonthData.history[oneMonthData.history.length - 1].price - oneMonthData.history[oneMonthData.history.length - 2].price).toFixed(2)}
                                                        {' '}
                                                        <span className="text-white/60">
                                                            ({((oneMonthData.history[oneMonthData.history.length - 1].price - oneMonthData.history[oneMonthData.history.length - 2].price) / 
                                                                oneMonthData.history[oneMonthData.history.length - 2].price * 100).toFixed(2)}%)
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Interval Buttons */}
                                            <div className="flex items-center gap-1">
                                                {INTERVALS.map(interval => (
                                                    <button
                                                        key={interval.id}
                                                        onClick={() => setSelectedInterval(interval.id)}
                                                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                                            selectedInterval === interval.id
                                                                ? 'bg-[#2e3d5c] text-white'
                                                                : 'bg-[#2a2a2a] text-white/60 hover:bg-[#333] hover:text-white'
                                                        }`}
                                                    >
                                                        {interval.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {error && (
                                            <div className="text-red-400 text-sm mb-3">
                                                {error}
                                            </div>
                                        )}
                                        
                                        {isLoadingData ? (
                                            <div className="flex items-center justify-center h-[300px]">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-blue-500" />
                                            </div>
                                        ) : stockData?.history && stockData.history.length > 0 ? (
                                            <Plot
                                                data={[
                                                    {
                                                        x: stockData.history.map(h => new Date(h.datetime)),
                                                        y: stockData.history.map(h => {
                                                            // Return different values based on selected indicator
                                                            switch(selectedIndicator) {
                                                                case "price":
                                                                    return h.price;
                                                                case "rsi":
                                                                    return h.rsi || 0; // Add RSI data if available
                                                                case "macd":
                                                                    return h.macd || 0; // Add MACD data if available
                                                                default:
                                                                    return h.price;
                                                            }
                                                        }),
                                                        type: 'scatter',
                                                        mode: 'lines+markers',
                                                        name: selectedIndicator === "price" ? selected.symbol : INDICATORS.find(i => i.id === selectedIndicator)?.name,
                                                        line: {
                                                            color: selectedIndicator === "price" 
                                                                ? (stockData.history[0].price >= stockData.history[1].price ? '#22c55e' : '#ef4444')
                                                                : '#22c55e',
                                                            width: 2
                                                        },
                                                        marker: {
                                                            color: '#fff',
                                                            size: 6,
                                                            line: { color: '#333', width: 1 }
                                                        },
                                                        hovertemplate: selectedIndicator === "price" 
                                                            ? '%{x}<br>Price: $%{y:.2f}<extra></extra>'
                                                            : '%{x}<br>%{y:.2f}<extra></extra>',
                                                    },
                                                ]}
                                                layout={{
                                                    title: {
                                                        text: selectedIndicator === "price" 
                                                            ? `${selected.symbol} Price Chart`
                                                            : `${INDICATORS.find(i => i.id === selectedIndicator)?.name} for ${selected.symbol}`,
                                                        font: { color: '#fff', size: 18 }
                                                    },
                                                    paper_bgcolor: '#1a1a1a',
                                                    plot_bgcolor: '#1a1a1a',
                                                    margin: { t: 50, r: 30, b: 60, l: 60 },
                                                    xaxis: {
                                                        title: { text: 'Time', font: { color: '#fff', size: 14 } },
                                                        showgrid: true,
                                                        gridcolor: '#333',
                                                        zeroline: false,
                                                        tickfont: { color: '#fff' }
                                                    },
                                                    yaxis: {
                                                        title: { text: 'Price (USD)', font: { color: '#fff', size: 14 } },
                                                        showgrid: true,
                                                        gridcolor: '#333',
                                                        zeroline: false,
                                                        tickfont: { color: '#fff' }
                                                    },
                                                    height: 300,
                                                    autosize: true,
                                                    showlegend: true,
                                                    legend: {
                                                        font: { color: '#fff' },
                                                        orientation: 'h',
                                                        y: -0.2
                                                    }
                                                }}
                                                config={{
                                                    displayModeBar: false,
                                                    responsive: true
                                                }}
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-[300px] text-white/60">
                                                No data available for this interval
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <div className="bg-[#1a1a1a] rounded-lg p-6 text-left">
                                        <p className="text-sm text-white/60">Choose a stock from the dropdown above to view its price chart and analysis.</p>
                                    </div>
                                </div>
                            )}

                            {/* Messages Section */}
                            <div className="mt-6 sm:mt-8">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">{msg.user}</h2>
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
    );
}

export default ChatFundamentals;

