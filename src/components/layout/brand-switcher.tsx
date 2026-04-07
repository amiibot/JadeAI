'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBrand, type Brand } from './brand-provider';

const OPTIONS: { id: Brand; swatch: string }[] = [
  { id: 'boss', swatch: '#00A77F' },
  { id: 'jade', swatch: '#059669' },
  { id: 'pink', swatch: '#ec4899' },
];

export function BrandSwitcher() {
  const { brand, setBrand } = useBrand();
  const t = useTranslations('brand');

  return (
    <div className="px-2 py-1.5">
      <div className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {t('label')}
      </div>
      <Select value={brand} onValueChange={(v) => setBrand(v as Brand)}>
        <SelectTrigger className="h-8 w-full cursor-pointer text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className="cursor-pointer text-xs">
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: opt.swatch }}
                />
                <span>{t(`options.${opt.id}`)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
