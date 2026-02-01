// lib/tax-utils.ts
// Tax calculation utilities for Texas-based business

export const TAX_CONFIG = {
  // Texas state + local tax rate (Austin area)
  DEFAULT_TAX_RATE: 8.25,
  // Data processing services exemption (Texas Tax Code §151.351)
  DATA_PROCESSING_EXEMPTION: 20,
  // Categories that qualify for data processing exemption
  EXEMPT_CATEGORIES: ['web-design', 'web-development', 'hosting', 'maintenance', 'seo'],
};

export interface LineItemWithTax {
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
  discount: number; // 0-100 percentage
  category?: string;
  isExempt?: boolean;
}

export interface TaxCalculation {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  exemptAmount: number;
  taxAmount: number;
  total: number;
  effectiveTaxRate: number;
}

/**
 * Calculate line item total after discount
 */
export function calculateLineItemTotal(
  qty: number,
  unitPrice: number,
  discount: number = 0
): number {
  const gross = qty * unitPrice;
  const discountAmount = gross * (discount / 100);
  return Math.round((gross - discountAmount) * 100) / 100;
}

/**
 * Check if a category qualifies for data processing exemption
 */
export function isExemptCategory(category?: string): boolean {
  if (!category) return false;
  return TAX_CONFIG.EXEMPT_CATEGORIES.includes(category.toLowerCase());
}

/**
 * Calculate tax for a list of line items
 */
export function calculateTax(
  items: LineItemWithTax[],
  taxRate: number = TAX_CONFIG.DEFAULT_TAX_RATE,
  applyExemption: boolean = true
): TaxCalculation {
  let subtotal = 0;
  let discountTotal = 0;
  let taxableAmount = 0;
  let exemptAmount = 0;

  for (const item of items) {
    const gross = item.qty * item.unitPrice;
    const discountAmount = gross * ((item.discount || 0) / 100);
    const netAmount = gross - discountAmount;

    subtotal += gross;
    discountTotal += discountAmount;

    // Check if item is exempt (either explicitly or by category)
    const isExempt = item.isExempt || (applyExemption && isExemptCategory(item.category));

    if (isExempt) {
      // Apply partial exemption for data processing
      const exemptPortion = netAmount * (TAX_CONFIG.DATA_PROCESSING_EXEMPTION / 100);
      exemptAmount += exemptPortion;
      taxableAmount += netAmount - exemptPortion;
    } else {
      taxableAmount += netAmount;
    }
  }

  const taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal - discountTotal + taxAmount) * 100) / 100;
  const effectiveTaxRate = subtotal > 0
    ? Math.round((taxAmount / (subtotal - discountTotal)) * 10000) / 100
    : 0;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    exemptAmount: Math.round(exemptAmount * 100) / 100,
    taxAmount,
    total,
    effectiveTaxRate,
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

/**
 * Parse a currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
