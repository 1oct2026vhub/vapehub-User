import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { AttributeTerms, AttributeProductTerms } from '@/lib/config/product.config';

export const useVariantFilter = (
  productSlug: string, 
  availableVariants: AttributeTerms[],
  currentVariant?: AttributeProductTerms
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFiltering, setIsFiltering] = useState(false);

  const hasActiveFilters = useCallback(() => {
    const pathSegments = pathname.split('/');
    return pathSegments.length > 2 || searchParams.toString() !== '';
  }, [pathname, searchParams]);

  const isTermAvailable = useCallback(
    (attributeId: number, termId: number): boolean => {
      // If no filters are active, all terms are available
      if (!hasActiveFilters()) {
        return true;
      }

      // If this is the current variant's attribute, all its terms should be enabled
      if (currentVariant?.attribute.id === attributeId) {
        return true;
      }

      const variantAttr = availableVariants.find(v => v.attribute.id === attributeId);
      return variantAttr?.terms.some(term => term.id === termId) ?? false;
    },
    [availableVariants, hasActiveFilters, currentVariant]
  );

  const handleVariantFilter = useCallback(
    (attributeTerm: AttributeTerms, selectedTerm: { id: number; slug: string }) => {
      setIsFiltering(true);
      try {
        const pathSegments = pathname.split('/');
        const baseSlug = pathSegments[1];

        // If selecting the same attribute as current variant, replace the variant and clear search params
        if (currentVariant?.attribute.id === attributeTerm.attribute.id) {
          router.push(`/${baseSlug}/${selectedTerm.slug}`);
          return;
        }

        // If we have a secondary slug, add/update search params
        if (pathSegments.length > 2) {
          const params = new URLSearchParams(searchParams.toString());
          const attributeKey = attributeTerm.attribute.id.toString();
          params.set(attributeKey, selectedTerm.slug.toString());
          router.push(`/${baseSlug}/${pathSegments[2]}?${params.toString()}`);
        } else {
          // If no secondary slug, set this as the main variant
          router.push(`/${baseSlug}/${selectedTerm.slug}`);
        }
      } finally {
        setIsFiltering(false);
      }
    },
    [pathname, router, searchParams, currentVariant]
  );

  const getDefaultSelectedTerm = useCallback((attributeId: number): string | undefined => {
    // Check if this attribute has a search param first
    const searchParamValue = searchParams.get(attributeId.toString());
    if (searchParamValue) {
        return searchParamValue; // Return the search param value directly
    }

    // Don't auto-select if this is the current variant's attribute
    if (currentVariant?.attribute.id === attributeId) {
        return currentVariant.terms.slug;
    }

    // Only auto-select if we have a secondary slug and no search params
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 2 && searchParams.toString() === '') {
        const variantAttr = availableVariants.find(v => v.attribute.id === attributeId);
        return variantAttr?.terms[0]?.slug;
    }

    return undefined;
  }, [availableVariants, currentVariant, pathname, searchParams]);

  return {
    handleVariantFilter,
    isTermAvailable,
    isFiltering,
    hasActiveFilters,
    getDefaultSelectedTerm
  };
}; 