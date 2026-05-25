import { Button, Select, SelectItem } from '@nextui-org/react'
import { FunctionComponent } from 'react';
import { AttributeTerms, AttributeProductTerms, ProductVariant } from '@/lib/config/product.config';
import { useVariantFilter, VariantSelectionPayload } from '@/lib/hooks/useVariantFilter';

/** Native `<select>` chevron + padding; scoped so only variant filter triggers are affected */
const VARIANT_FILTER_SELECT_STYLE = `
.pvf-native-select {
  /* same as tailwind shadow-base; NextUI otherwise clears trigger shadow */
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25) !important;
  border-radius: 0.5rem;
}
.pvf-native-select [data-slot="trigger"] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 0.5rem center !important;
  background-size: 1.5em 1.5em !important;
  padding-right: 2.5rem !important;
}
.pvf-native-select [data-slot="selectorIcon"] {
  display: none !important;
}
`;

const OUT_OF_STOCK_LABEL = '- Out of stock';

function variantTermSlug(variant: ProductVariant, attributeId: number): string | undefined {
    return variant.attributes.find((a) => a.attribute_id === attributeId)?.term_slug;
}

function variantMatchesTermAndOtherSelections(
    variant: ProductVariant,
    attributeId: number,
    termSlug: string,
    selectedAttributeSlugs?: Record<number, string>
): boolean {
    if (variantTermSlug(variant, attributeId) !== termSlug) {
        return false;
    }
    if (!selectedAttributeSlugs) {
        return true;
    }
    for (const [idStr, slug] of Object.entries(selectedAttributeSlugs)) {
        const aid = Number(idStr);
        if (aid === attributeId || !slug) {
            continue;
        }
        if (variantTermSlug(variant, aid) !== slug) {
            return false;
        }
    }
    return true;
}

function variantIsInStock(variant: ProductVariant): boolean {
    if (!variant.is_in_stock) {
        return false;
    }
    const qty = Number(variant.stock);
    if (Number.isFinite(qty)) {
        return qty > 0;
    }
    return true;
}

/** True when every variant matching this term (and other selected attributes) is out of stock. */
function isTermOutOfStockForSelections(
    allVariants: ProductVariant[],
    attributeId: number,
    termSlug: string,
    selectedAttributeSlugs?: Record<number, string>
): boolean {
    if (!allVariants.length) {
        return false;
    }
    let hasMatchingVariant = false;
    for (const v of allVariants) {
        if (!variantMatchesTermAndOtherSelections(v, attributeId, termSlug, selectedAttributeSlugs)) {
            continue;
        }
        hasMatchingVariant = true;
        if (variantIsInStock(v)) {
            return false;
        }
    }
    return hasMatchingVariant;
}

type ProductVariantFilterProps = {
    attributeTerms: AttributeTerms[];
    productSlug: string;
    selectedVariant?: AttributeProductTerms;
    availableAttributes: AttributeTerms[];
    filteredAttributeTerms: AttributeTerms[];
    allVariants: ProductVariant[];
    onVariantChange?: (payload: VariantSelectionPayload) => void;
    selectedAttributeSlugs?: Record<number, string>;
    primaryAttributeId?: number | null;
}

