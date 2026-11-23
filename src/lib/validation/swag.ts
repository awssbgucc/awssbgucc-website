import { z } from 'zod';
import { optionalText, requiredText, resolveSlug } from './shared';

export const SWAG_CATEGORIES = [
  'Apparel',
  'Core Team Kit',
  'Drinkware',
  'Stationery',
  'Bags',
  'Accessories',
  'Event Gear',
  'Other',
] as const;

export const SWAG_MOVEMENT_LABELS = {
  SET_COUNT: 'Set exact count (stocktake)',
  RESTOCK: 'Add stock received',
  HANDOUT: 'Hand out or distribute',
  ADJUSTMENT: 'Write off (damaged or lost)',
} as const;

export type SwagMovementTypeValue = keyof typeof SWAG_MOVEMENT_LABELS;

const nonNegativeInt = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), `${label} must be a whole number zero or above.`)
    .transform(Number);

export const swagItemSchema = z
  .object({
    name: requiredText('Item name').refine((v) => v.length <= 120, 'Item name must be 120 characters or fewer.'),
    slug: z.string().trim().max(120).default(''),
    category: z.enum(SWAG_CATEGORIES),
    unitLabel: requiredText('Unit label').refine((v) => v.length <= 24, 'Unit label must be 24 characters or fewer.'),
    quantity: nonNegativeInt('Starting quantity'),
    receivedTotal: nonNegativeInt('Total received'),
    lowStockThreshold: nonNegativeInt('Low stock alert'),
    notes: optionalText.refine((v) => v === null || v.length <= 280, 'Notes must be 280 characters or fewer.'),
  })
  .transform((data) => ({ ...data, slug: resolveSlug(data.slug, data.name) }))
  .refine((data) => data.slug.length > 0, { message: 'Enter an item name or URL name.', path: ['slug'] });

export const swagMovementSchema = z
  .object({
    itemId: z.string().trim().min(1, 'Pick a swag item.'),
    type: z.enum(['SET_COUNT', 'RESTOCK', 'HANDOUT', 'ADJUSTMENT']),
    amount: nonNegativeInt('Quantity'),
    reason: requiredText('Reason').refine((v) => v.length <= 200, 'Reason must be 200 characters or fewer.'),
    recipient: optionalText.refine((v) => v === null || v.length <= 120, 'Recipient must be 120 characters or fewer.'),
  })
  .refine((data) => data.type === 'SET_COUNT' || data.amount >= 1, {
    message: 'Enter at least 1 unit for this movement.',
    path: ['amount'],
  });

export type SwagCalculationResult =
  | { ok: true; nextQty: number; delta: number; nextReceivedTotal: number; nextDistributedTotal: number }
  | { ok: false; error: string };

export function applySwagMovement({
  currentQty,
  receivedTotal,
  distributedTotal,
  type,
  amount,
}: {
  currentQty: number;
  receivedTotal: number;
  distributedTotal: number;
  type: SwagMovementTypeValue;
  amount: number;
}): SwagCalculationResult {
  if (!Number.isInteger(amount) || amount < 0) {
    return { ok: false, error: 'Quantity must be a whole number zero or above.' };
  }

  if (type === 'SET_COUNT') {
    return {
      ok: true,
      nextQty: amount,
      delta: amount - currentQty,
      nextReceivedTotal: receivedTotal,
      nextDistributedTotal: distributedTotal,
    };
  }

  if (amount < 1) {
    return { ok: false, error: 'Enter at least 1 unit for this movement.' };
  }

  if (type === 'RESTOCK') {
    return {
      ok: true,
      nextQty: currentQty + amount,
      delta: amount,
      nextReceivedTotal: receivedTotal + amount,
      nextDistributedTotal: distributedTotal,
    };
  }

  if (amount > currentQty) {
    return { ok: false, error: `Only ${currentQty} on hand.` };
  }

  if (type === 'HANDOUT') {
    return {
      ok: true,
      nextQty: currentQty - amount,
      delta: -amount,
      nextReceivedTotal: receivedTotal,
      nextDistributedTotal: distributedTotal + amount,
    };
  }

  return {
    ok: true,
    nextQty: currentQty - amount,
    delta: -amount,
    nextReceivedTotal: receivedTotal,
    nextDistributedTotal: distributedTotal,
  };
}
