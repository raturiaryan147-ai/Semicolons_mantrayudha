import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Package, ArrowRight, LifeBuoy, Check, Cloud, Trash2, LogIn, SlidersHorizontal } from 'lucide-react';
import { Order, Product } from '../types';
import { EnhancedChatMessage, InteractiveActionChip } from '../types/agentReasoning';
import { LayeredAgentOrchestrator } from '../services/agentEngine/layeredAgentOrchestrator';
import { ChatPersistenceService } from '../services/chatPersistenceService';
import { useAuth } from '../context/AuthContext';
import { ProductVisual } from './ProductVisual';
import { ReasoningTraceInspector } from './ReasoningTraceInspector';

interface NovaAiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onViewOrder: (order: Order) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  initialPrompt?: string;
}

const DEFAULT_WELCOME_CHIPS: InteractiveActionChip[] = [
  { label: 'Track Order #NM-8492', action: 'send_prompt', payload: 'What is the status of order #NM-8492?' },
  { label: 'Return Order #NM-8410', action: 'send_prompt', payload: 'I want to return order #NM-8410' },
  { label: 'Return Policy', action: 'send_prompt', payload: 'What is your return policy?' },
  { label: 'Shipping Speeds', action: 'send_prompt', payload: 'What are your shipping speeds?' },
  { label: 'Active Promotions', action: 'send_prompt', payload: 'What promo codes are active?' }
];

const DEFAULT_WELCOME_FOLLOWUPS = [
  'What is the status of my order?',
  'What is the 30-day return policy?',
  'What discount codes can I use?',
  'Connect with a human specialist'
];

