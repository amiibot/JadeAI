'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Brand = 'boss' | 'jade' | 'pink';

const STORAGE_KEY = 'jadeai-brand';
const VALID_BRANDS: Brand[] = ['boss', 'jade', 'pink'];

interface BrandContextValue {
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

function applyBrand(brand: Brand) {
  if (typeof document === 'undefined') return;
  if (brand === 'boss') {
    document.documentElement.removeAttribute('data-brand');
  } else {
    document.documentElement.setAttribute('data-brand', brand);
  }
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<Brand>('boss');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY) as Brand | null;
    if (stored && VALID_BRANDS.includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical SSR hydration from localStorage
      setBrandState(stored);
      applyBrand(stored);
    }
  }, []);

  const setBrand = (next: Brand) => {
    setBrandState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
    applyBrand(next);
  };

  return <BrandContext.Provider value={{ brand, setBrand }}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
