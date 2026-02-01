// components/admin/tabs/quotes/LineItemEditor.tsx
'use client';

import { Plus, Trash2, GripVertical, Package } from 'lucide-react';
import { LineItem, CatalogItem } from '@/schemas';
import { TAX_CONFIG, calculateLineItemTotal, formatCurrency, isExemptCategory } from '@/lib/tax-utils';

interface LineItemEditorProps {
  title: string;
  items: LineItem[];
  catalog: CatalogItem[];
  onChange: (items: LineItem[]) => void;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'None (Taxable)' },
  { value: 'web-design', label: 'Web Design' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'seo', label: 'SEO' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

export default function LineItemEditor({ title, items, catalog, onChange }: LineItemEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      {
        _key: crypto.randomUUID(),
        name: '',
        description: '',
        qty: 1,
        unitPrice: 0,
        discount: 0,
        category: '',
        total: 0,
      },
    ]);
  };

  const addFromCatalog = (catalogItem: CatalogItem) => {
    onChange([
      ...items,
      {
        _key: crypto.randomUUID(),
        name: catalogItem.name,
        description: catalogItem.description || '',
        qty: 1,
        unitPrice: catalogItem.unitPrice,
        discount: 0,
        category: catalogItem.category || '',
        total: catalogItem.unitPrice,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: unknown) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Recalculate total if qty, unitPrice, or discount changes
    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      item.total = calculateLineItemTotal(
        field === 'qty' ? (value as number) : item.qty,
        field === 'unitPrice' ? (value as number) : item.unitPrice,
        field === 'discount' ? (value as number) : item.discount
      );
    }

    newItems[index] = item;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold font-heading text-gray-900">{title}</h4>
        <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Catalog quick-add */}
      {catalog.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Quick add from catalog:</p>
          <div className="flex flex-wrap gap-2">
            {catalog.slice(0, 6).map((catalogItem) => (
              <button
                key={catalogItem._id}
                onClick={() => addFromCatalog(catalogItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
              >
                <Package className="w-3 h-3" />
                {catalogItem.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isExempt = isExemptCategory(item.category);
          return (
            <div key={item._key || index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-gray-400 mt-3 cursor-grab" />

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {/* Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Service or product name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                    />
                  </div>

                  {/* Qty */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Discount</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full pr-7 pl-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Second row: Description + Category */}
              <div className="mt-3 ml-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Additional details"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Category
                    {isExempt && (
                      <span className="ml-2 text-green-600">
                        ({TAX_CONFIG.DATA_PROCESSING_EXEMPTION}% tax exempt)
                      </span>
                    )}
                  </label>
                  <select
                    value={item.category || ''}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm bg-white"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={addItem}
        className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Line Item
      </button>

      {/* Subtotal */}
      {items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-600">Subtotal: </span>
            <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
