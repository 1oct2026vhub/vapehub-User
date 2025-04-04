import { AppliedFilters, AttributeTerms } from "@/lib/config/product.config";
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
    };

    // Get static filters
    if (params.has("brand")) filters.brand = params.get("brand")!;
    if (params.has("category")) filters.category = params.get("category")!;
    if (params.has("price")) filters.price = params.get("price")!;

    // Get dynamic variant filters
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

    // Update static filters
    if (filters.brand) params.set("brand", filters.brand);
    else params.delete("brand");

    if (filters.category) params.set("category", filters.category);
    else params.delete("category");

    if (filters.price) params.set("price", filters.price);
    else params.delete("price");

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
    if (filters.brand) applied.push({attributeId: 0, attribute: "Brand", count: 1, value: filters.brand, type: "brand"});
    if (filters.category) applied.push({attributeId: 0, attribute: "Category", count: 1, value: filters.category, type: "category"});
    if (filters.price) applied.push({attributeId: 0, attribute: "Price", count: 1, value: filters.price, type: "price"});

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
      filters.brand = undefined;
    } else if (type === "category") {
      filters.category = undefined;
    } else if (type === "price") {
      filters.price = undefined;
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