import { Product, Order, Review, StorePolicy, UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

export type CsvEntityType = 'products' | 'orders' | 'reviews' | 'policies' | 'customers';

export interface CsvImportResult {
  success: boolean;
  entityType: CsvEntityType;
  totalParsed: number;
  totalImported: number;
  errors: string[];
  data: any[];
}

export class CsvParserService {
  /**
   * Safe CSV line splitter handling quoted commas and escapes
   */
  public static parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }

  /**
   * Parse CSV content into structured Product objects
   */
  static parseProductCsv(csvText: string): Product[] {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
    const headers = this.parseCsvLine(headerLine, delimiter).map(h => h.trim().toLowerCase());

    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] !== undefined ? values[idx].trim() : '';
      });

      const id = row['id'] || row['product_id'] || row['sku'] || `prod-csv-${i}-${Date.now()}`;
      const name = row['name'] || row['title'] || row['product_name'] || `Product ${i}`;
      const category = (row['category'] || 'Electronics') as any;
      const price = parseFloat(row['price'] || row['sale_price'] || '0') || 29.99;
      const originalPrice = row['original_price'] || row['list_price'] || row['mrp'] 
        ? parseFloat(row['original_price'] || row['list_price'] || row['mrp']) 
        : undefined;
      const rating = parseFloat(row['rating'] || '4.8') || 4.8;
      const reviewCount = parseInt(row['reviews'] || row['review_count'] || '25', 10) || 25;
      const imageKey = row['image_key'] || row['imagekey'] || 'smartwatch';
      const imageUrl = row['image_url'] || row['imageurl'] || row['image'] || undefined;
      const tag = (row['tag'] || (price < 40 ? 'NEW' : undefined)) as any;
      const description = row['description'] || row['desc'] || `${name} - High quality lifestyle product.`;
      
      const featuresRaw = row['features'] || row['highlights'] || '';
      const features = featuresRaw 
        ? featuresRaw.split(/[|;]/).map(f => f.trim()).filter(Boolean)
        : ['100% Quality Guaranteed', 'Fast Nationwide Shipping', '30-Day Risk-Free Returns'];

      const inStock = row['in_stock'] !== undefined 
        ? (row['in_stock'].toLowerCase() === 'true' || row['in_stock'] === '1')
        : true;
      const stockCount = parseInt(row['stock'] || row['stock_count'] || '30', 10) || 30;

      products.push({
        id,
        name,
        category,
        price,
        originalPrice,
        rating,
        reviewCount,
        imageKey,
        imageUrl,
        tag,
        description,
        features,
        inStock,
        stockCount
      });
    }

    return products;
  }

  /**
   * Parse CSV content into structured Order objects
   */
  static parseOrderCsv(csvText: string): Order[] {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
    const headers = this.parseCsvLine(headerLine, delimiter).map(h => h.trim().toLowerCase());

    const orders: Order[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] !== undefined ? values[idx].trim() : '';
      });

      const id = row['id'] || row['order_id'] || `NM-${Math.floor(1000 + Math.random() * 9000)}`;
      const date = row['date'] || 'October 2, 2026';
      const status = (row['status'] || 'Delivered') as any;
      const subtotal = parseFloat(row['subtotal'] || row['amount'] || '89.99') || 89.99;
      const discount = parseFloat(row['discount'] || '0') || 0;
      const shipping = parseFloat(row['shipping'] || '0') || 0;
      const total = parseFloat(row['total'] || `${subtotal - discount + shipping}`) || subtotal;
      const paymentMethod = row['payment_method'] || 'Visa ending in 4242';
      const trackingNumber = row['tracking_number'] || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}US`;
      const estimatedDelivery = row['estimated_delivery'] || 'October 6, 2026';
      const userEmail = row['user_email'] || row['email'] || 'customer@example.com';
      const userId = row['user_id'] || 'usr-sample';

      // Parse items
      const rawItems = row['items'] || 'Essential Fleece Hoodie (1)|Leather Crossbody Bag (1)';
      const items = rawItems.split('|').map((itemStr, idx) => {
        const match = itemStr.match(/^(.*?)\s*\((\d+)\)$/);
        const productName = match ? match[1].trim() : itemStr.trim();
        const quantity = match ? parseInt(match[2], 10) : 1;
        return {
          productId: `prod-item-${idx}`,
          productName,
          price: Number((subtotal / (rawItems.split('|').length || 1)).toFixed(2)),
          quantity,
          imageKey: 'smartwatch'
        };
      });

      orders.push({
        id,
        userId,
        userEmail,
        date,
        status,
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod,
        trackingNumber,
        estimatedDelivery,
        shippingAddress: {
          name: row['shipping_name'] || 'Customer',
          street: row['street'] || '742 Evergreen Terrace',
          city: row['city'] || 'Springfield',
          state: row['state'] || 'OR',
          zip: row['zip'] || '97477',
          country: 'United States'
        },
        items,
        timeline: [
          { status: 'Order Placed', date: `${date} · 10:24 AM`, description: 'Payment verified', completed: true },
          { status: 'In Transit', date: `${date} · 3:15 PM`, description: 'Package sorted at hub', completed: status !== 'Processing' },
          { status: 'Delivered', date: estimatedDelivery, description: 'Doorstep dropoff confirmed', completed: status === 'Delivered' }
        ]
      });
    }

    return orders;
  }

  /**
   * Parse CSV content into structured Review objects
   */
  static parseReviewCsv(csvText: string): Review[] {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
    const headers = this.parseCsvLine(headerLine, delimiter).map(h => h.trim().toLowerCase());

    const reviews: Review[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] !== undefined ? values[idx].trim() : '';
      });

      const id = row['id'] || row['review_id'] || `rev-csv-${i}-${Date.now()}`;
      const productId = row['product_id'] || row['sku'] || 'prod-smartwatch-pro';
      const productName = row['product_name'] || 'Smart Watch Pro';
      const userName = row['user_name'] || row['author'] || 'Verified Buyer';
      const rating = parseFloat(row['rating'] || '5') || 5;
      const title = row['title'] || 'Excellent product!';
      const comment = row['comment'] || row['review_text'] || 'Very impressed with the build quality.';
      const date = row['date'] || 'October 1, 2026';
      const verified = row['verified'] !== undefined ? row['verified'].toLowerCase() === 'true' : true;
      const helpfulCount = parseInt(row['helpful_count'] || '0', 10) || 0;

      reviews.push({
        id,
        productId,
        productName,
        userName,
        rating,
        title,
        comment,
        date,
        verified,
        helpfulCount
      });
    }

    return reviews;
  }

  /**
   * Parse CSV content into StorePolicy objects
   */
  static parsePolicyCsv(csvText: string): StorePolicy[] {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
    const headers = this.parseCsvLine(headerLine, delimiter).map(h => h.trim().toLowerCase());

    const policies: StorePolicy[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] !== undefined ? values[idx].trim() : '';
      });

      const id = row['id'] || `policy-${i}`;
      const policyCode = row['code'] || row['policy_code'] || 'RETURNS_STANDARD';
      const name = row['name'] || '30-Day Standard Returns';
      const version = row['version'] || 'v2.4';
      const windowDays = parseInt(row['window_days'] || '30', 10) || 30;
      const summary = row['summary'] || 'Free returns within 30 days of delivery.';
      const rules = (row['rules'] || 'Items must be in original condition|Prepaid label provided').split(/[|;]/).map(r => r.trim());
      const exceptions = (row['exceptions'] || 'Final sale items|Hygiene products').split(/[|;]/).map(e => e.trim());

      policies.push({
        id,
        policyCode,
        name,
        version,
        windowDays,
        summary,
        rules,
        exceptions
      });
    }

    return policies;
  }

  /**
   * Batch import parsed items into Firestore based on Entity Type
   */
  static async importToFirestore(entityType: CsvEntityType, items: any[]): Promise<CsvImportResult> {
    const errors: string[] = [];
    let totalImported = 0;

    try {
      const chunkSize = 400;
      for (let i = 0; i < items.length; i += chunkSize) {
        const batch = writeBatch(db);
        const chunk = items.slice(i, i + chunkSize);

        chunk.forEach(item => {
          const docId = item.id || `doc-${Date.now()}`;
          const docRef = doc(db, entityType, docId);
          batch.set(docRef, {
            ...item,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });

        await batch.commit();
        totalImported += chunk.length;
      }

      return {
        success: true,
        entityType,
        totalParsed: items.length,
        totalImported,
        errors,
        data: items
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, entityType);
    }
  }

  static async importProductsToFirestore(products: Product[]): Promise<CsvImportResult> {
    return this.importToFirestore('products', products);
  }
}
