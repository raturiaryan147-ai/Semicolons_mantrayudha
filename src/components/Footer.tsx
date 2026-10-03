import React from 'react';
import { ShoppingBag, Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'products' | 'orders' | 'reviews' | 'profile' | 'support') => void;
  onOpenAiSupport: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAiSupport }) => {
  return (
    <footer className="bg-white border-t border-stone-200 mt-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B3B2C] flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold tracking-tight text-[#0B3B2C]">Nova</span>
                <span className="text-xl font-extrabold tracking-tight text-[#FF5B26]">Mart</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              Your one-stop destination for quality lifestyle products at unbeatable prices. Featuring intelligent Nova AI support, verified customer reviews, and fast nationwide delivery.
            </p>

            <div className="flex items-center gap-3 pt-1 text-stone-400">
              <a href="#" className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  New In
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  Best Sellers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  Deals of the Day
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  Customer Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <button onClick={onOpenAiSupport} className="hover:text-[#FF5B26] transition-colors cursor-pointer flex items-center gap-1">
                  <span>Nova AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </button>
              </li>
              <li>
                <button onClick={onOpenAiSupport} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  Shipping Policy ($75 Free Shipping)
                </button>
              </li>
              <li>
                <button onClick={onOpenAiSupport} className="hover:text-[#FF5B26] transition-colors cursor-pointer">
                  Returns & Refunds (30-Day Policy)
                </button>
              </li>
              <li>
                <span className="text-stone-400">Terms & Conditions</span>
              </li>
              <li>
                <span className="text-stone-400">Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF5B26] shrink-0" />
                <span>support@novamart.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF5B26] shrink-0" />
                <span>+1 234 567 8900</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5B26] shrink-0 mt-0.5" />
                <span>123 Commerce St, New York, NY 10001</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© 2026 NovaMart. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Secure SSL 256-bit checkout</span>
            <span>·</span>
            <span>Supabase & AI Backend Ready</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
