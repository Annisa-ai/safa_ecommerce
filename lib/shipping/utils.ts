export const SHIPPING_WEIGHT_PER_ITEM_GRAMS = 500
export const SHIPPING_MIN_WEIGHT_GRAMS = 1000

export function estimateCartWeightGrams(quantities: number[]) {
  const total = quantities.reduce((sum, qty) => sum + qty * SHIPPING_WEIGHT_PER_ITEM_GRAMS, 0)
  return Math.max(SHIPPING_MIN_WEIGHT_GRAMS, total)
}
