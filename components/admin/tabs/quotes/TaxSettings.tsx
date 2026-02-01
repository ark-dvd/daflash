// components/admin/tabs/quotes/TaxSettings.tsx
'use client';

import { Info } from 'lucide-react';
import { LineItem } from '@/schemas';
import { TAX_CONFIG, calculateTax, calculateLineItemTotal, formatCurrency, formatPercentage, isExemptCategory } from '@/lib/tax-utils';

interface TaxSettingsProps {
  taxRate: number;
  applyExemption: boolean;
  onTaxRateChange: (rate: number) => void;
  onApplyExemptionChange: (apply: boolean) => void;
  oneTimeItems: LineItem[];
  recurringItems: LineItem[];
}

export default function TaxSettings({
  taxRate,
  applyExemption,
  onTaxRateChange,
  onApplyExemptionChange,
  oneTimeItems,
  recurringItems,
}: TaxSettingsProps) {
  const allItems = [...oneTimeItems, ...recurringItems];

  // Calculate tax preview
  const taxCalc = calculateTax(
    allItems.map((item) => ({
      ...item,
      total: calculateLineItemTotal(item.qty, item.unitPrice, item.discount),
    })),
    taxRate,
    applyExemption
  );

  // Count exempt items
  const exemptItemCount = allItems.filter((item) => isExemptCategory(item.category)).length;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold font-heading text-gray-900">Tax Settings</h3>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Texas Tax Information</p>
          <p>
            The default tax rate of {TAX_CONFIG.DEFAULT_TAX_RATE}% includes Texas state sales tax plus local taxes for the Austin area.
            Data processing services (web design, development, hosting, etc.) qualify for a{' '}
            {TAX_CONFIG.DATA_PROCESSING_EXEMPTION}% exemption under Texas Tax Code §151.351.
          </p>
        </div>
      </div>

      {/* Tax Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => onTaxRateChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
            className="w-32 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
          />
          <button
            onClick={() => onTaxRateChange(TAX_CONFIG.DEFAULT_TAX_RATE)}
            className="text-sm text-primary hover:underline"
          >
            Reset to default ({TAX_CONFIG.DEFAULT_TAX_RATE}%)
          </button>
        </div>
      </div>

      {/* Data Processing Exemption */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={applyExemption}
            onChange={(e) => onApplyExemptionChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              Apply Data Processing Exemption ({TAX_CONFIG.DATA_PROCESSING_EXEMPTION}%)
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Reduces taxable amount for qualifying services (web design, development, hosting, maintenance, SEO)
            </p>
          </div>
        </label>
      </div>

      {/* Tax Preview */}
      {allItems.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3">Tax Calculation Preview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Subtotal</span>
              <span className="text-gray-900">{formatCurrency(taxCalc.subtotal)}</span>
            </div>
            {taxCalc.discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Line Discounts</span>
                <span>-{formatCurrency(taxCalc.discountTotal)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-600">Net Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(taxCalc.subtotal - taxCalc.discountTotal)}
              </span>
            </div>
            {applyExemption && exemptItemCount > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Taxable Amount</span>
                  <span>{formatCurrency(taxCalc.taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Exempt Amount ({exemptItemCount} item{exemptItemCount !== 1 ? 's' : ''})</span>
                  <span>{formatCurrency(taxCalc.exemptAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">
                Tax ({formatPercentage(taxRate)})
                {applyExemption && taxCalc.effectiveTaxRate < taxRate && (
                  <span className="text-green-600 ml-1">
                    (effective: {formatPercentage(taxCalc.effectiveTaxRate)})
                  </span>
                )}
              </span>
              <span className="text-gray-900">{formatCurrency(taxCalc.taxAmount)}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(taxCalc.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Exempt Categories Info */}
      <div className="text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-2">Qualifying Categories for Exemption:</p>
        <ul className="list-disc list-inside space-y-1">
          {TAX_CONFIG.EXEMPT_CATEGORIES.map((cat) => (
            <li key={cat} className="capitalize">{cat.replace('-', ' ')}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
