import { AppliedFilters, AttributeTerms, NON_VARIANT_FILTERS } from "@/lib/config/product.config";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ProductFilters } from "@/lib/config/product.config";

export const useProductFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getFilterParams = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const filters: ProductFilters = {
      variants: {},
      nonVariants: {}
    };

    // Get non-variant filters
    const nonVariantKeys = NON_VARIANT_FILTERS;
    nonVariantKeys.forEach(key => {
      if (params.has(key)) {
        filters.nonVariants![key] = params.get(key)!;
      }
    });

    // Get dynamic variant filters (only from attribute_* params)
    params.forEach((value, key) => {
      if (key.startsWith("attribute_")) {
        const attributeId = key.replace("attribute_", "");
        filters.variants![attributeId] = value.split(",");
      }
    });

    return filters;
  }, [searchParams]);

  const updateFilters = useCallback((filters: ProductFilters) => {
    const params = new URLSearchParams(searchParams);

    // Clear all existing non-variant filters first
    NON_VARIANT_FILTERS.forEach(key => {
      params.delete(key);
    });

    // Update non-variant filters
    Object.entries(filters.nonVariants || {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    // Update dynamic variant filters
    Object.entries(filters.variants || {}).forEach(([attributeId, values]) => {
      if (values.length > 0) {
        params.set(`attribute_${attributeId}`, values.join(","));
      } else {
        params.delete(`attribute_${attributeId}`);
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  }, [pathname, router, searchParams]);

  const getAppliedFilters = useCallback((attributes: AttributeTerms[]) => {
    const filters = getFilterParams();
    const applied: AppliedFilters[] = [];

    // Add static filters
    if (filters.nonVariants?.brand) applied.push({attributeId: 0, attribute: "Brand", count: 1, value: filters.nonVariants.brand, type: "brand"});
    if (filters.nonVariants?.categories) applied.push({attributeId: 0, attribute: "categories", count: 1, value: filters.nonVariants.categories, type: "categories"});
    if (filters.nonVariants?.price_range) applied.push({attributeId: 0, attribute: "Price Range", count: 1, value: filters.nonVariants.price_range, type: "price"});

    // Add dynamic variant filters
    Object.entries(filters.variants || {}).forEach(([attributeId, values]) => {
      if (values.length > 0) {
        const attribute = attributes.find(attr => 
          attr.attribute.id.toString() === attributeId
        );
        if (attribute) {
          const termNames = values.map(value => {
            const term = attribute.terms.find(t => t.id.toString() === value);
            return term?.name || value;
          });
          // applied.push(`${attribute.attribute.name} (${termNames.length} ${termNames.length > 1 ?  "items" : "item"})`);
          applied.push({attributeId: attribute.attribute.id, attribute: attribute.attribute.name, count: termNames.length, value: termNames.join(","), type: attribute.attribute.type}) 
        }
      }
    });

    return applied;
  }, [getFilterParams]);

  const removeFilter = useCallback((attributeId: number, attributes: AttributeTerms[], type: string) => {
    const filters = getFilterParams();
     
    if (type === "brand") {
      if (filters.nonVariants) {
        delete filters.nonVariants.brand;
      }
    } else if (type === "categories") {
      if (filters.nonVariants) {
        delete filters.nonVariants.categories;
      }
    } else if (type === "price") {
      if (filters.nonVariants) {
        delete filters.nonVariants.price_range;
      }
    } else {
      // Find attribute by name
      const attribute = attributes.find(attr => 
        attr.attribute.id === attributeId
      );
      if (attribute) {
        const attributeId = attribute.attribute.id.toString();
        if (filters.variants) {
          filters.variants[attributeId] = [];
        }
      }
    }

    updateFilters(filters);
  }, [getFilterParams, updateFilters]);

  return {
    getFilterParams,
    updateFilters,
    getAppliedFilters,
    removeFilter,
  };
}; 