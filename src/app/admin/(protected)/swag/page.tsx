import { AlertTriangle, ArrowRight, Gift, Layers, Package, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminForm } from '@/components/admin/AdminForm';
import { SelectField, TextField } from '@/components/admin/fields';
import { Empty, FilterPills, LINK, PageHeader, Panel, StatCard, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';
import { SWAG_CATEGORIES, SWAG_MOVEMENT_LABELS, type SwagMovementTypeValue } from '@/lib/validation/swag';
import { recordSwagMovement } from './actions';

export const metadata: Metadata = { title: 'Swag inventory' };

type Props = { searchParams: Promise<{ tab?: string; q?: string; category?: string; item?: string; selected?: string }> };

const MOVEMENT_BADGES: Record<SwagMovementTypeValue, { label: string; classes: string }> = {
  SET_COUNT: { label: 'Stocktake', classes: 'border-blue/35 bg-blue/10 text-blue' },
  RESTOCK: { label: 'Restock', classes: 'border-lime/40 bg-lime/10 text-lime' },
  HANDOUT: { label: 'Handout', classes: 'border-purple/35 bg-purple/10 text-purple' },
  ADJUSTMENT: { label: 'Write off', classes: 'border-danger/40 bg-danger/10 text-danger' },
};

const MOVEMENT_OPTIONS = (Object.keys(SWAG_MOVEMENT_LABELS) as SwagMovementTypeValue[]).map((value) => ({
  value,
  label: SWAG_MOVEMENT_LABELS[value],
}));

function StockStatus({ quantity, threshold }: { quantity: number; threshold: number }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger whitespace-nowrap">
        <span aria-hidden className="size-1.5 rounded-full bg-danger" />
        Out of stock
      </span>
    );
  }
  if (quantity <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-magenta/40 bg-magenta/10 px-2.5 py-0.5 text-xs font-medium text-magenta whitespace-nowrap">
        <span aria-hidden className="size-1.5 rounded-full bg-magenta" />
        Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 px-2.5 py-0.5 text-xs font-medium text-lime whitespace-nowrap">
      <span aria-hidden className="size-1.5 rounded-full bg-lime" />
      In stock
    </span>
  );
}

