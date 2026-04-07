'use client';

import { Check } from 'lucide-react';
import { useBrand, type Brand } from './brand-provider';
import { cn } from '@/lib/utils';

const OPTIONS: { id: Brand; label: string; swatch: string }[] = [
  { id: 'boss', label: 'BOSS', swatch: '#00A77F' },
  { id: 'jade', label: 'Jade', swatch: '#059669' },
];

export function BrandSwitcher() {
  const { brand, setBrand } = useBrand();

  return (
    <div className="px-2 py-1.5">
      <div className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Brand
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {OPTIONS.map((opt) => {
          const active = brand === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBrand(opt.id)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors',
                active
                  ? 'border-brand bg-brand-muted text-brand'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300'
              )}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: opt.swatch }}
              />
              <span className="truncate">{opt.label}</span>
              {active && <Check className="ml-auto h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
