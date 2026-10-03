import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Award, Shield, Plus, Check, Edit2, Trash2, Heart, LogIn, LogOut, ShieldCheck, Cloud } from 'lucide-react';
import { UserProfile, UserAddress } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
  onAddAddress: (address: Omit<UserAddress, 'id'>) => void;
  onDeleteAddress: (id: string) => void;
  orderCount: number;
  wishlistCount: number;
  onViewOrders: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  onUpdateProfile,
  onAddAddress,
  onDeleteAddress,
  orderCount,
  wishlistCount,
  onViewOrders
}) => {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'rewards'>('details');

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Address Form Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, phone });
    setIsEditingInfo(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity) return;

    onAddAddress({
      title: newAddrTitle,
      name: profile.name,
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      zip: newAddrZip,
      country: 'United States',
      isDefault: newAddrIsDefault
    });

    setShowAddressModal(false);
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrZip('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#0B3B2C] via-[#093527] to-[#06241B] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/15 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#FF5B26] to-[#FFA275] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-lg border-2 border-white/20">
                {profile.name.charAt(0)}
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {profile.name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FF5B26] text-white">
                  {profile.membershipTier}
                </span>
                {currentUser ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Firebase Synced</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-700/50 text-stone-300 border border-stone-600/50">
                    <Cloud className="w-3 h-3 text-stone-400" />
                    <span>Guest Mode</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-1">{profile.email} · {profile.phone}</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">Member since {profile.memberSince}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">Reward Points</div>
              <div className="text-lg font-mono font-bold text-[#FF8149] leading-tight mt-0.5">
                {profile.rewardPoints} pts
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">VIP Discount</div>
              <div className="text-lg font-mono font-bold text-emerald-300 leading-tight mt-0.5">
                10% OFF
              </div>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
                title="Sign out of Firebase Auth"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-300" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FF5B26] hover:bg-[#E04815] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                title="Sign in with Google to save your profile and orders to Firestore"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>

        </div>
      </div>


      {/* Account Metric Summaries */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        
        <button
          onClick={onViewOrders}
          className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-colors text-left cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Orders</div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono mt-1">{orderCount}</div>
          <div className="text-[11px] text-[#FF5B26] font-semibold mt-1">View history →</div>
        </button>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Saved Addresses</div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono mt-1">{profile.addresses.length}</div>
          <div className="text-[11px] text-stone-500 font-semibold mt-1">Ready for checkout</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Wishlist Saved</div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono mt-1">{wishlistCount}</div>
          <div className="text-[11px] text-stone-500 font-semibold mt-1">Favorites tracking</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Support Status</div>
          <div className="text-sm font-extrabold text-[#0B3B2C] mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>VIP Priority</span>
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-1">Nova AI Dedicated</div>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        
        {/* Tab Header */}
        <div className="flex border-b border-stone-200 p-2 gap-2 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Personal Information
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Saved Addresses ({profile.addresses.length})
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Nova Rewards & VIP Perks
          </button>
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === 'details' && (
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Account Details</h3>
                <p className="text-xs text-stone-500 mt-0.5">Manage your contact information used for checkout and order alerts</p>
              </div>

              {!isEditingInfo ? (
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:border-stone-400 text-xs font-semibold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingInfo(false)}
                  className="text-xs text-stone-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Your contact information was updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={!isEditingInfo}
                  className={`w-full text-xs font-medium px-4 py-2.5 rounded-xl border ${
                    isEditingInfo ? 'bg-white border-stone-300 focus:border-[#0B3B2C]' : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!isEditingInfo}
                  className={`w-full text-xs font-medium px-4 py-2.5 rounded-xl border ${
                    isEditingInfo ? 'bg-white border-stone-300 focus:border-[#0B3B2C]' : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={!isEditingInfo}
                  className={`w-full text-xs font-medium px-4 py-2.5 rounded-xl border ${
                    isEditingInfo ? 'bg-white border-stone-300 focus:border-[#0B3B2C]' : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                  required
                />
              </div>

              {isEditingInfo && (
                <button
                  type="submit"
                  className="bg-[#0B3B2C] hover:bg-[#07241A] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              )}
            </form>

          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Shipping Addresses</h3>
                <p className="text-xs text-stone-500 mt-0.5">Pre-saved destinations for 1-click expedited checkout</p>
              </div>

              <button
                onClick={() => setShowAddressModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5B26] hover:bg-[#F04F1B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.addresses.map(addr => (
                <div
                  key={addr.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">{addr.title}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#0B3B2C] text-white">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-stone-800">{addr.name}</p>
                  <p className="text-xs text-stone-600">{addr.street}</p>
                  <p className="text-xs text-stone-600">{addr.city}, {addr.state} {addr.zip}</p>
                  <p className="text-xs text-stone-500">{addr.country}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                    <span className="text-[10px] text-stone-400">Verified for FedEx & USPS</span>
                    <button
                      onClick={() => onDeleteAddress(addr.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 3: Rewards & VIP Perks */}
        {activeTab === 'rewards' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">Nova VIP Tier Benefits</h3>
              <p className="text-xs text-stone-500">Your loyalty points automatically convert to checkout discounts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="text-xs font-bold text-emerald-800">Free Express Delivery</div>
                <p className="text-[11px] text-emerald-700/80 mt-1">Automatic zero-dollar shipping on all orders over $75 with priority packing.</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="text-xs font-bold text-[#FF5B26]">Early Flash Access</div>
                <p className="text-[11px] text-stone-600 mt-1">Get 2 hours early access to all Deals of the Day and seasonal inventory.</p>
              </div>

              <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200">
                <div className="text-xs font-bold text-stone-900">Dedicated AI Agent</div>
                <p className="text-[11px] text-stone-600 mt-1">Zero waiting time on order lookups, returns, and personalized suggestions.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-100 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-base font-bold text-stone-900">Add New Address</h4>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Label</label>
                <input
                  type="text"
                  value={newAddrTitle}
                  onChange={e => setNewAddrTitle(e.target.value)}
                  placeholder="e.g. Vacation Home, Studio"
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddrStreet}
                  onChange={e => setNewAddrStreet(e.target.value)}
                  placeholder="123 Market St, Apt 2B"
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newAddrCity}
                    onChange={e => setNewAddrCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-stone-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State & Zip</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAddrState}
                      onChange={e => setNewAddrState(e.target.value)}
                      placeholder="CA"
                      className="w-16 text-xs font-medium px-2 py-2 rounded-xl border border-stone-300 text-center"
                      required
                    />
                    <input
                      type="text"
                      value={newAddrZip}
                      onChange={e => setNewAddrZip(e.target.value)}
                      placeholder="94103"
                      className="flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-stone-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={newAddrIsDefault}
                  onChange={e => setNewAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B3B2C] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="defaultAddress" className="text-xs text-stone-700 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#0B3B2C] hover:bg-[#07241A] text-white text-xs font-bold cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