const SelectAttributeTerms = ({
    attributeTerm,
    handleVariantFilter,
    isFiltering,
    getDefaultSelectedTerm,
    allVariants,
    selectedAttributeSlugs,
}: {
    attributeTerm: AttributeTerms,
    handleVariantFilter: (attributeTerm: AttributeTerms, selectedTerm: AttributeTerms['terms'][number]) => void,
    isFiltering: boolean,
    getDefaultSelectedTerm: (attributeId: number) => string | undefined,
    allVariants: ProductVariant[],
    selectedAttributeSlugs?: Record<number, string>,
}) => {
    const selectedTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    // Generate dynamic placeholder based on attribute name
    const placeholderText = `Choose your ${attributeTerm?.attribute.name.toLowerCase()}`;

    return (
        <>
            <style>{VARIANT_FILTER_SELECT_STYLE}</style>
            <p className='text-content-1 md:text-h5 font-semibold !font-oswald text-black capitalize'>
                {attributeTerm?.attribute.name}
            </p>
            <Select
                className="pvf-native-select w-full"
                color="default"
                variant="bordered"
                placeholder={placeholderText}
                aria-label={attributeTerm?.attribute.name}
                selectedKeys={selectedTerm ? new Set([selectedTerm]) : undefined}
                onChange={(e) => {
                    const term = attributeTerm.terms.find(t => t.slug === e.target.value);
                    if (term) {
                        handleVariantFilter(attributeTerm, term);
                    }
                }}
                isDisabled={isFiltering}
                renderValue={(items) => {
                    const text = items?.length
                        ? items.map((i) => i.textValue).filter(Boolean).join(', ')
                        : placeholderText;
                    return (
                        <span className="block truncate text-left font-opensans text-sm text-black">
                            {text}
                        </span>
                    );
                }}
                classNames={{
                    base: 'w-full max-w-full',
                    trigger:
                        'border-2 border-skin-neutral-100 rounded-lg w-full h-12 min-h-12 bg-white hover:bg-gray-50 text-left px-4 py-2 font-opensans text-sm appearance-none cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary-500 data-[focus-visible=true]:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed shadow-none',
                    mainWrapper: 'w-full',
                    innerWrapper: 'w-full min-w-0',
                    value: 'text-left font-opensans text-sm min-w-0 flex-1 text-black',
                    listboxWrapper:
                        'pvf-variant-dropdown-list max-h-[min(400px,50vh)] overflow-y-auto overflow-x-hidden rounded-none !bg-white py-1 shadow-none opacity-100',
                    listbox: 'gap-0 p-0 font-opensans text-sm !bg-white overflow-hidden',
                }}
                popoverProps={{
                    placement: 'bottom-start',
                    offset: 0,
                    backdrop: 'transparent',
                    classNames: {
                        base: 'pvf-variant-dropdown !m-0 !p-0',
                        content:
                            'pvf-variant-dropdown w-full max-h-[min(400px,50vh)] overflow-hidden rounded-none !bg-white !p-0 !m-0 shadow-none opacity-100 backdrop-blur-none',
                    },
                }}
            >
                {attributeTerm.terms.map((term) => {
                    const outOfStock = isTermOutOfStockForSelections(
                        allVariants,
                        attributeTerm.attribute.id,
                        term.slug,
                        selectedAttributeSlugs
                    );
                    const displayName = outOfStock
                        ? `${term.name} ${OUT_OF_STOCK_LABEL}`
                        : term.name;
                    const disableOption = outOfStock && term.slug !== selectedTerm;

                    return (
                    <SelectItem
                        key={term.slug}
                        value={term.slug}
                        textValue={displayName}
                        isDisabled={disableOption}
                        selectedIcon={
                            <svg
                                aria-hidden
                                className="h-5 w-5 shrink-0 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        }
                        classNames={{
                            base: `!bg-white opacity-100 font-opensans text-black data-[hover=true]:!bg-skin-neutral-50 data-[selected=true]:!bg-primary data-[selected=true]:text-primary-foreground ${
                                outOfStock ? 'data-[disabled=true]:opacity-100' : ''
                            }`,
                            title: `!whitespace-normal !break-words font-opensans ${
                                outOfStock
                                    ? 'line-through text-skin-neutral-400 data-[selected=true]:!text-primary-foreground'
                                    : ''
                            }`,
                        }}
                    >
                        {displayName}
                    </SelectItem>
                    );
                })}
            </Select>
        </>
    );
};

const ButtonAttributeTerms = ({
    attributeTerm,
    currentTerm,
    handleVariantFilter,
    getDefaultSelectedTerm,
    allVariants,
    selectedAttributeSlugs,
}: {
    attributeTerm: AttributeTerms,
    currentTerm: string,
    handleVariantFilter: (attributeTerm: AttributeTerms, selectedTerm: AttributeTerms['terms'][number]) => void,
    getDefaultSelectedTerm: (attributeId: number) => string | undefined,
    allVariants: ProductVariant[],
    selectedAttributeSlugs?: Record<number, string>,
}) => {

    const defaultTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    const finalCurrentTerm = currentTerm || defaultTerm || "";

    return (
        <>
            <p className='text-content-1 md:text-title-1 font-semibold text-skin-neutral-500 capitalize'>
                {attributeTerm?.attribute.name}
            </p>
            <div className='flex flex-wrap sm:flex-nowrap gap-3.5 items-center'>
                {attributeTerm.terms.map((term, idx) => {
                    const outOfStock = isTermOutOfStockForSelections(
                        allVariants,
                        attributeTerm.attribute.id,
                        term.slug,
                        selectedAttributeSlugs
                    );
                    const displayName = outOfStock
                        ? `${term.name} ${OUT_OF_STOCK_LABEL}`
                        : term.name;
                    const disableOption = outOfStock && term.slug !== finalCurrentTerm;

                    return (
                    <Button
                        key={idx}
                        size="sm"
                        radius="md"
                        color={finalCurrentTerm === term.slug ? "primary" : "default"}
                        variant={finalCurrentTerm === term.slug ? "solid" : "bordered"}
                        isDisabled={disableOption}
                        onPress={() => {
                            const newTerm = attributeTerm.terms.find(t => t.slug === term.slug);
                            if (newTerm) {
                                handleVariantFilter(attributeTerm, newTerm);
                            }
                        }

                        }
                        className={`btn ${finalCurrentTerm === term.slug ? "primary-btn" : "bg-skin-white border-skin-neutral-200"} rounded w-full shadow-base !text-content-1 md:!text-title-1 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold ${
                            outOfStock && finalCurrentTerm !== term.slug
                                ? '!text-skin-neutral-400 line-through opacity-80'
                                : ''
                        } ${
                            outOfStock && finalCurrentTerm === term.slug ? 'line-through !text-white' : ''
                        }`}
                    >
                        {displayName}
                    </Button>
                    );
                })}
            </div>
        </>
    );
};

const ProductVariantFilter: FunctionComponent<ProductVariantFilterProps> = ({
    attributeTerms,
    // productSlug,
    selectedVariant,
    availableAttributes,
    filteredAttributeTerms,
    allVariants,
    onVariantChange,
    selectedAttributeSlugs,
    primaryAttributeId
}) => {
    // Filter out attributes that are not used in variation
    const attributeTermData = attributeTerms.filter(
        (attributeTerm) => attributeTerm.attribute.used_in_variation
    );

    const { handleVariantFilter, isFiltering, getDefaultSelectedTerm } = useVariantFilter(
        availableAttributes,
        selectedVariant,
        onVariantChange,
        selectedAttributeSlugs,
        primaryAttributeId ?? undefined
    );

    const hasActiveFilters = Boolean(selectedAttributeSlugs && Object.keys(selectedAttributeSlugs).length > 0);

    const visibleAttributeTermData = attributeTermData.map((attributeTerm) => {
        if (!hasActiveFilters) {
            return attributeTerm;
        }

        // Primary attribute always shows all its terms so the user can freely
        // change their flavour/first selection without restrictions.
        if (primaryAttributeId != null && attributeTerm.attribute.id === primaryAttributeId) {
            return attributeTerm;
        }

        // Term IDs the API says are still selectable (next-step options).
        // `availableAttributes` falls back to `lastKnownAvailableTerms` in ProductDetails
        // so this stays populated even after a full selection resolves.
        const availableTermIds = new Set(
            (availableAttributes.find(a => a.attribute.id === attributeTerm.attribute.id)?.terms ?? [])
                .map(t => t.id)
        );

        // Term IDs that are part of the current resolved combination (filtered_attribute_terms).
        const filteredTermIds = new Set(
            (filteredAttributeTerms.find(a => a.attribute.id === attributeTerm.attribute.id)?.terms ?? [])
                .map(t => t.id)
        );

        // Show a term if it is selectable OR is already part of the resolved variant.
        const visibleIds = new Set([...availableTermIds, ...filteredTermIds]);

        // If nothing was found (e.g. no selection yet for this attribute), show all terms.
        if (visibleIds.size === 0) {
            return attributeTerm;
        }

        const visibleTerms = attributeTerm.terms.filter(term => visibleIds.has(term.id));

        return {
            ...attributeTerm,
            terms: visibleTerms,
        };
    });

    // useEffect(() => {
    //     if (!selectedVariant && attributeTermData.length > 0) {
    //         const firstAttribute = attributeTermData[0];
    //         const defaultTermSlug = getDefaultSelectedTerm(firstAttribute.attribute.id);
    //         if (defaultTermSlug) {
    //             const termToSelect = firstAttribute.terms.find((t) => t.slug === defaultTermSlug);
    //             if (termToSelect) {
    //                 handleVariantFilter(firstAttribute, termToSelect);
    //             }
    //         }
    //     }
    // }, [selectedVariant, attributeTermData, getDefaultSelectedTerm, handleVariantFilter]);


    return (
        <div className='space-y-2 lg:space-y-3.5'>
            {visibleAttributeTermData?.map((attributeTerm) => (
                attributeTerm.attribute.type === "select" ?
                    <SelectAttributeTerms
                        key={attributeTerm.attribute.id}
                        attributeTerm={attributeTerm}
                        handleVariantFilter={handleVariantFilter}
                        isFiltering={isFiltering}
                        getDefaultSelectedTerm={getDefaultSelectedTerm}
                        allVariants={allVariants}
                        selectedAttributeSlugs={selectedAttributeSlugs}
                    /> :
                    <ButtonAttributeTerms
                        key={attributeTerm.attribute.id}
                        attributeTerm={attributeTerm}
                        currentTerm={selectedVariant?.attribute.id === attributeTerm.attribute.id ? selectedVariant.terms.slug : ""}
                        handleVariantFilter={handleVariantFilter}
                        getDefaultSelectedTerm={getDefaultSelectedTerm}
                        allVariants={allVariants}
                        selectedAttributeSlugs={selectedAttributeSlugs}
                    />
            ))}
        </div>
    );
};

export default ProductVariantFilter;