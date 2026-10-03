import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Package, ShoppingBag, ArrowRight, RotateCcw, AlertTriangle, LifeBuoy, Check, Layers, Cpu, Cloud, Trash2, LogIn } from 'lucide-react';
import { Order, Product } from '../types';
import { EnhancedChatMessage } from '../types/agentReasoning';
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
      text: "👋 Hi! I'm **Nova AI**, operating on a **5-Layer Reasoning Architecture** (Intent → Memory → Policy → Tools → Decision).\n\nAsk me anything! All chat history is saved to your individual Firebase account."
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from Firebase for the individual user
  useEffect(() => {
    let unsubscribe = () => {};

    if (currentUser?.uid) {
      // 1. Initial load from Firestore subcollection /users/{uid}/chat_messages
      ChatPersistenceService.loadChatHistory(currentUser.uid).then(history => {
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: 'welcome',
              sender: 'assistant',
              timestamp: 'Just now',
              text: `👋 Hi ${userProfile.name}! I'm **Nova AI**, your dedicated assistant operating on a **5-Layer Reasoning Engine**.\n\n✨ All our conversation turns and tool actions are permanently saved to your Firebase profile.`
            }
          ]);
        }
      });

      // 2. Real-time sync listener
      unsubscribe = ChatPersistenceService.subscribeToChat(currentUser.uid, (syncedMessages) => {
        if (syncedMessages && syncedMessages.length > 0) {
          setMessages(syncedMessages);
        }
      });
    } else {
      // Guest mode initial message
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          timestamp: 'Just now',
          text: "👋 Hi! I'm **Nova AI**, operating on a **5-Layer Reasoning Architecture** (Intent → Memory → Policy → Tools → Decision).\n\nAsk me anything! Sign in with Google to permanently save and sync your chat history in Firebase."
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

    // Save user message to Firebase
    if (currentUser?.uid) {
      ChatPersistenceService.saveChatMessage(currentUser.uid, userMsg);
    }

    try {
      setTimeout(async () => {
        // Execute the 5-Layer Reasoning Engine
        const assistantResponse = await LayeredAgentOrchestrator.processMessage(userMsg.text);
        setMessages(prev => [...prev, assistantResponse]);
        setIsTyping(false);

        // Save assistant response to Firebase
        if (currentUser?.uid) {
          ChatPersistenceService.saveChatMessage(currentUser.uid, assistantResponse);
        }
      }, 500);
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
          text: `👋 Chat cleared! How can I assist you today?`
        }
      ]);
    } finally {
      setIsClearing(false);
    }
  };

  // Quick Layer Testing Prompts
  const LAYER_PROMPTS = [
    { label: 'Multi-Intent', prompt: 'Where is my order #NM-8492 and can you suggest a watch under $100?' },
    { label: 'Policy Window (ACT)', prompt: 'I want to return my order #NM-8410' },
    { label: 'Ambiguity (ASK)', prompt: 'Can I return an item from my previous order?' },
    { label: 'Escalation (ESCALATE)', prompt: 'I received a damaged package and need to speak with a human supervisor' }
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-[#0B3B2C] to-[#125843] hover:from-[#06291E] hover:to-[#0B3B2C] text-white p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-950/30 flex items-center gap-3 border-2 border-white/20 transition-all hover:scale-105 cursor-pointer group animate-bounce [animation-duration:4s]"
          title="Open Nova AI Customer Support (Layered Reasoning System)"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#FF8149] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B3B2C] animate-pulse" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold leading-none flex items-center gap-1.5">
              <span>Nova AI Agent</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-mono">
                {currentUser ? 'Firebase' : 'Online'}
              </span>
            </div>
            <p className="text-[10px] text-stone-300 font-medium mt-0.5">5-Layer Reasoning Active</p>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden text-left animate-fadeIn">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0B3B2C] via-[#093527] to-[#06241B] px-5 py-3.5 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FF8149]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Nova AI Support</h3>
                  {currentUser ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>Firebase Synced</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-700/50 text-stone-300 text-[10px] font-mono font-bold">
                      Guest Mode
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-300">
                  {currentUser ? `Saving chats for ${userProfile.name}` : 'Intent ▸ Memory ▸ Policy ▸ Tools ▸ Decision'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                disabled={isClearing}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-rose-500/30 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guest Sign In Callout Bar if not signed in */}
          {!currentUser && (
            <div className="bg-amber-50 px-3.5 py-1.5 border-b border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
              <span>Sign in to store chat history in your Firebase account.</span>
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-1 font-bold text-[#0B3B2C] hover:underline cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-[#FF5B26]" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Layer Test Chips Bar */}
          <div className="px-3 py-2 bg-stone-100/90 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 shrink-0 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#FF5B26]" />
              Test:
            </span>
            {LAYER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                className="text-[10px] whitespace-nowrap bg-white hover:bg-emerald-50 hover:text-[#0B3B2C] hover:border-emerald-300 text-stone-700 font-semibold px-2.5 py-1 rounded-full border border-stone-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                title={item.prompt}
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
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#FF5B26] text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-stone-200/80 shadow-xs rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1">
                    {msg.text}
                  </div>

                  {/* Return Receipt Card (ACT Result) */}
                  {msg.returnReceipt && (
                    <div className="mt-3 p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <Check className="w-4 h-4 text-emerald-600" />
                          Return Authorized (RMA)
                        </span>
                        <span className="font-mono text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                          {msg.returnReceipt.returnId}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Items: <span className="font-semibold">{msg.returnReceipt.itemNames.join(', ')}</span>
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200">
                        <span>Expected Refund: <strong className="font-mono font-bold text-emerald-900">${msg.returnReceipt.refundAmount.toFixed(2)}</strong></span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{msg.returnReceipt.dropoffCarrier}</span>
                      </div>
                    </div>
                  )}

                  {/* Escalation Ticket Card (ESCALATE Result) */}
                  {msg.escalationTicket && (
                    <div className="mt-3 p-3 bg-rose-50/90 rounded-xl border border-rose-200 text-rose-950 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-rose-800">
                          <LifeBuoy className="w-4 h-4 text-rose-600" />
                          Escalated to Human Tier-1
                        </span>
                        <span className="font-mono text-[10px] text-rose-700 font-extrabold bg-rose-100 px-2 py-0.5 rounded">
                          #{msg.escalationTicket.ticketId}
                        </span>
                      </div>
                      <div className="text-[11px] text-rose-800 flex items-center justify-between">
                        <span>Queue: <strong>{msg.escalationTicket.assignedTeam}</strong></span>
                        <span className="text-[10px] text-rose-700 font-semibold font-mono">Wait: {msg.escalationTicket.estimatedWaitTime}</span>
                      </div>
                    </div>
                  )}

                  {/* Related Order Card */}
                  {msg.relatedOrder && (
                    <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-xs font-mono">Order #{msg.relatedOrder.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF8149]/20 text-[#0B3B2C]">
                          {msg.relatedOrder.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1">
                        Est. Delivery: {msg.relatedOrder.estimatedDelivery} · Total: ${msg.relatedOrder.total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => onViewOrder(msg.relatedOrder!)}
                        className="mt-2 text-xs font-bold text-[#FF5B26] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Order Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Related Products Recommendations */}
                  {msg.relatedProducts && msg.relatedProducts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                        Recommended Items:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.relatedProducts.map(p => (
                          <div key={p.id} className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white">
                              <ProductVisual imageKey={p.imageKey} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-bold text-stone-900 text-xs truncate">{p.name}</div>
                              <div className="font-mono text-xs font-bold text-[#FF5B26]">${p.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onViewProduct(p)}
                                className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 text-[10px] font-bold rounded-lg border border-stone-200 cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => onAddToCart(p)}
                                className="px-2 py-1 bg-[#0B3B2C] hover:bg-[#07241A] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5-Layer Reasoning Trace Inspector */}
                {msg.reasoningTrace && (
                  <div className="w-[90%] max-w-[90%]">
                    <ReasoningTraceInspector trace={msg.reasoningTrace} />
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-500 text-xs p-2 bg-white rounded-2xl border border-stone-200 w-max shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5B26] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B2C] animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px] font-medium text-stone-600">
                  Nova AI evaluating Intent, Policy & Tools...
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
                placeholder="Ask about orders, 30-day refunds, products..."
                className="flex-1 text-xs px-4 py-3 rounded-full bg-stone-100 border border-stone-200 focus:outline-none focus:border-[#0B3B2C] focus:bg-white transition-all text-stone-900"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-[#FF5B26] hover:bg-[#E04815] disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-orange-950/20 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5 px-2">
              <span>5-Layer Autonomous Architecture</span>
              <span className="font-mono text-emerald-700 font-semibold">
                {currentUser ? '✓ Firebase Synced' : 'Guest Mode'}
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
