function TC() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-white via-gray-400 to-green-400 bg-clip-text text-transparent">
            Terms & Conditions
          </span>
        </h1>

        <div className="space-y-6 text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm">
              By accessing and using Bullrun's services, you agree to be bound by these Terms and Conditions.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Service Description</h2>
            <p className="text-sm">
              Bullrun provides AI-powered investment research and analysis tools. Our services include
              real-time market data, technical analysis, company information, and market event tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. User Responsibilities</h2>
            <p className="text-sm">
              Users are responsible for maintaining the confidentiality of their account information
              and for all activities that occur under their account. Users must not share their
              account credentials with others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Data Usage</h2>
            <p className="text-sm">
              While we strive to provide accurate and timely information, we do not guarantee the
              accuracy of our data. Users should verify all information before making investment
              decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Subscription and Payments</h2>
            <p className="text-sm">
              Subscription fees are billed in advance on a monthly basis. Users can cancel their
              subscription at any time, but no refunds will be provided for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Limitation of Liability</h2>
            <p className="text-sm">
              Bullrun is not responsible for any investment decisions made based on our services.
              Users should conduct their own research and consult with financial advisors before
              making investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Contact Information</h2>
            <p className="text-sm">
              For any questions regarding these Terms & Conditions, please contact us at
              support@bullrun.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TC;
