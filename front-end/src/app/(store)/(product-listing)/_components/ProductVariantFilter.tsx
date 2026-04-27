import { Button } from '@nextui-org/react'
import { FunctionComponent } from 'react';
import { AttributeTerms, AttributeProductTerms, ProductVariant } from '@/lib/config/product.config';
import { useVariantFilter, VariantSelectionPayload } from '@/lib/hooks/useVariantFilter';

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
    getDefaultSelectedTerm
}: {
    attributeTerm: AttributeTerms,
    handleVariantFilter: (attributeTerm: AttributeTerms, selectedTerm: AttributeTerms['terms'][number]) => void,
    isFiltering: boolean,
    getDefaultSelectedTerm: (attributeId: number) => string | undefined
}) => {
    const selectedTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    // Generate dynamic placeholder based on attribute name
    const placeholderText = `Choose your ${attributeTerm?.attribute.name.toLowerCase()}`;

    return (
        <>
            <p className='text-content-1 md:text-h5 font-semibold !font-oswald text-black capitalize'>
                {attributeTerm?.attribute.name}
            </p>
            <select
                value={selectedTerm || ''}
                onChange={(e) => {
                    const term = attributeTerm.terms.find(t => t.slug === e.target.value);
                    if (term) {
                        handleVariantFilter(attributeTerm, term);
                    }
                }}
                disabled={isFiltering}
                className='shadow-base border-2 border-skin-neutral-100 rounded-lg w-full h-12 bg-white hover:bg-gray-50 text-left px-4 py-2 font-opensans text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                <option value="" disabled>
                    {placeholderText}
                </option>
                {attributeTerm.terms.map((term) => (
                    <option key={term.slug} value={term.slug}>
                        {term.name}
                    </option>
                ))}
            </select>
        </>
    );
};

const ButtonAttributeTerms = ({
    attributeTerm,
    currentTerm,
    handleVariantFilter,
    getDefaultSelectedTerm,
}: {
    attributeTerm: AttributeTerms,
    currentTerm: string,
    handleVariantFilter: (attributeTerm: AttributeTerms, selectedTerm: AttributeTerms['terms'][number]) => void,
    getDefaultSelectedTerm: (attributeId: number) => string | undefined
}) => {

    const defaultTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    const finalCurrentTerm = currentTerm || defaultTerm || "";

    return (
        <>
            <p className='text-content-1 md:text-title-1 font-semibold text-skin-neutral-500 capitalize'>
                {attributeTerm?.attribute.name}
            </p>
            <div className='flex flex-wrap sm:flex-nowrap gap-3.5 items-center'>
                {attributeTerm.terms.map((term, idx) => (
                    <Button
                        key={idx}
                        size="sm"
                        radius="md"
                        color={finalCurrentTerm === term.slug ? "primary" : "default"}
                        variant={finalCurrentTerm === term.slug ? "solid" : "bordered"}
                        onPress={() => {
                            const newTerm = attributeTerm.terms.find(t => t.slug === term.slug);
                            if (newTerm) {
                                handleVariantFilter(attributeTerm, newTerm);
                            }
                        }

                        }
                        className={`btn ${finalCurrentTerm === term.slug ? "primary-btn" : "bg-skin-white border-skin-neutral-200"} rounded w-full shadow-base !text-content-1 md:!text-title-1 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold`}
                    >
                        {term.name}
                    </Button>
                ))}
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
    // allVariants
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
                    /> :
                    <ButtonAttributeTerms
                        key={attributeTerm.attribute.id}
                        attributeTerm={attributeTerm}
                        currentTerm={selectedVariant?.attribute.id === attributeTerm.attribute.id ? selectedVariant.terms.slug : ""}
                        handleVariantFilter={handleVariantFilter}
                        getDefaultSelectedTerm={getDefaultSelectedTerm}
                    />
            ))}
        </div>
    );
};

export default ProductVariantFilter;