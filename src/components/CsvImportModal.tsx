import React, { useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle, Database, ArrowRight, Download, Package, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { Product, Order, Review, StorePolicy } from '../types';
import { CsvParserService, CsvEntityType } from '../services/csvParserService';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsImported: (products: Product[]) => void;
  onOrdersImported?: (orders: Order[]) => void;
  onReviewsImported?: (reviews: Review[]) => void;
}

const SAMPLE_TEMPLATES: Record<CsvEntityType, { sample: string; description: string; headers: string[] }> = {
  products: {
    description: 'Product catalog with prices, stock counts, ratings, and bullet features',
    headers: ['id', 'name', 'category', 'price', 'original_price', 'rating', 'reviews', 'tag', 'image_url', 'description', 'features', 'stock_count'],
    sample: `id,name,category,price,original_price,rating,reviews,tag,image_url,description,features,stock_count
prod-sample-1,Artisan Silk Robe,Women,79.99,120.00,4.9,84,NEW,https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80,Luxurious 100% mulberry silk robe with hand-finished french seams.,100% Mulberry Silk|Breathable & hypoallergenic|Detachable tie belt,24
prod-sample-2,Minimalist Ceramic Mug,Home & Living,22.50,30.00,4.8,110,BESTSELLER,https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80,Matte glaze stoneware coffee mug hand-thrown in Vermont.,Handcrafted stoneware|Microwave & dishwasher safe|12oz volume,50
prod-sample-3,Precision Mechanical Keyboard,Electronics,139.99,189.99,5.0,240,50% OFF,https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80,Hot-swappable tactile mechanical keyboard with CNC aluminum chassis.,Custom lubricated switches|Wireless Bluetooth 5.2|Per-key RGB lighting,18`
  },
  orders: {
    description: 'Customer order transactions, tracking numbers, line items, and delivery status',
    headers: ['id', 'date', 'status', 'subtotal', 'shipping', 'total', 'payment_method', 'tracking_number', 'estimated_delivery', 'items', 'user_email', 'shipping_name', 'street', 'city', 'state', 'zip'],
    sample: `id,date,status,subtotal,shipping,total,payment_method,tracking_number,estimated_delivery,items,user_email,shipping_name,street,city,state,zip
NM-9812,October 1 2026,In Transit,89.99,0,89.99,Apple Pay,TRK-981230491US,October 4 2026,Artisan Silk Robe (1),raturiaryan147@gmail.com,Aryan Raturi,742 Evergreen Terrace,Springfield,OR,97477
NM-7621,September 28 2026,Delivered,45.00,0,45.00,Visa ending in 4242,TRK-762109482US,October 1 2026,Minimalist Ceramic Mug (2),raturiaryan147@gmail.com,Aryan Raturi,742 Evergreen Terrace,Springfield,OR,97477`
  },
  reviews: {
    description: 'Product reviews, star ratings (1-5), verified status, and customer comments',
    headers: ['id', 'product_id', 'product_name', 'user_name', 'rating', 'title', 'comment', 'date', 'verified', 'helpful_count'],
    sample: `id,product_id,product_name,user_name,rating,title,comment,date,verified,helpful_count
rev-sample-1,prod-smartwatch-pro,Smart Watch Pro,Elena Vance,5,Life changing fitness companion,The battery life easily lasts 7 days and GPS accuracy during runs is phenomenal.,September 29 2026,true,14
rev-sample-2,prod-leather-bag,Structured Leather Handbag,Maya Lin,5,Pure Italian leather quality,Hardware has a solid brass weight. Holds my 13-inch laptop and looks stunning.,September 25 2026,true,9`
  },
  policies: {
    description: 'Store operating policies used by Nova AI Policy Layer for return windows & SLAs',
    headers: ['id', 'code', 'name', 'version', 'window_days', 'summary', 'rules', 'exceptions'],
    sample: `id,code,name,version,window_days,summary,rules,exceptions
pol-returns,RETURNS_STANDARD,30-Day Hassle-Free Returns,v2.4,30,Full refund within 30 days of delivery with free digital prepaid shipping label.,Items must be unworn and in original packaging|Prepaid digital return label sent by email|Refund issued within 48h of scan,Final sale clearance items|Worn hygiene apparel
pol-price,PRICE_MATCH_GUARANTEE,7-Day Price Adjustment,v1.2,7,Automatic refund of difference if item price drops within 7 days of purchase.,Applies to official NovaMart promotions|Must contact support within 7 days of order,Flash deals under 2 hours`
  },
  customers: {
    description: 'Customer profiles, contact information, loyalty points, and membership tiers',
    headers: ['uid', 'name', 'email', 'phone', 'membership_tier', 'reward_points', 'member_since'],
    sample: `uid,name,email,phone,membership_tier,reward_points,member_since
usr-aryan-147,Aryan Raturi,raturiaryan147@gmail.com,+1 (555) 382-9102,Nova Gold Member,450,October 2026
usr-customer-2,Sarah Connor,sarah.connor@example.com,+1 (555) 918-2041,Nova Platinum Member,890,August 2026`
  }
};

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onProductsImported,
  onOrdersImported,
  onReviewsImported
}) => {
  if (!isOpen) return null;

  const [activeEntityType, setActiveEntityType] = useState<CsvEntityType>('products');
  const [csvContent, setCsvContent] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; count: number; entity: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEntityChange = (entity: CsvEntityType) => {
    setActiveEntityType(entity);
    setCsvContent('');
    setParsedData([]);
    setErrorMsg('');
    setImportStatus(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      processCsv(text, activeEntityType);
    };
    reader.readAsText(file);
  };

  const processCsv = (text: string, entity: CsvEntityType) => {
    setErrorMsg('');
    try {
      let items: any[] = [];
      if (entity === 'products') {
        items = CsvParserService.parseProductCsv(text);
      } else if (entity === 'orders') {
        items = CsvParserService.parseOrderCsv(text);
      } else if (entity === 'reviews') {
        items = CsvParserService.parseReviewCsv(text);
      } else if (entity === 'policies') {
        items = CsvParserService.parsePolicyCsv(text);
      } else {
        items = CsvParserService.parseProductCsv(text);
      }

      if (items.length === 0) {
        setErrorMsg(`No valid ${entity} rows found. Please check column headers.`);
        setParsedData([]);
      } else {
        setParsedData(items);
      }
    } catch (err: any) {
      setErrorMsg(`Parsing error: ${err.message || 'Invalid CSV syntax'}`);
    }
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvContent(text);
    if (text.trim().length > 15) {
      processCsv(text, activeEntityType);
    } else {
      setParsedData([]);
    }
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_TEMPLATES[activeEntityType].sample;
    setCsvContent(sample);
    processCsv(sample, activeEntityType);
  };

  const handleDownloadTemplate = () => {
    const sample = SAMPLE_TEMPLATES[activeEntityType].sample;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `novamart_${activeEntityType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;
    setIsImporting(true);
    setErrorMsg('');

    try {
      const result = await CsvParserService.importToFirestore(activeEntityType, parsedData);
      setImportStatus({ success: true, count: result.totalImported, entity: activeEntityType });

      if (activeEntityType === 'products') {
        onProductsImported(parsedData as Product[]);
      } else if (activeEntityType === 'orders' && onOrdersImported) {
        onOrdersImported(parsedData as Order[]);
      } else if (activeEntityType === 'reviews' && onReviewsImported) {
        onReviewsImported(parsedData as Review[]);
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(`Firestore Import Error: ${err.message || 'Permission or schema error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-stone-100 p-6 sm:p-8 text-left relative animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0B3B2C] flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5 text-[#0B3B2C]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B3B2C]">Firebase CSV Data Importer</h3>
              <p className="text-xs text-stone-500">Import your .csv files directly into Firestore collections for app and AI context</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Entity Type Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 pb-2">
          {(['products', 'orders', 'reviews', 'policies'] as CsvEntityType[]).map(entity => {
            const icons = {
              products: <Package className="w-3.5 h-3.5" />,
              orders: <ShoppingBag className="w-3.5 h-3.5" />,
              reviews: <Star className="w-3.5 h-3.5" />,
              policies: <ShieldCheck className="w-3.5 h-3.5" />,
              customers: <FileText className="w-3.5 h-3.5" />
            };
            return (
              <button
                key={entity}
                type="button"
                onClick={() => handleEntityChange(entity)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeEntityType === entity
                    ? 'bg-[#0B3B2C] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {icons[entity]}
                <span>{entity}.csv</span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-stone-500 mb-3">
          {SAMPLE_TEMPLATES[activeEntityType].description}. Maps to Firestore collection <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-emerald-800">/{activeEntityType}</code>.
        </p>

        {importStatus?.success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">Data Committed to Firebase!</h4>
            <p className="text-xs text-stone-500">
              Successfully wrote {importStatus.count} records to Firestore collection <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">/{importStatus.entity}</code>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B3B2C] hover:bg-[#07241A] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#FF8149]" />
                  <span>Choose {activeEntityType}.csv File</span>
                  <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
                  title="Download starter CSV template"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Template</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-[#0B3B2C] hover:underline cursor-pointer"
              >
                Load Sample {activeEntityType} CSV
              </button>
            </div>

            {/* Paste Box */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">
                  Or Paste Raw CSV Content:
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  Expected: {SAMPLE_TEMPLATES[activeEntityType].headers.slice(0, 5).join(', ')}...
                </span>
              </div>
              <textarea
                value={csvContent}
                onChange={handlePasteChange}
                placeholder={`${SAMPLE_TEMPLATES[activeEntityType].headers.join(',')}\n...`}
                rows={5}
                className="w-full bg-stone-50 font-mono text-[11px] p-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-[#0B3B2C] resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Preview of Parsed Records */}
            {parsedData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>Parsed Records ({parsedData.length} items ready to commit)</span>
                  <span className="text-emerald-700 font-mono text-[11px]">✓ Schema Validated</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-stone-50 rounded-2xl border border-stone-200">
                  {parsedData.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded-xl border border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-stone-900 truncate max-w-[220px]">
                          {item.name || item.title || item.id}
                        </span>
                        {item.category && (
                          <span className="text-[10px] text-stone-400">({item.category})</span>
                        )}
                        {item.status && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#FF5B26]">
                        {item.price !== undefined ? `$${item.price.toFixed(2)}` : (item.total !== undefined ? `$${item.total.toFixed(2)}` : (item.rating ? `${item.rating}★` : item.id))}
                      </span>
                    </div>
                  ))}
                  {parsedData.length > 5 && (
                    <p className="text-[10px] text-stone-400 text-center py-1">
                      + {parsedData.length - 5} more records ready
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedData.length === 0 || isImporting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B3B2C] hover:bg-[#07241A] disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/20"
              >
                {isImporting ? (
                  <span>Syncing to Firebase Firestore...</span>
                ) : (
                  <>
                    <span>Commit {parsedData.length} Records to Firestore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
