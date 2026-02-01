// components/admin/tabs/quotes/TaxSettings.tsx
'use client';

import { Info } from 'lucide-react';
import { LineItem } from '@/schemas';
import { DEFAULT_TAX_SETTINGS, calculateTax, calculateItemTotal, formatCurrency, formatPercentage, TaxSettings } from '@/lib/tax-utils';

interface TaxSettingsPanelProps {
  taxEnabled: boolean;
  taxRate: number;
  texasExemptionEnabled: boolean;
  onTaxEnabledChange: (enabled: boolean) => void;
  onTaxRateChange: (rate: number) => void;
  onTexasExemptionEnabledChange: (enabled: boolean) => void;
  oneTimeItems: LineItem[];
  recurringItems: LineItem[];
}

export default function TaxSettingsPanel({
  taxEnabled,
  taxRate,
  texasExemptionEnabled,
  onTaxEnabledChange,
  onTaxRateChange,
  onTexasExemptionEnabledChange,
  oneTimeItems,
  recurringItems,
}: TaxSettingsPanelProps) {
  const allItems = [...oneTimeItems, ...recurringItems];

  // Calculate tax preview
  const taxSettings: TaxSettings = { taxEnabled, taxRate, texasExemptionEnabled };
  const processedItems = allItems.map((item) => ({
    ...item,
    total: calculateItemTotal(item),
  }));
  const taxCalc = calculateTax(processedItems, taxSettings);

  // Count exempt items
  const exemptItemCount = allItems.filter((item) => item.isTaxExempt).length;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold font-heading text-gray-900">Tax Settings</h3>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Texas Tax Information</p>
          <p>
            The default tax rate of {DEFAULT_TAX_SETTINGS.taxRate}% includes Texas state sales tax plus local taxes for the Austin area.
            Data processing services qualify for a 20% exemption under Texas Tax Code §151.351 — meaning only 80% of the amount is taxable.
          </p>
        </div>
      </div>

      {/* Tax Enabled Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => onTaxEnabledChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Enable Tax</span>
            <p className="text-xs text-gray-500 mt-0.5">Apply sales tax to taxable items</p>
          </div>
        </label>
      </div>

      {taxEnabled && (
        <>
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
                onClick={() => onTaxRateChange(DEFAULT_TAX_SETTINGS.taxRate)}
                className="text-sm text-primary hover:underline"
              >
                Reset to default ({DEFAULT_TAX_SETTINGS.taxRate}%)
              </button>
            </div>
          </div>

          {/* Texas Data Processing Exemption */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={texasExemptionEnabled}
                onChange={(e) => onTexasExemptionEnabledChange(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Apply Texas Data Processing Exemption (20%)
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tax is calculated on 80% of the taxable amount (items not marked as Tax Exempt)
                </p>
              </div>
            </label>
          </div>
        </>
      )}

      {/* Tax Preview */}
      {allItems.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3">Tax Calculation Preview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal (after discounts)</span>
              <span className="text-gray-900">{formatCurrency(taxCalc.subtotal)}</span>
            </div>
            {exemptItemCount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>
                  Tax Exempt Items ({exemptItemCount} item{exemptItemCount !== 1 ? 's' : ''})
                </span>
                <span>No tax</span>
              </div>
            )}
            {taxEnabled && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Taxable Amount
                    {texasExemptionEnabled && ' (80% of non-exempt items)'}
                  </span>
                  <span>{formatCurrency(taxCalc.taxableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tax ({formatPercentage(taxRate)})
                  </span>
                  <span className="text-gray-900">{formatCurrency(taxCalc.taxAmount)}</span>
                </div>
              </>
            )}
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Grand Total</span>
              <span>{formatCurrency(taxCalc.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tax Exempt Items Info */}
      <div className="text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-2">Per-Item Tax Exemption:</p>
        <p>
          Mark individual line items as &quot;Tax Exempt&quot; in the Items step to exclude them from tax calculations entirely.
          This is useful for items that are not subject to sales tax (e.g., certain services, resale items, or tax-exempt customers).
        </p>
      </div>
    </div>
  );
}
