'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ServerActionStatus } from '@/lib/config/app.config';
import { ProductResponse } from '@/lib/config/product.config';
import {
  buildDescriptionCacheKey,
  buildProductDescriptionQuery,
  getResolvedVariant,
  getVariantDescriptionFromProductData,
  resolveDisplayDescription,
  resolveProductDescriptionHtml,
} from '@/lib/product-description.utils';
import { getProductDescription } from '@/lib/server.actions';

const productDescriptionCache = new Map<string, string>();
const inflightProductRequests = new Map<string, Promise<string>>();

async function fetchProductDescriptionHtml(
  productId: number,
  cacheKey: string,
  query: ReturnType<typeof buildProductDescriptionQuery>,
): Promise<string> {
  const cached = productDescriptionCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const inflight = inflightProductRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = getProductDescription(productId, query, false)
    .then((response) => {
      if (response.status === ServerActionStatus.SUCCESS && response.data) {
        const html = resolveProductDescriptionHtml(response.data);
        productDescriptionCache.set(cacheKey, html);
        return html;
      }
      productDescriptionCache.set(cacheKey, '');
      throw new Error(
        response.status === ServerActionStatus.ERROR
          ? response.message ?? 'Failed to load description'
          : 'Failed to load description',
      );
    })
    .finally(() => {
      inflightProductRequests.delete(cacheKey);
    });

  inflightProductRequests.set(cacheKey, request);
  return request;
}

export function useProductDescription(productId: number, productData: ProductResponse) {
  const resolvedVariant = useMemo(() => getResolvedVariant(productData), [
    productData.filtered_attribute_terms,
    productData.available_terms,
    productData.variants,
  ]);
  const variantDescriptionFromFilter = useMemo(
    () => getVariantDescriptionFromProductData(productData),
    [resolvedVariant, productData.variants],
  );
  const query = useMemo(() => buildProductDescriptionQuery(productData), [
    productData.filtered_attribute_terms,
    productData.available_terms,
    productData.variants,
  ]);
  const productCacheKey = useMemo(
    () => buildDescriptionCacheKey(productId, query, resolvedVariant?.id ?? null),
    [productId, query, resolvedVariant?.id],
  );

  const needsProductDescriptionApi = !variantDescriptionFromFilter;
  const cachedProductHtml = needsProductDescriptionApi
    ? productDescriptionCache.get(productCacheKey)
    : undefined;

  const [productDescription, setProductDescription] = useState(cachedProductHtml ?? '');
  const [loading, setLoading] = useState(
    needsProductDescriptionApi && cachedProductHtml === undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const description = useMemo(
    () => resolveDisplayDescription(variantDescriptionFromFilter, productDescription),
    [variantDescriptionFromFilter, productDescription],
  );

  useEffect(() => {
    if (!needsProductDescriptionApi) {
      setProductDescription('');
      setLoading(false);
      setError(null);
      return;
    }

    if (productDescriptionCache.has(productCacheKey)) {
      setProductDescription(productDescriptionCache.get(productCacheKey) ?? '');
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchProductDescriptionHtml(productId, productCacheKey, query)
      .then((html) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setProductDescription(html);
      })
      .catch((err: unknown) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setProductDescription('');
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
  }, [needsProductDescriptionApi, productCacheKey, productId, query]);

  return {
    /** HTML shown in the Description tab (variant from filter-variants, else product API). */
    description,
    variantDescription: variantDescriptionFromFilter,
    productDescription,
    loading,
    error,
  };
}
