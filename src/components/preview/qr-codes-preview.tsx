'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateQrSvg } from '@/lib/qrcode';

type QrPreviewItem = {
  id?: string;
  label?: string;
  name?: string;
  title?: string;
  url?: string;
};

interface QrCodesPreviewProps {
  items: ReadonlyArray<QrPreviewItem>;
}

type NormalizedQrCodeItem = {
  id: string;
  label: string;
  url: string;
};

function isValidUrl(str: string): boolean {
  if (!str.trim()) return false;
  try {
    const raw = str.startsWith('http') ? str : `https://${str}`;
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname;
    return host === 'localhost' || /\.\w{2,}$/.test(host) || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  } catch {
    return false;
  }
}

export function QrCodesPreview({ items }: QrCodesPreviewProps) {
  const filtered = useMemo<NormalizedQrCodeItem[]>(() => (
    items.flatMap((item, index) => {
      if (typeof item.url !== 'string' || !isValidUrl(item.url)) {
        return [];
      }

      return [{
        id: item.id ?? `qr-${index}`,
        label: item.label ?? item.name ?? item.title ?? '',
        url: item.url,
      }];
    })
  ), [items]);
  const [svgs, setSvgs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (filtered.length === 0) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const results: Record<string, string> = {};
      for (const qr of filtered) {
        try {
          results[qr.id] = await generateQrSvg(qr.url, 80);
        } catch {
          // skip invalid URLs
        }
      }
      if (!cancelled) setSvgs(results);
    })();
    return () => {
      cancelled = true;
    };
  }, [filtered]);

  if (filtered.length === 0) return null;
  const hasAnySvg = filtered.some((qr) => svgs[qr.id]);
  if (!hasAnySvg) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 24px', paddingTop: '4px' }}>
      {filtered.map((qr) => {
        const svg = svgs[qr.id];
        if (!svg) return null;
        return (
          <div key={qr.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: 96 }}>
            <div style={{ width: 80, height: 80 }} dangerouslySetInnerHTML={{ __html: svg }} />
            {qr.label && (
              <span style={{ fontSize: '10px', color: '#6b7280', lineHeight: 1.2, textAlign: 'center', wordBreak: 'break-all', maxWidth: 96 }}>{qr.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
