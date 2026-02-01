// lib/tax-utils.ts
// Tax calculation utilities for Texas-based business

import { LineItem } from '@/schemas';

export interface TaxSettings {
  taxEnabled: boolean;
  taxRate: number;              // e.g., 8.25
  texasExemptionEnabled: boolean; // When true, tax on 80% of taxable amount only
}

export interface TaxCalculation {
  subtotal: number;      // Sum of all item totals (after discounts, before tax)
  taxableAmount: number; // Amount subject to tax (after exemptions)
  taxAmount: number;     // Total tax
  grandTotal: number;    // subtotal + taxAmount
}

// Default Texas tax settings (Cedar Park TX: 6.25% state + 2.00% city)
export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxEnabled: true,
  taxRate: 8.25,
  texasExemptionEnabled: true,
};

/**
 * Calculate the total for a single line item (after discount).
 * total = unitPrice × qty × (1 - discount / 100)
 */
export function calculateItemTotal(item: { unitPrice: number; qty: number; discount?: number }): number {
  const discount = item.discount || 0;
  return Math.round(item.unitPrice * item.qty * (1 - discount / 100) * 100) / 100;
}

/**
 * Calculate tax for a list of line items.
 *
 * For each item:
 *   afterDiscount = unitPrice × qty × (1 - discount%)
 *   if item is tax-exempt → taxable = 0
 *   else if Texas 20% exemption enabled → taxable = afterDiscount × 0.80
 *   else → taxable = afterDiscount
 *   itemTax = taxable × (taxRate / 100)
 *
 * Total = sum(afterDiscount) + sum(itemTax)
 */
export function calculateTax(items: LineItem[], settings: TaxSettings): TaxCalculation {
  let subtotal = 0;
  let taxableAmount = 0;

  for (const item of items) {
    const afterDiscount = calculateItemTotal(item);
    subtotal += afterDiscount;

    if (settings.taxEnabled && !item.isTaxExempt) {
      const exemptionMultiplier = settings.texasExemptionEnabled ? 0.80 : 1.0;
      taxableAmount += afterDiscount * exemptionMultiplier;
    }
  }

  const taxAmount = settings.taxEnabled
    ? Math.round(taxableAmount * (settings.taxRate / 100) * 100) / 100
    : 0;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount,
    grandTotal: Math.round((subtotal + taxAmount) * 100) / 100,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
