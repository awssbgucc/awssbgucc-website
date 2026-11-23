'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { audit } from '@/lib/platform/records';
import { applySwagMovement, swagItemSchema, swagMovementSchema } from '@/lib/validation/swag';

class SwagStockError extends Error {}

export async function recordSwagMovement(_state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(swagMovementSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { itemId, type, amount, reason, recipient } = parsed.data;

  try {
    const result = await db.$transaction(async (tx) => {
      const item = await tx.swagItem.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new SwagStockError('Swag item was not found.');
      }

      const calc = applySwagMovement({
        currentQty: item.quantity,
        receivedTotal: item.receivedTotal,
        distributedTotal: item.distributedTotal,
        type,
        amount,
      });

      if (!calc.ok) {
        throw new SwagStockError(calc.error);
      }

      await tx.swagItem.update({
        where: { id: item.id },
        data: {
          quantity: calc.nextQty,
          receivedTotal: calc.nextReceivedTotal,
          distributedTotal: calc.nextDistributedTotal,
          updatedBy: admin.email,
        },
      });

      await tx.swagMovement.create({
        data: {
          itemId: item.id,
          type,
          delta: calc.delta,
          beforeQty: item.quantity,
          afterQty: calc.nextQty,
          reason,
          recipient,
          actorEmail: admin.email,
        },
      });

      const signed = calc.delta > 0 ? `+${calc.delta}` : String(calc.delta);
      const detail = `${item.name}: ${item.quantity} to ${calc.nextQty} (${signed}), ${reason}${recipient ? ` (${recipient})` : ''}`;
      await audit(admin.email, `swag.${type.toLowerCase()}`, 'SwagItem', item.id, detail.slice(0, 300), tx);

      return item.id;
    });

    revalidatePath('/admin/swag');
    revalidatePath(`/admin/swag/${result}`);
    revalidatePath('/admin/audit');
    revalidatePath('/admin');
    return { saved: true };
  } catch (error) {
    if (error instanceof SwagStockError) {
      return { errors: { amount: error.message }, values: formValues(formData) };
    }
    throw error;
  }
}

export async function saveSwagItem(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(swagItemSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { name, slug, category, unitLabel, quantity, receivedTotal, lowStockThreshold, notes } = parsed.data;

  try {
    if (id) {
      await db.swagItem.update({
        where: { id },
        data: {
          name,
          slug,
          category,
          unitLabel,
          receivedTotal,
          lowStockThreshold,
          notes,
          updatedBy: admin.email,
        },
      });
      await audit(admin.email, 'swag.update', 'SwagItem', id, `${name} (${category})`);
    } else {
      const effectiveReceived = Math.max(receivedTotal, quantity);
      const created = await db.$transaction(async (tx) => {
        const item = await tx.swagItem.create({
          data: {
            name,
            slug,
            category,
            unitLabel,
            quantity,
            receivedTotal: effectiveReceived,
            lowStockThreshold,
            notes,
            updatedBy: admin.email,
          },
        });
        if (quantity > 0) {
          await tx.swagMovement.create({
            data: {
              itemId: item.id,
              type: 'SET_COUNT',
              delta: quantity,
              beforeQty: 0,
              afterQty: quantity,
              reason: 'Initial stock on item creation',
              actorEmail: admin.email,
            },
          });
        }
        await audit(admin.email, 'swag.create', 'SwagItem', item.id, `${name} (${quantity} ${unitLabel})`, tx);
        return item;
      });
      revalidatePath('/admin/swag');
      revalidatePath(`/admin/swag/${created.id}`);
      revalidatePath('/admin/audit');
      redirect('/admin/swag');
    }
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another swag item already uses this URL name.' }, values: formValues(formData) };
  }

  revalidatePath('/admin/swag');
  revalidatePath(`/admin/swag/${id}`);
  revalidatePath('/admin/audit');
  redirect('/admin/swag');
}

export async function deleteSwagItem(id: string) {
  const admin = await requireRole('ADMIN');
  const removed = await db.swagItem.delete({ where: { id } });
  await audit(admin.email, 'swag.delete', 'SwagItem', id, `${removed.name} (had ${removed.quantity} ${removed.unitLabel})`);
  revalidatePath('/admin/swag');
  revalidatePath('/admin/audit');
  redirect('/admin/swag');
}
