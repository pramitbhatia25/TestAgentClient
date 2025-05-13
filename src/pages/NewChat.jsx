import { useRef, useState } from "react";
import { SendHorizonal, TrendingUp, LineChart, Vote } from "lucide-react";

function NewChat({ onSendMessage }) {
  const textareaRef = useRef(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSend = async () => {
    console.log("handleSend", input);
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error in chat creation:', error);
      setError('Failed to create chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-[75%] min-w-[500px] max-w-[800px] mx-auto pt-8 px-5">
        <div className="text-5xl font-extrabold mb-2 text-center">
          <span
            className="bg-gradient-to-r from-white via-gray-400 to-green-400 bg-clip-text text-transparent"
          >
            Research your trading ideas
          </span>
        </div>
        <div className="text-lg text-white/70 mb-8 text-center">
          Bullrun is your AI agent for investment research and trading
        </div>
        {error && (
          <div className="text-red-500 mb-4 text-center">
            {error}
          </div>
        )}
        <div className="min-h-[80px] max-h-[200px] w-full border border-white/30 rounded-lg shadow-lg p-3 bg-[#1a1a1a] backdrop-blur-sm flex gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none bg-transparent text-white outline-none text text-base"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {/* Card 1 */}
          <div className="bg-transparent border border-white/20 rounded-lg p-3 w-[30%] md:w-full text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow flex flex-col gap-1">
            <div className="font-semibold text-xs mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Follow Pelosi's trading moves.
            </div>
            <div className="text-xs text-white/50 italic">"Show me Nancy Pelosi's recent stock trades"</div>
          </div>
          {/* Card 2 */}
          <div className="bg-transparent border border-white/20 rounded-lg p-3 w-[30%] md:w-full text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow flex flex-col gap-1">
            <div className="font-semibold text-xs mb-1 flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Backtest Rolling Leaps.
            </div>
            <div className="text-xs text-white/50 italic">"Backtest a rolling LEAPS strategy on AAPL"</div>
          </div>
          {/* Card 3 */}
          <div className="bg-transparent border border-white/20 rounded-lg p-3 w-[30%] md:w-full text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow flex flex-col gap-1">
            <div className="font-semibold text-xs mb-1 flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Election impact on stocks
            </div>
            <div className="text-xs text-white/50 italic">"How do elections affect the stock market?"</div>
          </div>
        </div>
        <div className="flex justify-center gap-8 mt-20 text-sm text-white/60">
          <a href="/agents" className="hover:text-white/90 transition-colors">Agents</a>
          <a href="/blog" className="hover:text-white/90 transition-colors">Blog</a>
          <a href="/pricing" className="hover:text-white/90 transition-colors">Pricing</a>
          <a href="/terms" className="hover:text-white/90 transition-colors">Terms & Conditions</a>
        </div>        
      </div>
    </div>
  );
}

export default NewChat;