'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ServerActionStatus } from '@/lib/config/app.config';
import { ProductResponse } from '@/lib/config/product.config';
import {
  buildDescriptionCacheKey,
  buildProductDescriptionQuery,
  resolveDescriptionHtml,
} from '@/lib/product-description.utils';
import { getProductDescription } from '@/lib/server.actions';

const descriptionCache = new Map<string, string>();
const inflightRequests = new Map<string, Promise<string>>();

async function fetchDescriptionHtml(
  productId: number,
  cacheKey: string,
  query: ReturnType<typeof buildProductDescriptionQuery>,
): Promise<string> {
  const cached = descriptionCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = getProductDescription(productId, query, false).then((response) => {
    if (response.status === ServerActionStatus.SUCCESS && response.data) {
      const html = resolveDescriptionHtml(response.data);
      descriptionCache.set(cacheKey, html);
      return html;
    }
    descriptionCache.set(cacheKey, '');
    throw new Error(
      response.status === ServerActionStatus.ERROR
        ? response.message ?? 'Failed to load description'
        : 'Failed to load description',
    );
  }).finally(() => {
    inflightRequests.delete(cacheKey);
  });

  inflightRequests.set(cacheKey, request);
  return request;
}

export function useProductDescription(productId: number, productData: ProductResponse) {
  const cacheKey = useMemo(() => {
    const query = buildProductDescriptionQuery(productData);
    return buildDescriptionCacheKey(productId, query);
  }, [
    productId,
    productData.filtered_attribute_terms,
    productData.available_terms,
    productData.variants,
  ]);
  const query = useMemo(() => buildProductDescriptionQuery(productData), [cacheKey]);
  const cached = descriptionCache.get(cacheKey);

  const [description, setDescription] = useState(cached ?? '');
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (descriptionCache.has(cacheKey)) {
      setDescription(descriptionCache.get(cacheKey) ?? '');
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchDescriptionHtml(productId, cacheKey, query)
      .then((html) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setDescription(html);
      })
      .catch((err: unknown) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setDescription('');
        setError(err instanceof Error ? err.message : 'Failed to load description');
      })
      .finally(() => {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, productId, query]);

  return { description, loading, error };
}