export default async function AdminSwagPage({ searchParams }: Props) {
  await requireRole();
  const { tab = 'inventory', q = '', category = '', item = '', selected = '' } = await searchParams;
  const activeTab = tab === 'log' ? 'log' : 'inventory';
  const query = q.trim().slice(0, 80);
  const categoryFilter = SWAG_CATEGORIES.includes(category as (typeof SWAG_CATEGORIES)[number]) ? category : '';

  const [allItems, filteredItems, totalMovements, movements] = await Promise.all([
    db.swagItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
    db.swagItem.findMany({
      where: {
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                { notes: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    }),
    db.swagMovement.count(),
    db.swagMovement.findMany({
      where: item ? { itemId: item } : undefined,
      include: { item: { select: { id: true, name: true, unitLabel: true } } },
      orderBy: { createdAt: 'desc' },
      take: 250,
    }),
  ]);

  const totalOnHand = allItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalReceived = allItems.reduce((sum, entry) => sum + entry.receivedTotal, 0);
  const totalHandedOut = allItems.reduce((sum, entry) => sum + entry.distributedTotal, 0);
  const outOfStockCount = allItems.filter((entry) => entry.quantity === 0).length;
  const lowStockCount = allItems.filter((entry) => entry.quantity > 0 && entry.quantity <= entry.lowStockThreshold).length;
  const alertCount = outOfStockCount + lowStockCount;
  const categoryCount = new Set(allItems.map((entry) => entry.category)).size;

  const itemOptions = allItems
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      value: entry.id,
      label: `${entry.name} (${entry.quantity} ${entry.unitLabel} on hand)`,
    }));

  const defaultSelectedItem = allItems.some((entry) => entry.id === selected) ? selected : itemOptions[0]?.value ?? '';

  return (
    <>
      <PageHeader
        title="Swag inventory"
        description="Track physical community swag counts, AWS shipments, event handouts and who changed each count."
        secondaryAction={{ href: '/api/admin/swag/export', label: 'Export CSV', external: true }}
        action={{ href: '/admin/swag/new', label: 'New swag item' }}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Swag items"
          value={allItems.length}
          hint={`Across ${categoryCount} categories`}
          icon={<Package aria-hidden size={18} />}
          tone="blue"
        />
        <StatCard
          label="Total on hand"
          value={totalOnHand}
          hint={`${totalReceived} received across AWS orders`}
          icon={<Layers aria-hidden size={18} />}
          tone="lime"
        />
        <StatCard
          label="Handed out"
          value={totalHandedOut}
          hint={`${totalMovements} logged inventory changes`}
          icon={<Gift aria-hidden size={18} />}
          tone="purple"
        />
        <StatCard
          label="Low or out of stock"
          value={alertCount}
          hint={`${outOfStockCount} out of stock, ${lowStockCount} low`}
          icon={<AlertTriangle aria-hidden size={18} />}
          tone={alertCount > 0 ? 'magenta' : 'neutral'}
        />
      </div>

      <FilterPills
        label="Swag sections"
        items={[
          { label: 'Inventory', href: '/admin/swag', active: activeTab === 'inventory', count: allItems.length },
          { label: 'Change log', href: '/admin/swag?tab=log', active: activeTab === 'log', count: totalMovements },
        ]}
      />

      {activeTab === 'inventory' ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <form role="search" className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-border-strong bg-card p-3.5">
              <div className="relative min-w-[200px] flex-1">
                <Search aria-hidden size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                <label htmlFor="swag-q" className="sr-only">
                  Search swag items
                </label>
                <input
                  id="swag-q"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by item name, category or note"
                  className="min-h-10 w-full rounded-md border border-input-border bg-input pr-3 pl-9 text-sm text-text-strong placeholder:text-text-faint focus:border-focus focus:outline-none"
                />
              </div>
              <label htmlFor="swag-category" className="sr-only">
                Filter by category
              </label>
              <select
                id="swag-category"
                name="category"
                defaultValue={categoryFilter}
                className="min-h-10 rounded-md border border-input-border bg-input px-3 text-sm text-text-strong focus:border-focus focus:outline-none"
              >
                <option value="">All categories</option>
                {SWAG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
              >
                Filter
              </button>
              {(query || categoryFilter) && (
                <Link href="/admin/swag" className="text-xs font-medium text-text-muted hover:text-text-strong hover:underline">
                  Reset
                </Link>
              )}
            </form>

            {filteredItems.length === 0 ? (
              <Empty action={{ href: '/admin/swag/new', label: 'New swag item' }}>
                No swag items match the current filter.
              </Empty>
            ) : (
              <TableWrap>
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={TH}>Item</th>
                      <th className={TH}>Category</th>
                      <th className={TH}>On hand</th>
                      <th className={TH}>Status</th>
                      <th className={TH}>Received</th>
                      <th className={TH}>Out</th>
                      <th className={TH}>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((entry) => (
                      <tr key={entry.id}>
                        <td className={TD}>
                          <Link href={`/admin/swag/${entry.id}`} className={LINK}>
                            {entry.name}
                          </Link>
                          {entry.notes && <p className="mt-0.5 text-xs text-text-muted">{entry.notes}</p>}
                        </td>
                        <td className={`${TD} text-xs text-text-muted whitespace-nowrap`}>{entry.category}</td>
                        <td className={`${TD} font-display whitespace-nowrap tabular-nums`}>
                          <span className="font-semibold text-text-strong">{entry.quantity}</span>{' '}
                          <span className="text-xs text-text-muted">{entry.unitLabel}</span>
                        </td>
                        <td className={TD}>
                          <StockStatus quantity={entry.quantity} threshold={entry.lowStockThreshold} />
                        </td>
                        <td className={`${TD} font-display text-xs text-text-muted tabular-nums`}>{entry.receivedTotal}</td>
                        <td className={`${TD} font-display text-xs text-text-muted tabular-nums`}>{entry.distributedTotal}</td>
                        <td className={`${TD} text-xs text-text-muted`}>
                          <span className="block font-display whitespace-nowrap">{formatDate(entry.updatedAt)}</span>
                          {entry.updatedBy && <span className="block truncate max-w-[160px]">{entry.updatedBy}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </div>

          <Panel
            title="Record stock change"
            description="Pick any swag item to set its exact stocktake count, log a restock or record handouts. Every update is logged."
          >
            {itemOptions.length === 0 ? (
              <p className="text-sm text-text-muted">Add a swag item first to start recording stock movements.</p>
            ) : (
              <AdminForm action={recordSwagMovement} framed={false} submitLabel="Update inventory">
                <SelectField name="itemId" label="Swag item" options={itemOptions} defaultValue={defaultSelectedItem} />
                <SelectField name="type" label="Change type" options={MOVEMENT_OPTIONS} defaultValue="SET_COUNT" />
                <TextField name="amount" label="Quantity" type="number" defaultValue={0} help="Exact number on hand for Stocktake, or units added/removed." />
                <TextField name="recipient" label="Event or recipient (optional)" help="For example Cloud Bootcamp, Freshers Onboarding or Joel." />
                <TextField name="reason" label="Reason" help="For example Initial physical count or Distributed at meetup." />
              </AdminForm>
            )}
          </Panel>
        </div>
      ) : (
        <div>
          <form className="mb-5 flex max-w-xl flex-wrap items-center gap-3 rounded-lg border border-border-strong bg-card p-3.5">
            <input type="hidden" name="tab" value="log" />
            <label htmlFor="log-item" className="sr-only">
              Filter log by item
            </label>
            <select
              id="log-item"
              name="item"
              defaultValue={item}
              className="min-h-10 min-w-[220px] flex-1 rounded-md border border-input-border bg-input px-3 text-sm text-text-strong focus:border-focus focus:outline-none"
            >
              <option value="">All swag items</option>
              {allItems
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
            >
              Filter
            </button>
            {item && (
              <Link href="/admin/swag?tab=log" className="text-xs font-medium text-text-muted hover:text-text-strong hover:underline">
                Show all
              </Link>
            )}
            <Link
              href="/admin/audit?action=swag."
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-lime hover:underline"
            >
              <span>Global audit log</span>
              <ArrowRight aria-hidden size={13} />
            </Link>
          </form>

          {movements.length === 0 ? (
            <Empty>No swag stock changes have been recorded yet.</Empty>
          ) : (
            <TableWrap>
              <table className={TABLE}>
                <thead>
                  <tr>
                    <th className={TH}>When</th>
                    <th className={TH}>Who</th>
                    <th className={TH}>Item</th>
                    <th className={TH}>Type</th>
                    <th className={TH}>Change</th>
                    <th className={TH}>Reason and recipient</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((move) => {
                    const badge = MOVEMENT_BADGES[move.type];
                    const signed = move.delta > 0 ? `+${move.delta}` : String(move.delta);
                    return (
                      <tr key={move.id}>
                        <td className={`${TD} font-display text-xs whitespace-nowrap`}>
                          {formatDate(move.createdAt)} {formatTime(move.createdAt)}
                        </td>
                        <td className={`${TD} text-xs`}>{move.actorEmail}</td>
                        <td className={TD}>
                          <Link href={`/admin/swag/${move.item.id}`} className={LINK}>
                            {move.item.name}
                          </Link>
                        </td>
                        <td className={TD}>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className={`${TD} font-display text-xs whitespace-nowrap tabular-nums`}>
                          <span className="text-text-muted">
                            {move.beforeQty} to {move.afterQty}
                          </span>{' '}
                          <span className={move.delta > 0 ? 'font-semibold text-lime' : move.delta < 0 ? 'font-semibold text-magenta' : 'text-text-muted'}>
                            ({signed} {move.item.unitLabel})
                          </span>
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
        </div>
      )}
    </>
  );
}
