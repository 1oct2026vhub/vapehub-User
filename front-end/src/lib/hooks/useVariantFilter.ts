import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { AttributeTerms, AttributeProductTerms, ProductVariant } from '@/lib/config/product.config';
import { scrollToTop } from '@/lib/utils/scrollToTop';
import { getDynamicPageSlug, getProductVariantByID } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

export const useVariantFilter = (
  availableVariants: AttributeTerms[],
  currentVariant?: AttributeProductTerms,
  productSlug?: string,
  productId?: number,
  allVariants?: ProductVariant[],
  filteredAttributeTerms?: AttributeTerms[],
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
    async (attributeTerm: AttributeTerms, selectedTerm: { id: number; slug: string }) => {
      setIsFiltering(true);
      try {
        const pathSegments = pathname.split('/');
        const baseSlug = pathSegments[1];

        const attributeKey = attributeTerm.attribute.id.toString();
        const getParamsWithoutCurrentAttribute = () => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete(attributeKey);
          return params;
        };
        const navigateWithSlug = (slug: string) => {
          const params = getParamsWithoutCurrentAttribute();
          const query = params.toString();
          router.push(`/${baseSlug}/${slug}${query ? `?${query}` : ''}`, { scroll: false });
          scrollToTop();
        };

        const getVariantSlugFromFilteredTerms = (): string | undefined => {
          const attributeData = filteredAttributeTerms?.find(attr => attr.attribute.id === attributeTerm.attribute.id);
          const termData = attributeData?.terms.find(term => term.slug === selectedTerm.slug);
          const variantSlugs = termData?.variant_slugs;
          
          // Only use variant slug if there is exactly one valid slug
          // If array is null, undefined, empty, or has more than one element, fall back to term slug
          if (variantSlugs && Array.isArray(variantSlugs) && variantSlugs.length === 1 && variantSlugs[0]) {
            return variantSlugs[0];
          }
          
          return undefined;
        };

        const getVariantSlugFromAvailableTerms = (): string | undefined => {
          // Fallback to availableVariants (available_terms) when filtered_attribute_terms doesn't have data yet (e.g., first selection)
          if (!availableVariants) return undefined;
          
          // Find the attribute in availableVariants
          const attributeData = availableVariants.find(attr => attr.attribute.id === attributeTerm.attribute.id);
          if (!attributeData) return undefined;
          
          // Find the selected term in the attribute's terms
          const termData = attributeData.terms.find(term => term.slug === selectedTerm.slug);
          if (!termData) return undefined;
          
          // Check if variant_slugs array exists and has exactly one valid slug
          const variantSlugs = termData.variant_slugs;
          if (variantSlugs && Array.isArray(variantSlugs) && variantSlugs.length === 1 && variantSlugs[0]) {
            return variantSlugs[0];
          }
          
          return undefined;
        };

        const tryVariantSlugFlow = async (variantSlug?: string) => {
          if (!variantSlug || !productSlug || !productId) {
            return false;
          }
          try {
            const combinedSlugs = `${productSlug},${variantSlug}`;
            console.log('[useVariantFilter] getDynamicPageSlug - Payload:', { slugs: combinedSlugs });
            const dynamicSlugResponse = await getDynamicPageSlug(combinedSlugs, false);
            console.log('[useVariantFilter] getDynamicPageSlug - Response:', dynamicSlugResponse);
            
            if (dynamicSlugResponse.status === ServerActionStatus.SUCCESS && dynamicSlugResponse.data) {
              console.log('[useVariantFilter] Calling getProductVariantByID with variant slug:', variantSlug);
              const variantResponse = await getProductVariantByID({
                product_id: productId,
                slugs: variantSlug
              });
              console.log('[useVariantFilter] getProductVariantByID - Response:', variantResponse);
              
              navigateWithSlug(variantSlug);
              return true;
            }
          } catch (error) {
            console.error('Error fetching dynamic slug with variant slug:', error);
          }
          return false;
        };

        // Try filtered_attribute_terms first (preferred source), then fallback to availableVariants (available_terms) if data not available yet
        const variantSlugFromFiltered = getVariantSlugFromFilteredTerms();
        const variantSlugFromAvailableTerms = !variantSlugFromFiltered ? getVariantSlugFromAvailableTerms() : undefined;

        const variantFlowSucceeded =
          (await tryVariantSlugFlow(variantSlugFromFiltered)) ||
          (await tryVariantSlugFlow(variantSlugFromAvailableTerms));

        if (!variantFlowSucceeded) {
          navigateWithSlug(selectedTerm.slug);
        }
      } finally {
        setIsFiltering(false);
      }
    },
    [pathname, router, searchParams, currentVariant, productSlug, productId, allVariants, availableVariants, filteredAttributeTerms]
  );

  const getDefaultSelectedTerm = useCallback((attributeId: number): string | undefined => {
    // 1. Check for an explicit selection in the search params first
    const searchParamValue = searchParams.get(attributeId.toString());
    if (searchParamValue) {
      return searchParamValue;
    }

    // 2. Check filtered_attribute_terms for is_selected: true
    // This ensures the select box is prefilled when a variant slug exists and is_selected is true
    if (filteredAttributeTerms) {
      const attributeData = filteredAttributeTerms.find(attr => attr.attribute.id === attributeId);
      const selectedTerm = attributeData?.terms.find(term => term.is_selected === true);
      if (selectedTerm) {
        return selectedTerm.slug;
      }
    }

    // 3. Check if the attribute corresponds to the current main variant in the path
    if (currentVariant?.attribute.id === attributeId) {
      return currentVariant.terms.slug;
    }
    
    // 4. If all else fails, no selection
    return undefined;
  }, [currentVariant, searchParams, filteredAttributeTerms]);

  return {
    handleVariantFilter,
    isTermAvailable,
    isFiltering,
    hasActiveFilters,
    getDefaultSelectedTerm
  };
}; 