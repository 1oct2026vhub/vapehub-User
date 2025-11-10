import { Button, Select, SelectItem } from '@nextui-org/react'
import { FunctionComponent } from 'react';
import { AttributeTerms, AttributeProductTerms, ProductVariant } from '@/lib/config/product.config';
import { useVariantFilter } from '@/lib/hooks/useVariantFilter';

type ProductVariantFilterProps = {
    attributeTerms: AttributeTerms[];
    productSlug: string;
    selectedVariant?: AttributeProductTerms;
    availableAttributes: AttributeTerms[];
    allVariants: ProductVariant[];
}

const SelectAttributeTerms = ({
    attributeTerm,
    handleVariantFilter,
    isFiltering,
    getDefaultSelectedTerm
}: {
    attributeTerm: AttributeTerms,
    handleVariantFilter: (attributeTerm: AttributeTerms, selectedTerm: { id: number; slug: string }) => void,
    isFiltering: boolean,
    getDefaultSelectedTerm: (attributeId: number) => string | undefined
}) => {
    const selectedTerm = getDefaultSelectedTerm(attributeTerm.attribute.id);
    return (
        <>
            <div>
                <p className='text-content-1 md:text-h5 font-semibold !font-oswald text-black capitalize'>
                    {attributeTerm?.attribute.name}
                </p>
                <p className='primary-gradient-100 text-content-2 md:text-content-1'>
                    {`${attributeTerm?.terms.length} available`}
                </p>
            </div>
            <Select
                size='sm'
                className="w-full"
                variant='bordered'
                label="Choose your flavour"
                selectedKeys={selectedTerm ? new Set([selectedTerm]) : undefined}
                isDisabled={isFiltering}
                classNames={{
                    label: "!text-content-1 !text-skin-neutral-500 !font-opensans",
                    trigger: "shadow-base border-skin-neutral-100 !rounded",
                    listboxWrapper: "max-h-[400px] overflow-y-auto",
                    listbox: "max-h-[400px] overflow-y-auto",
                }}
                popoverProps={{
                    classNames: {
                        content: "max-h-[400px] overflow-hidden",
                    }
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
    handleVariantFilter,
    getDefaultSelectedTerm,
}: {
    attributeTerm: AttributeTerms,
    currentTerm: string,
    handleVariantFilter: (attributeTerm: AttributeTerms, selectedTerm: { id: number; slug: string }) => void,
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
    // allVariants
}) => {
    // Filter out attributes that are not used in variation and not used in
    const attributeTermData = attributeTerms.filter(
        (attributeTerm) => attributeTerm.attribute.used_in_variation
    );

    const { handleVariantFilter, isFiltering, getDefaultSelectedTerm } = useVariantFilter(
        availableAttributes,
        selectedVariant
    );

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
            {attributeTermData?.map((attributeTerm) => (
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