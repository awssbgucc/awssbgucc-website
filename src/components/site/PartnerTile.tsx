import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { Partner } from '@/lib/content/types';

export function PartnerTile({ partner }: { partner: Partner }) {
  const description = partner.description ?? (partner.name === 'CITSA' ? 'Running the Zero to Cloud Practitioner bootcamp with us.' : null);
  return (
    <article className="partner-tile">
      {partner.logoUrl && <Image src={partner.logoUrl} alt={partner.name} width={180} height={80} className="max-h-16 w-auto object-contain" />}
      <h3>
        {partner.url ? (
          <a href={partner.url} className="inline-flex items-center gap-3 hover:underline underline-offset-4">{partner.name}<ArrowUpRight size={18} aria-hidden /></a>
        ) : (
          partner.name
        )}
      </h3>
      {description && <p>{description}</p>}
    </article>
  );
}
