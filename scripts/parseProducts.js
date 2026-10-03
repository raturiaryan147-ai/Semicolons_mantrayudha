import fs from 'fs';

const csvContent = fs.readFileSync('public/products_catalog.csv', 'utf8');

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

const lines = csvContent.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = parseCsvLine(lines[0]).map(h => h.trim());

const IMAGE_MAP = {
  'Accessories': {
    'Charger': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    'Webcam': 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
    'Memory Card': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    'Power Bank': 'https://images.unsplash.com/photo-1609592424362-e932ba61b17b?auto=format&fit=crop&w=600&q=80',
    'Cable': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'Laptop Bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    'Phone Case': 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80',
    'USB Hub': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
    'Screen Protector': 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80',
    'Laptop Stand': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
  },
  'Cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
  'Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  'Gaming': 'https://images.unsplash.com/photo-1612287232230-0eb21fb94ff8?auto=format&fit=crop&w=600&q=80',
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'Keyboards': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  'Mice': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
  'Monitors': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'Networking': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
  'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  'Smartwatches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  'Speakers': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
  'Tablets': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=600&q=80'
};

function getImageUrl(category, subcategory) {
  const catObj = IMAGE_MAP[category];
  if (catObj && typeof catObj === 'object' && catObj[subcategory]) {
    return catObj[subcategory];
  }
  if (typeof catObj === 'string') return catObj;
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
}

const products = [];

for (let i = 1; i < lines.length; i++) {
  const vals = parseCsvLine(lines[i]);
  if (vals.length < 5) continue;
  const row = {};
  headers.forEach((h, idx) => {
    row[h] = vals[idx] !== undefined ? vals[idx].trim() : '';
  });

  const price = parseFloat(row.price) || 999;
  const mrp = parseFloat(row.mrp) || (price * 1.2);
  const discountPercent = parseFloat(row.discount_percent) || 0;
  const stockCount = parseInt(row.stock_quantity, 10) || 0;
  const inStock = row.status !== 'out_of_stock' && row.status !== 'discontinued' && stockCount > 0;
  const rating = parseFloat(row.rating) || 4.2;
  const reviewCount = parseInt(row.review_count, 10) || 0;
  const warrantyMonths = parseInt(row.warranty_months, 10) || 12;
  const returnable = row.returnable === 'true';
  const replacementAvailable = row.replacement_available === 'true';
  const weightKg = parseFloat(row.weight_kg) || 0.5;

  let tag = undefined;
  if (discountPercent >= 35) tag = '50% OFF';
  else if (rating >= 4.5 && reviewCount >= 15) tag = 'BESTSELLER';
  else if (stockCount <= 5 && stockCount > 0) tag = 'LIMITED';
  else if (parseInt(row.product_id.replace('PROD-', ''), 10) <= 20) tag = 'NEW';

  products.push({
    id: row.product_id,
    sku: row.sku,
    name: row.product_name,
    category: row.category,
    subcategory: row.subcategory,
    brand: row.brand,
    price: price,
    originalPrice: mrp,
    mrp: mrp,
    discountPercent: discountPercent,
    rating: rating,
    reviewCount: reviewCount,
    imageKey: row.category.toLowerCase(),
    imageUrl: getImageUrl(row.category, row.subcategory),
    tag: tag,
    description: row.description,
    features: [
      `Brand: ${row.brand} · Subcategory: ${row.subcategory}`,
      `Warranty: ${warrantyMonths} Months Manufacturer Guarantee`,
      returnable ? '30-Day Hassle-Free Returns Authorized' : 'Standard Return Guidelines Apply',
      replacementAvailable ? '7-Day Free Replacement Coverage' : 'Service Center Repair Coverage'
    ],
    inStock: inStock,
    stockCount: stockCount,
    warrantyMonths: warrantyMonths,
    returnable: returnable,
    replacementAvailable: replacementAvailable,
    weightKg: weightKg,
    color: row.color,
    status: row.status
  });
}

const fileHeader = `import { Product } from '../types';\n\nexport const IMPORTED_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n`;

fs.writeFileSync('src/data/importedProducts.ts', fileHeader, 'utf8');
console.log(`Successfully generated ${products.length} products in src/data/importedProducts.ts`);
