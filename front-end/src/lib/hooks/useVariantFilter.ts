import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { AttributeTerms, AttributeProductTerms } from '@/lib/config/product.config';
// import { ProductVariant } from '@/lib/config/product.config';

export type VariantSelectionPayload = {
  attributeTerm: AttributeTerms;
  selectedTerm: AttributeTerms['terms'][number];
  isPrimaryAttribute: boolean;
  newUrl: string;
};

export const useVariantFilter = (
  // productSlug: string, 
  availableVariants: AttributeTerms[],
  currentVariant?: AttributeProductTerms,
  onVariantChange?: (payload: VariantSelectionPayload) => void,
  selectedAttributeSlugs?: Record<number, string>,
  primaryAttributeId?: number,
  // allVariants?: ProductVariant[]
) => {
  const pathname = usePathname();
  const [isFiltering, setIsFiltering] = useState(false);

  const hasActiveFilters = useCallback(() => {
    return !!selectedAttributeSlugs && Object.keys(selectedAttributeSlugs).length > 0;
  }, [selectedAttributeSlugs]);

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
    (attributeTerm: AttributeTerms, selectedTerm: AttributeTerms['terms'][number]) => {
      setIsFiltering(true);
      try {
        const pathSegments = pathname.split('/').filter(Boolean);
        const baseSlug = pathSegments[0];
        const isPrimaryAttribute = primaryAttributeId
          ? attributeTerm.attribute.id === primaryAttributeId
          : currentVariant?.attribute.id === attributeTerm.attribute.id;

        let newUrl = window.location.pathname;

        if (isPrimaryAttribute && baseSlug) {
          newUrl = `/${baseSlug}/${selectedTerm.slug}`;
          window.history.pushState({}, '', newUrl);
        }

        onVariantChange?.({
          attributeTerm,
          selectedTerm,
          isPrimaryAttribute: Boolean(isPrimaryAttribute),
          newUrl,
        });
      } finally {
        setIsFiltering(false);
      }
    },
    [pathname, currentVariant, onVariantChange, primaryAttributeId]
  );

  const getDefaultSelectedTerm = useCallback((attributeId: number): string | undefined => {
    // 1. Check for an explicit selection in the parent-provided state first
    if (selectedAttributeSlugs?.[attributeId]) {
      return selectedAttributeSlugs[attributeId];
    }

    // 2. Check if the attribute corresponds to the current main variant in the path
    if (currentVariant?.attribute.id === attributeId) {
      return currentVariant.terms.slug;
    }
    
    // 3. If all else fails, no selection
    return undefined;
  }, [currentVariant, selectedAttributeSlugs]);

  return {
    handleVariantFilter,
    isTermAvailable,
    isFiltering,
    hasActiveFilters,
    getDefaultSelectedTerm
  };
}; 