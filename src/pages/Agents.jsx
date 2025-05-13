import { TrendingUp, LineChart, Vote, Newspaper } from "lucide-react";

function Agents() {
  const agents = [
    {
      name: "Price and Market Data Agent",
      icon: TrendingUp,
      description: "Specialized agent for real-time stock prices, historical data, and market metrics. Get current prices, historical trends, and basic market calculations with clear, tabular presentations.",
      capabilities: [
        "Get current stock prices",
        "Access historical stock data",
        "Calculate basic metrics",
        "Track trading volume"
      ]
    },
    {
      name: "Company Information Agent",
      icon: LineChart,
      description: "Comprehensive company analysis specialist providing detailed business information, financial statements, and fundamental metrics. Perfect for deep-dive company research and valuation analysis.",
      capabilities: [
        "Company information and details",
        "Financial statements analysis",
        "Valuation metrics",
        "ESG and sustainability data"
      ]
    },
    {
      name: "Technical Analysis Agent",
      icon: Vote,
      description: "Expert in technical indicators and market patterns. Provides detailed technical analysis, market sentiment data, and trading recommendations based on technical indicators.",
      capabilities: [
        "Technical indicators calculation",
        "Analyst recommendations",
        "Market sentiment analysis",
        "Pattern recognition"
      ]
    },
    {
      name: "Market Events Agent",
      icon: Newspaper,
      description: "Stay informed with real-time market news, calendar events, and important market dates. Get timely updates and insights about market-moving events and their potential impact.",
      capabilities: [
        "Real-time stock news",
        "Calendar events tracking",
        "Market impact analysis",
        "Event notifications"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1 text-center">
          <span className="bg-gradient-to-r from-white via-gray-400 to-green-400 bg-clip-text text-transparent">
            Our AI Agents
          </span>
        </h1>
        <p className="text-base text-white/70 mb-8 text-center">
          Specialized AI agents designed to help you make informed investment decisions
        </p>

        <div className="flex flex-col gap-4">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] border border-white/20 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-[#2e3d5c] rounded-lg">
                  <agent.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold">{agent.name}</h2>
              </div>
              <p className="text-sm text-white/70 mb-3">{agent.description}</p>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-white/90">Key Capabilities:</h3>
                <ul className="list-disc list-inside text-xs text-white/70 space-y-0.5">
                  {agent.capabilities.map((capability, idx) => (
                    <li key={idx}>{capability}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Agents;
