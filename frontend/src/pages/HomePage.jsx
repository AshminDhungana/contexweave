import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Make Better Decisions
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            ContextWeave: A real-time temporal knowledge graph platform for 
            <span className="text-blue-600 font-semibold"> decision intelligence</span>
          </p>
          
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
              >
                Get Started Free →
              </Link>
              <Link
                to="/login"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition text-lg"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <img
            src="/src/assets/dashboard.png" 
            alt="Dashboard Preview"
            className="w-full rounded-lg object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why ContextWeave?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition">
              <div className="text-4xl mb-4">🕐</div>
              <h3 className="text-2xl font-bold mb-3">Temporal Tracking</h3>
              <p className="text-gray-300">
                Track every decision from inception to resolution. See how decisions evolve over time with complete audit trails.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-3">Knowledge Graph</h3>
              <p className="text-gray-300">
                Visualize relationships between decisions. Understand how choices connect and influence each other.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Analytics</h3>
              <p className="text-gray-300">
                Get instant insights into your decision-making patterns. Identify bottlenecks and optimize workflows.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Insights</h3>
              <p className="text-gray-300">
                Leverage AI to summarize decisions, identify risks, and suggest next steps automatically.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3">Secure & Private</h3>
              <p className="text-gray-300">
                Your data is yours. Enterprise-grade security with encrypted storage and access controls.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-gray-300">
                Optimized for speed. See your decision trees instantly, even with thousands of events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Create Decision</h3>
            <p className="text-gray-600">
              Define your decision with context and description
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Track Events</h3>
            <p className="text-gray-600">
              Log every event and milestone as things progress
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Get Insights</h3>
            <p className="text-gray-600">
              Analyze patterns and get AI-powered recommendations
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Learn & Improve</h3>
            <p className="text-gray-600">
              Improve your decision-making with historical data
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for individuals</p>
              
              <div className="text-4xl font-bold text-blue-600 mb-6">
                $0<span className="text-lg text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-700">
                <li>✓ Up to 10 decisions</li>
                <li>✓ Basic analytics</li>
                <li>✓ Mobile access</li>
                <li>✗ AI insights</li>
              </ul>
              
              <Link
                to="/signup"
                className="w-full inline-block text-center bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-600 text-white rounded-xl shadow-xl p-8 transform scale-105">
              <div className="bg-yellow-400 text-blue-600 rounded-full w-fit px-4 py-1 font-bold mb-4">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-blue-100 mb-6">Best for teams</p>
              
              <div className="text-4xl font-bold mb-6">
                $29<span className="text-lg text-blue-100">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-blue-100">
                <li>✓ Unlimited decisions</li>
                <li>✓ Advanced analytics</li>
                <li>✓ AI insights & recommendations</li>
                <li>✓ Team collaboration</li>
              </ul>
              
              <Link
                to="/signup"
                className="w-full inline-block text-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Enterprise</h3>
              <p className="text-gray-600 mb-6">For organizations</p>
              
              <div className="text-4xl font-bold text-gray-900 mb-6">
                Custom<span className="text-lg text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-700">
                <li>✓ Everything in Pro</li>
                <li>✓ SSO & advanced security</li>
                <li>✓ Dedicated support</li>
                <li>✓ Custom integrations</li>
              </ul>
              
              <button
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Decision-Making?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join teams using ContextWeave to make smarter, faster decisions backed by data.
          </p>
          
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition text-lg"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-lg"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">ContextWeave</h4>
              <p className="text-sm">
                Making decisions smarter through temporal knowledge graphs.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 ContextWeave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
