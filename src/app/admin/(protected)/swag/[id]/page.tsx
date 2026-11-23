import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { SelectField, TextField } from '@/components/admin/fields';
import { SwagForm } from '@/components/admin/SwagForm';
import { PageHeader, Panel, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';
import { SWAG_MOVEMENT_LABELS, type SwagMovementTypeValue } from '@/lib/validation/swag';
import { deleteSwagItem, recordSwagMovement } from '../actions';

export const metadata: Metadata = { title: 'Edit swag item' };

type Props = { params: Promise<{ id: string }> };

const MOVEMENT_OPTIONS = (Object.keys(SWAG_MOVEMENT_LABELS) as SwagMovementTypeValue[]).map((value) => ({
  value,
  label: SWAG_MOVEMENT_LABELS[value],
}));

const MOVEMENT_BADGES: Record<SwagMovementTypeValue, { label: string; classes: string }> = {
  SET_COUNT: { label: 'Stocktake', classes: 'border-blue/35 bg-blue/10 text-blue' },
  RESTOCK: { label: 'Restock', classes: 'border-lime/40 bg-lime/10 text-lime' },
  HANDOUT: { label: 'Handout', classes: 'border-purple/35 bg-purple/10 text-purple' },
  ADJUSTMENT: { label: 'Write off', classes: 'border-danger/40 bg-danger/10 text-danger' },
};

export default async function EditSwagItemPage({ params }: Props) {
  const admin = await requireRole();
  const { id } = await params;

  const item = await db.swagItem.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  });

  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={item.name}
        description={`${item.category} - ${item.quantity} ${item.unitLabel} on hand (${item.receivedTotal} received, ${item.distributedTotal} handed out).`}
        secondaryAction={{ href: '/admin/swag', label: 'Back to swag' }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <SwagForm item={item} />

          <Panel title="Item change history" description="Every logged stock adjustment, restock and handout for this item.">
            {item.movements.length === 0 ? (
              <p className="text-sm text-text-muted">No stock changes recorded for this item yet.</p>
            ) : (
              <TableWrap>
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={TH}>When</th>
                      <th className={TH}>Who</th>
                      <th className={TH}>Type</th>
                      <th className={TH}>Change</th>
                      <th className={TH}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.movements.map((move) => {
                      const badge = MOVEMENT_BADGES[move.type];
                      const signed = move.delta > 0 ? `+${move.delta}` : String(move.delta);
                      return (
                        <tr key={move.id}>
                          <td className={`${TD} font-display text-xs whitespace-nowrap`}>
                            {formatDate(move.createdAt)} {formatTime(move.createdAt)}
                          </td>
                          <td className={`${TD} text-xs`}>{move.actorEmail}</td>
                          <td className={TD}>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className={`${TD} font-display text-xs whitespace-nowrap tabular-nums`}>
                            {move.beforeQty} to {move.afterQty} ({signed})
                          </td>
                          <td className={`${TD} text-xs`}>
                            <span className="text-text-strong">{move.reason}</span>
                            {move.recipient && <span className="block text-text-muted">For: {move.recipient}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Update stock count"
            description={`Currently ${item.quantity} ${item.unitLabel} on hand. Low stock alert triggers at ${item.lowStockThreshold}.`}
          >
            <AdminForm action={recordSwagMovement} framed={false} submitLabel="Apply stock change">
              <input type="hidden" name="itemId" value={item.id} />
              <SelectField name="type" label="Change type" options={MOVEMENT_OPTIONS} defaultValue="SET_COUNT" />
              <TextField name="amount" label="Quantity" type="number" defaultValue={item.quantity} />
              <TextField name="recipient" label="Event or recipient (optional)" />
              <TextField name="reason" label="Reason" help="Required for the audit log." />
            </AdminForm>
          </Panel>

          {admin.role === 'ADMIN' && (
            <Panel title="Danger zone" description="Delete this swag item and all of its historical movement rows.">
              <ConfirmAction
                action={deleteSwagItem.bind(null, item.id)}
                label="Delete swag item"
                question={`Delete "${item.name}" and its ${item.movements.length} logged movements?`}
              />
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
