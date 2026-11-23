'use client';

import type { SwagItem } from '@/generated/prisma/client';
import { saveSwagItem } from '@/app/admin/(protected)/swag/actions';
import { AdminForm } from '@/components/admin/AdminForm';
import { SelectField, TextArea, TextField } from '@/components/admin/fields';
import { SWAG_CATEGORIES } from '@/lib/validation/swag';

const CATEGORY_OPTIONS = SWAG_CATEGORIES.map((category) => ({ value: category, label: category }));

export function SwagForm({ item }: { item?: SwagItem }) {
  return (
    <AdminForm action={saveSwagItem.bind(null, item?.id ?? null)}>
      <TextField name="name" label="Item name" defaultValue={item?.name} />
      <TextField name="slug" label="URL name" defaultValue={item?.slug} help="Leave blank to derive automatically from the item name." />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="category" label="Category" options={CATEGORY_OPTIONS} defaultValue={item?.category ?? 'Other'} />
        <TextField name="unitLabel" label="Unit label" defaultValue={item?.unitLabel ?? 'pcs'} help="For example pcs, kits or boxes." />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {item ? (
          <input type="hidden" name="quantity" value={item.quantity} />
        ) : (
          <TextField name="quantity" label="Starting quantity" type="number" defaultValue={0} />
        )}
        <TextField
          name="receivedTotal"
          label="Total received from AWS"
          type="number"
          defaultValue={item?.receivedTotal ?? 0}
          help="Historical sum from swag shipments."
        />
        <TextField
          name="lowStockThreshold"
          label="Low stock alert"
          type="number"
          defaultValue={item?.lowStockThreshold ?? 3}
          help="Warn when stock reaches this number or lower."
        />
      </div>
      <TextArea name="notes" label="Notes" rows={2} defaultValue={item?.notes} help="Optional point value, box count or order breakdown." />
    </AdminForm>
  );
}
