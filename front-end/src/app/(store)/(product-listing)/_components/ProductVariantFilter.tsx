import { Button, Select, SelectItem } from '@nextui-org/react'
import { FunctionComponent } from 'react';
import { AttributeTerms, AttributeProductTerms } from '@/lib/config/product.config';
import { useVariantFilter } from '@/lib/hooks/useVariantFilter';

type ProductVariantFilterProps = {
    attributeTerms: AttributeTerms[];
    productSlug: string;
    selectedVariant?: AttributeProductTerms;
    availableAttributes: AttributeTerms[];
}

const SelectAttributeTerms = ({
    attributeTerm,
    productSlug,
    selectedVariant,
    availableAttributes
}: {
    attributeTerm: AttributeTerms,
    productSlug: string,
    selectedVariant?: AttributeProductTerms,
    availableAttributes: AttributeTerms[]
}) => {
    const { handleVariantFilter, isFiltering, getDefaultSelectedTerm } = useVariantFilter(
        productSlug,
        availableAttributes,
        selectedVariant
    );

    const selectedTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    // const isCurrentAttribute = selectedVariant?.attribute.id === attributeTerm.attribute.id;

    // Check if this attribute has any selected term (either from URL or search params)
    // const hasSelectedTerm = selectedTerm !== undefined || isCurrentAttribute;
    // hasActiveFilters() && !isCurrentAttribute
    // ? `${attributeTerm?.terms.filter(term =>
    //     isTermAvailable(attributeTerm.attribute.id, term.id)
    // ).length} available`
    // : `${attributeTerm?.terms.length} available`
    return (
        <>
            <div>
                <p className='text-content-1 sm:text-title-2 lg:text-title-1 font-semibold text-black'>
                    {attributeTerm?.attribute.name}
                </p>
                <p className='primary-gradient-100 font-bold text-content-3 md:text-content-1'>
                    { `${attributeTerm?.terms.length} available`}
                </p>
            </div>
            <Select
                size='sm'
                className="w-full"
                variant='bordered'
                label="Choose your option"
                selectedKeys={selectedTerm ? new Set([selectedTerm]) : undefined}
                isDisabled={isFiltering}
                classNames={{
                    label: "!text-content-1 !text-skin-neutral-500 font-bold",
                    trigger: "shadow-base border-skin-neutral-100",
                    listboxWrapper: "max-h-[400px]",
                }}
                onChange={(e) => {
                    const term = attributeTerm.terms.find(t => t.slug === e.target.value);
                    if (term) {
                        handleVariantFilter(attributeTerm, term);
                    }
                }}
            >
                {attributeTerm.terms.map((term) => (
                    <SelectItem
                        key={term.slug}
                        value={term.slug}
                        // isDisabled={
                        //     // If this attribute has any selected term, enable all its terms
                        //     hasSelectedTerm ? false :
                        //         // Otherwise, disable based on availability
                        //         hasActiveFilters() && !isTermAvailable(attributeTerm.attribute.id, term.id)
                        // }
                    >
                        {term.name}
                    </SelectItem>
                ))}
            </Select>
        </>
    );
};

const ButtonAttributeTerms = ({
    attributeTerm,
    currentTerm,
    availableVariants,
    selectedVariant
}: {
    attributeTerm: AttributeTerms,
    currentTerm: string,
    availableVariants: AttributeTerms[],
    selectedVariant?: AttributeProductTerms
}) => {
    const { handleVariantFilter, getDefaultSelectedTerm } = useVariantFilter(
        "",
        availableVariants,
        selectedVariant
    );

    const defaultTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    const finalCurrentTerm = currentTerm || defaultTerm || "";

    // const isCurrentAttribute = selectedVariant?.attribute.id === attributeTerm.attribute.id;

    return (
        <>
            <p className='text-content-1 md:text-title-1 font-semibold text-skin-neutral-500'>
                {attributeTerm?.attribute.name}
            </p>
            <div className='flex gap-3.5 items-center'>
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
                        // isDisabled={
                        //     term.slug === finalCurrentTerm ? false :
                        //         isCurrentAttribute ? false :
                        //             hasActiveFilters() && !isTermAvailable(attributeTerm.attribute.id, term.id)
                        // }
                        className={`btn ${finalCurrentTerm === term.slug ? "primary-btn" : "bg-skin-white border-skin-neutral-200"} w-full shadow-base !text-content-1 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold`}
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
    productSlug,
    selectedVariant,
    availableAttributes
}) => {
    // Filter out attributes that are not used in variation and not used in
    const attributeTermData = attributeTerms.filter(
        (attributeTerm) => attributeTerm.attribute.used_in_variation
    );

    return (
        <div className='space-y-2 lg:space-y-3.5'>
            {attributeTermData?.map((attributeTerm) => (
                attributeTerm.attribute.type === "select" ?
                    <SelectAttributeTerms
                        key={attributeTerm.attribute.id}
                        attributeTerm={attributeTerm}
                        productSlug={productSlug}
                        selectedVariant={selectedVariant}
                        availableAttributes={availableAttributes}
                    /> :
                    <ButtonAttributeTerms
                        key={attributeTerm.attribute.id}
                        attributeTerm={attributeTerm}
                        currentTerm={selectedVariant?.attribute.id === attributeTerm.attribute.id ? selectedVariant.terms.slug : ""}
                        availableVariants={availableAttributes}
                        selectedVariant={selectedVariant}
                    />
            ))}
        </div>
    );
};

export default ProductVariantFilter;