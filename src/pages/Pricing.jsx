function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "$19",
      period: "month",
      features: [
        "Access to Price and Market Data Agent",
        "Basic technical analysis",
        "Limited historical data",
        "Standard support"
      ]
    },
    {
      name: "Professional",
      price: "$49",
      period: "month",
      features: [
        "All Basic features",
        "Access to all AI agents",
        "Advanced technical analysis",
        "Full historical data access",
        "Priority support",
        "Custom alerts"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact",
      features: [
        "All Professional features",
        "Custom AI agent development",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Team management"
      ]
    }
  ];

  const handleGetStarted = () => {
    window.open('https://calendly.com/prashanthkonda/bullrun', '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">
          <span className="bg-gradient-to-r from-white via-gray-400 to-green-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </span>
        </h1>
        <p className="text-lg text-white/70 mb-12 text-center">
          Choose the plan that best fits your investment needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#1a1a1a] border border-white/20 rounded-lg p-6 ${
                plan.popular ? 'border-green-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-green-400 text-black text-sm font-medium px-3 py-1 rounded-full w-fit mb-4">
                  Most Popular
                </div>
              )}
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/70">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  plan.popular
                    ? 'bg-green-400 text-black hover:bg-green-500'
                    : 'bg-[#2e3d5c] text-white hover:bg-[#3a4d6c]'
                }`}
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricing;