export const NovaAiChatPanel: React.FC<NovaAiChatPanelProps> = ({
  isOpen,
  onClose,
  onOpen,
  onViewOrder,
  onViewProduct,
  onAddToCart,
  initialPrompt
}) => {
  const { currentUser, userProfile, loginWithGoogle } = useAuth();

  const [messages, setMessages] = useState<EnhancedChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: "Hello. I am NovaMart's AI Customer Support Agent.\n\nI can help you check orders, process returns, explain store policies, or find products in our catalog. How can I assist you today?",
      interactiveChips: DEFAULT_WELCOME_CHIPS,
      suggestedFollowUps: DEFAULT_WELCOME_FOLLOWUPS
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showDebugTrace, setShowDebugTrace] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from Firebase for the individual user
  useEffect(() => {
    let unsubscribe = () => {};

    if (currentUser?.uid) {
      ChatPersistenceService.loadChatHistory(currentUser.uid).then(history => {
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: 'welcome',
              sender: 'assistant',
              timestamp: 'Just now',
              text: `Hello ${userProfile.name}. I am NovaMart's AI Customer Support Agent.\n\nI have access to your order history and store policies. Please let me know how I can assist you.`,
              interactiveChips: DEFAULT_WELCOME_CHIPS,
              suggestedFollowUps: DEFAULT_WELCOME_FOLLOWUPS
            }
          ]);
        }
      });

      unsubscribe = ChatPersistenceService.subscribeToChat(currentUser.uid, (syncedMessages) => {
        if (syncedMessages && syncedMessages.length > 0) {
          setMessages(syncedMessages);
        }
      });
    } else {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          timestamp: 'Just now',
          text: "Hello. I am NovaMart's AI Customer Support Agent.\n\nI can assist you with orders, returns, store policies, and product details. Please let me know how I can assist you today.",
          interactiveChips: DEFAULT_WELCOME_CHIPS,
          suggestedFollowUps: DEFAULT_WELCOME_FOLLOWUPS
        }
      ]);
    }

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    if (currentUser?.uid) {
      ChatPersistenceService.saveChatMessage(currentUser.uid, userMsg);
    }

    try {
      setTimeout(async () => {
        const assistantResponse = await LayeredAgentOrchestrator.processMessage(
          userMsg.text,
          [...messages, userMsg],
          userProfile?.name
        );
        setMessages(prev => [...prev, assistantResponse]);
        setIsTyping(false);

        if (currentUser?.uid) {
          ChatPersistenceService.saveChatMessage(currentUser.uid, assistantResponse);
        }
      }, 300);

    } catch (e) {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      if (currentUser?.uid) {
        await ChatPersistenceService.clearChatHistory(currentUser.uid);
      }
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: 'Conversation history cleared. How can I assist you?',
          interactiveChips: DEFAULT_WELCOME_CHIPS,
          suggestedFollowUps: DEFAULT_WELCOME_FOLLOWUPS
        }
      ]);
    } finally {
      setIsClearing(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Track #NM-8492', prompt: 'What is the status of order #NM-8492?' },
    { label: 'Return #NM-8410', prompt: 'I want to return order #NM-8410' },
    { label: 'Return Policy', prompt: 'What is your 30-day return policy?' },
    { label: 'Shipping Speeds', prompt: 'What are your delivery times and shipping costs?' },
    { label: 'Human Specialist', prompt: 'I would like to speak to a human representative' }
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 bg-[#0B3B2C] hover:bg-[#07241A] text-white p-4 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-stone-900/20 flex items-center gap-3 border border-white/20 transition-all hover:scale-102 cursor-pointer group"
          title="NovaMart Customer Support"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0B3B2C]" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold leading-none flex items-center gap-1.5">
              <span>NovaMart Support</span>
              {currentUser && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-mono">
                  Synced
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-300 mt-0.5">Online</p>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[470px] h-[650px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-left">
          
          {/* Header */}
          <div className="bg-[#0B3B2C] px-5 py-3.5 text-white flex items-center justify-between border-b border-emerald-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight">NovaMart Support</h3>
                  {currentUser ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-medium border border-emerald-400/30">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>Firebase Synced</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-700/60 text-stone-300 text-[10px] font-mono">
                      Guest
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-300">
                  {currentUser ? `Signed in as ${userProfile.name}` : 'Verified Customer Assistance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                disabled={isClearing}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guest Sign In Callout Bar if not signed in */}
          {!currentUser && (
            <div className="bg-stone-50 px-3.5 py-1.5 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-700">
              <span>Sign in with Google to preserve your conversation history.</span>
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-1 font-semibold text-[#0B3B2C] hover:underline cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-[#FF5B26]" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-stone-100 text-stone-700 font-medium px-2.5 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FBFBFA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[92%] rounded-xl p-3.5 text-xs sm:text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0B3B2C] text-white rounded-br-xs font-normal'
                      : 'bg-white text-stone-800 border border-stone-200 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1.5">
                    {msg.text}
                  </div>

                  {/* Return Receipt Confirmation Card */}
                  {msg.returnReceipt && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 text-emerald-900">
                          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                          Prepaid Return Authorized (RMA)
                        </span>
                        <span className="font-mono text-[10px] text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded font-bold">
                          {msg.returnReceipt.returnId}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Items: {msg.returnReceipt.itemNames.join(', ')}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-emerald-200">
                        <span>Expected Refund: <strong className="font-mono text-emerald-950">${msg.returnReceipt.refundAmount.toFixed(2)}</strong></span>
                        <span className="text-[10px] text-emerald-700">{msg.returnReceipt.dropoffCarrier}</span>
                      </div>
                    </div>
                  )}

                  {/* Escalation Ticket Card */}
                  {msg.escalationTicket && (
                    <div className="mt-3 p-3 bg-stone-100 rounded-lg border border-stone-300 text-stone-900 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 text-stone-800">
                          <LifeBuoy className="w-3.5 h-3.5 text-stone-700" />
                          Escalated to Specialist
                        </span>
                        <span className="font-mono text-[10px] text-stone-800 bg-stone-200 px-2 py-0.5 rounded font-bold">
                          #{msg.escalationTicket.ticketId}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-700 flex items-center justify-between">
                        <span>Queue: {msg.escalationTicket.assignedTeam}</span>
                        <span className="text-[10px] font-mono text-stone-600">Wait: {msg.escalationTicket.estimatedWaitTime}</span>
                      </div>
                    </div>
                  )}

                  {/* Related Order Card */}
                  {msg.relatedOrder && (
                    <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200 text-left space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#0B3B2C]" />
                          <span className="font-semibold text-stone-900 text-xs font-mono">Order #{msg.relatedOrder.id}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-800">
                          {msg.relatedOrder.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Tracking: <span className="font-mono text-stone-800">{msg.relatedOrder.trackingNumber}</span> · Est. Delivery: <span className="text-stone-800">{msg.relatedOrder.estimatedDelivery}</span>
                      </div>
                      <div className="pt-1">
                        <button
                          onClick={() => onViewOrder(msg.relatedOrder!)}
                          className="text-xs font-semibold text-[#0B3B2C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Order Breakdown</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Related Products Recommendations */}
                  {msg.relatedProducts && msg.relatedProducts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Verified Catalog Items:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.relatedProducts.map(p => (
                          <div key={p.id} className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white border border-stone-200">
                              <ProductVisual imageKey={p.imageKey} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-medium text-stone-900 text-xs truncate">{p.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-xs font-semibold text-[#0B3B2C]">${p.price.toFixed(2)}</span>
                                <span className="text-[10px] text-stone-500">★ {p.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onViewProduct(p)}
                                className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 text-[10px] font-medium rounded border border-stone-200 cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => onAddToCart(p)}
                                className="px-2 py-1 bg-[#0B3B2C] hover:bg-[#07241A] text-white text-[10px] font-medium rounded cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Chips */}
                  {msg.interactiveChips && msg.interactiveChips.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1.5">
                      {msg.interactiveChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => {
                            if (chip.action === 'send_prompt') {
                              handleSendMessage(chip.payload || chip.label);
                            } else if (chip.action === 'view_order') {
                              onViewOrder(chip.payload);
                            } else if (chip.action === 'view_product') {
                              onViewProduct(chip.payload);
                            } else if (chip.action === 'add_to_cart') {
                              onAddToCart(chip.payload);
                            }
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 cursor-pointer"
                        >
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up Questions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-1.5 mb-1 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.suggestedFollowUps.map((prompt, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[10px] text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 transition-colors cursor-pointer text-left font-normal"
                      >
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Developer Reasoning Trace Inspector (Hidden by default to protect internal reasoning) */}
                {msg.reasoningTrace && showDebugTrace && (
                  <div className="w-[92%] max-w-[92%] mt-2">
                    <ReasoningTraceInspector trace={msg.reasoningTrace} />
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-[9px] text-stone-400 mt-0.5 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-500 text-xs p-2 bg-white rounded-xl border border-stone-200 w-max shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-600 animate-pulse [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px] font-normal text-stone-600">
                  Verifying records...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ask about an order, return, or store policy..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-[#0B3B2C] focus:bg-white transition-colors text-stone-900"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="px-3.5 py-2.5 rounded-lg bg-[#0B3B2C] hover:bg-[#07241A] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5 px-1">
              <span>NovaMart Customer Support</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDebugTrace(!showDebugTrace)}
                  className="hover:text-stone-600 flex items-center gap-1 cursor-pointer font-mono text-[9px]"
                  title="Toggle Developer Trace View"
                >
                  <SlidersHorizontal className="w-2.5 h-2.5" />
                  <span>{showDebugTrace ? 'Hide Trace' : 'Dev Trace'}</span>
                </button>
                <span className="font-mono text-emerald-800 font-medium">
                  {currentUser ? 'Firebase' : 'Guest'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
