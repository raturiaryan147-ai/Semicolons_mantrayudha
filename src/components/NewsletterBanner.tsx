import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#0B3B2C] text-white rounded-3xl p-6 sm:p-10 shadow-lg shadow-emerald-950/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left Text */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-[#FF8149]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Get Exclusive Offers & Updates
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
                Sign up now and get <span className="font-bold text-[#FF8149]">10% OFF</span> on your first order!
              </p>
            </div>
          </div>

          {/* Right Input Form */}
          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 bg-emerald-800/60 px-5 py-3 rounded-full text-xs font-bold text-white border border-emerald-600/50">
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>You're subscribed! Use promo code NOVA10 for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full sm:w-72 bg-white text-stone-900 placeholder-stone-400 px-4 py-3 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5B26]"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#FF5B26] hover:bg-[#F04F1B] text-white font-extrabold px-7 py-3 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap shadow-md shadow-orange-950/30"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
