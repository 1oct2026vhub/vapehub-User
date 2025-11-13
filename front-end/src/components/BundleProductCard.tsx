"use client"
import { Button, Divider, Select, SelectItem } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { ProductInDeal } from '@/lib/config/deal.config';
import NoImage from './NoImage';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { getProductVariantByID } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { Product, ProductVariant, AttributeTerms, ProductResponse } from '@/lib/config/product.config';
import { PRODUCT_VARIANT_ATTRIBUTE } from '@/lib/api-routes';
import { toast } from 'sonner';

// Global cache to persist fetched product data across component mounts/unmounts
const productDataCache = new Map<number, {
	productResponse: ProductResponse;
	productData: Product;
}>();

// Track which products are currently being fetched to prevent duplicates
const fetchingProducts = new Set<number>();

// Custom variant filter for bundle products that doesn't use router navigation
const BundleVariantFilter: React.FC<{
	attributeTerms: AttributeTerms[];
	availableAttributes: AttributeTerms[];
	allVariants: ProductVariant[];
	onVariantSelect: (payload: PRODUCT_VARIANT_ATTRIBUTE[]) => void;
}> = ({ attributeTerms, availableAttributes, onVariantSelect }) => {
	const [selectedAttributes, setSelectedAttributes] = useState<Map<number, number>>(new Map());

	const attributeTermData = attributeTerms.filter(
		(attributeTerm) => attributeTerm.attribute.used_in_variation
	);

	// Check if a term is available based on current selections
	const isTermAvailable = (attributeId: number, termId: number): boolean => {
		// If no attributes are selected yet, show all terms from attributeTerms (full list)
		if (selectedAttributes.size === 0) {
			const attrTerm = attributeTermData.find(v => v.attribute.id === attributeId);
			return attrTerm?.terms.some(term => term.id === termId) ?? false;
		}

		// If this is the currently selected attribute, all its terms should be available
		if (selectedAttributes.has(attributeId)) {
			const attrTerm = attributeTermData.find(v => v.attribute.id === attributeId);
			return attrTerm?.terms.some(term => term.id === termId) ?? false;
		}

		// Check if this term is available based on current selections from availableAttributes
		// If availableAttributes is empty or doesn't have this attribute, fall back to attributeTerms
		const availableAttr = availableAttributes.find(v => v.attribute.id === attributeId);
		if (availableAttr && availableAttr.terms.length > 0) {
			return availableAttr.terms.some(term => term.id === termId);
		}
		
		// Fallback to attributeTerms if availableAttributes doesn't have data
		const attrTerm = attributeTermData.find(v => v.attribute.id === attributeId);
		return attrTerm?.terms.some(term => term.id === termId) ?? false;
	};

	const handleVariantFilter = (attributeTerm: AttributeTerms, selectedTerm: { id: number; slug: string }) => {
		const newSelected = new Map(selectedAttributes);
		newSelected.set(attributeTerm.attribute.id, selectedTerm.id);
		setSelectedAttributes(newSelected);

		// Build payload and call onVariantSelect
		const payload: PRODUCT_VARIANT_ATTRIBUTE[] = Array.from(newSelected.entries()).map(([attribute_id, term_id]) => ({
			attribute_id,
			term_id
		}));
		onVariantSelect(payload);
	};

	const getDefaultSelectedTerm = (attributeId: number): string | undefined => {
		const termId = selectedAttributes.get(attributeId);
		if (termId) {
			const attributeTerm = attributeTermData.find(attr => attr.attribute.id === attributeId);
			return attributeTerm?.terms.find(term => term.id === termId)?.slug;
		}
		return undefined;
	};

	// Get available terms for an attribute
	const getAvailableTerms = (attributeTerm: AttributeTerms) => {
		return attributeTerm.terms.filter(term => isTermAvailable(attributeTerm.attribute.id, term.id));
	};

	return (
		<div className='space-y-2'>
			{attributeTermData?.map((attributeTerm) => {
				const availableTerms = getAvailableTerms(attributeTerm);
				
				// Don't render if no terms are available
				if (availableTerms.length === 0) {
					return null;
				}

				return attributeTerm.attribute.type === "select" ? (
					<div key={attributeTerm.attribute.id}>
						<div>
							<p className='text-content-1 md:text-h5 font-semibold !font-oswald text-black capitalize'>
								{attributeTerm?.attribute.name}
							</p>
							<p className='primary-gradient-100 text-content-2 md:text-content-1'>
								{`${availableTerms.length} available`}
							</p>
						</div>
						<Select
							size='sm'
							className="w-full"
							variant='bordered'
							label="Choose your flavour"
							selectedKeys={getDefaultSelectedTerm(attributeTerm.attribute.id) ? new Set([getDefaultSelectedTerm(attributeTerm.attribute.id)!]) : undefined}
							classNames={{
								label: "!text-content-1 !text-skin-neutral-500 !font-opensans",
								trigger: "shadow-base border-skin-neutral-100 !rounded",
								listboxWrapper: "max-h-[400px] overflow-y-auto scroll-smooth",
								listbox: "overflow-visible",
							}}
							popoverProps={{
								classNames: {
									content: "max-h-[400px] overflow-hidden p-0",
								}
							}}
							onChange={(e) => {
								const term = availableTerms.find(t => t.slug === e.target.value);
								if (term) {
									handleVariantFilter(attributeTerm, term);
								}
							}}
						>
							{availableTerms.map((term) => (
								<SelectItem
									key={term.slug}
									value={term.slug}
								>
									{term.name}
								</SelectItem>
							))}
						</Select>
					</div>
				) : (
					<div key={attributeTerm.attribute.id}>
						<p className='text-content-1 md:text-title-1 font-semibold text-skin-neutral-500 capitalize'>
							{attributeTerm?.attribute.name}
						</p>
						<div className='flex flex-wrap sm:flex-nowrap gap-3.5 items-center'>
							{availableTerms.map((term, idx) => {
								const selectedTermId = selectedAttributes.get(attributeTerm.attribute.id);
								const isSelected = selectedTermId === term.id;
								const isDisabled = !isTermAvailable(attributeTerm.attribute.id, term.id);
								return (
									<Button
										key={idx}
										size="sm"
										radius="md"
										color={isSelected ? "primary" : "default"}
										variant={isSelected ? "solid" : "bordered"}
										isDisabled={isDisabled}
										onPress={() => {
											handleVariantFilter(attributeTerm, term);
										}}
										className={`btn ${isSelected ? "primary-btn" : "bg-skin-white border-skin-neutral-200"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} rounded w-full shadow-base !text-content-1 md:!text-title-1 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold`}
									>
										{term.name}
									</Button>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

type BundleProductCardProps = {
	product: ProductInDeal;
};

const BundleProductCard: React.FC<BundleProductCardProps> = React.memo(({ product }) => {
	const { name, primary_image, image, price, discount_price, regular_price, slug, id } = product;
	const productLink = `/${slug}`;
	const { addItemToCart } = useCart();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [productVariant, setProductVariant] = useState<ProductVariant | null>(null);
	const [productData, setProductData] = useState<Product | null>(null);
	const [productResponse, setProductResponse] = useState<ProductResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Handle both old and new image structure
	const imageUrl = image?.image_url || primary_image?.url;

	// Fetch product variant data on mount (only once per product, using global cache)
	useEffect(() => {
		// Check if data is already in cache
		const cachedData = productDataCache.get(id);
		if (cachedData) {
			console.log(`[BundleProductCard] ✓ Using cached data for product ${id}`);
			setProductResponse(cachedData.productResponse);
			setProductData(cachedData.productData);
			setIsLoading(false);
			return;
		}
		
		// Skip if already fetching this product
		if (fetchingProducts.has(id)) {
			console.log(`[BundleProductCard] Skipping fetch for product ${id} - already fetching`);
			return;
		}
		
		// Mark as fetching
		fetchingProducts.add(id);
		setIsLoading(true);

		const fetchProductData = async () => {
			try {
				const response = await getProductVariantByID({
					product_id: id,
					attribute_terms: []
				});
				
				if (response.status === ServerActionStatus.SUCCESS && response.data) {
					setProductResponse(response.data);
					const fetchedProduct = response.data.product;
					
					// Console log all variants with stock and price details
					console.log(`[BundleProductCard] ✓ Fetched Product ID: ${id}, Product Name: ${fetchedProduct.name}`);
					console.log(`[BundleProductCard] Total Variants: ${response.data.variants?.length || 0}`);
					
					if (response.data.variants && response.data.variants.length > 0) {
						console.log('[BundleProductCard] Variant List:', response.data.variants.map((variant: ProductVariant) => ({
							id: variant.id,
							slug: variant.slug,
							attributes: variant.attributes.map(attr => ({
								attribute_name: attr.attribute_name,
								term_name: attr.term_name,
								term_slug: attr.term_slug
							})),
							price: variant.price,
							regular_price: variant.regular_price,
							discount_price: variant.discount_price,
							stock: variant.stock,
							stock_status: variant.stock_status,
							is_in_stock: variant.is_in_stock,
							status: variant.status
						})));
					} else {
						console.log('[BundleProductCard] No variants found for this product');
					}
					
					const productForState: Product = {
						...fetchedProduct,
						id: fetchedProduct.id,
						name: fetchedProduct.name,
						slug: fetchedProduct.slug,
						price: fetchedProduct.primary_image?.url ?? '0',
						primary_image: fetchedProduct.primary_image,
						ProductImages: (fetchedProduct as typeof fetchedProduct & { all_images?: Array<{ id: number; url: string; is_primary: boolean }> }).all_images?.map((img: { id: number; url: string; is_primary: boolean }) => ({
							id: img.id,
							image_url: img.url,
							is_primary: img.is_primary
						})) || [],
						Category: fetchedProduct.category,
						Flavors: product.Flavors
					};
					setProductData(productForState);
					
					// Cache the fetched data for future use
					productDataCache.set(id, {
						productResponse: response.data,
						productData: productForState
					});
					
					console.log(`[BundleProductCard] ✓ Cached data for product ${id}. Cache size: ${productDataCache.size}`);
				}
			} catch (error) {
				console.error(`[BundleProductCard] Error fetching product ${id}:`, error);
			} finally {
				// Remove from fetching set
				fetchingProducts.delete(id);
				setIsLoading(false);
			}
		};
		fetchProductData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]); // Only depend on id to prevent unnecessary re-fetches

	// Handle variant selection from ProductVariantFilter
	const handleVariantSelection = async (variantPayload: PRODUCT_VARIANT_ATTRIBUTE[]) => {
		if (variantPayload.length === 0) {
			setProductVariant(null);
			// Reset to initial state - re-fetch product data
			if (productResponse) {
				setProductResponse(productResponse);
			}
			return;
		}

		try {
			// Fetch the variant based on selected attributes - this also updates available_terms
			const variantResponse = await getProductVariantByID({
				product_id: id,
				attribute_terms: variantPayload
			});

			if (variantResponse.status === ServerActionStatus.SUCCESS && variantResponse.data) {
				// Update product response with new available terms
				setProductResponse(variantResponse.data);
				
				if (variantResponse.data.variants?.[0]) {
					const selectedVariant = variantResponse.data.variants[0];
					setProductVariant(selectedVariant);
					
					// Console log selected variant details
					console.log('[BundleProductCard] Selected Variant Details:', {
						variant_id: selectedVariant.id,
						variant_slug: selectedVariant.slug,
						attributes: selectedVariant.attributes.map(attr => ({
							attribute_name: attr.attribute_name,
							term_name: attr.term_name,
							term_slug: attr.term_slug
						})),
						price: selectedVariant.price,
						regular_price: selectedVariant.regular_price,
						discount_price: selectedVariant.discount_price,
						stock: selectedVariant.stock,
						stock_status: selectedVariant.stock_status,
						is_in_stock: selectedVariant.is_in_stock,
						status: selectedVariant.status,
						selected_attributes: variantPayload
					});
				} else {
					setProductVariant(null);
				}
			} else {
				setProductVariant(null);
			}
		} catch (error) {
			console.error('Error fetching variant:', error);
			setProductVariant(null);
		}
	};

	const handleAddToCart = async () => {
		if (!productVariant || !productData) {
			toast.error('Please select a variant first');
			return;
		}

		if (productVariant.stock_status !== 'in_stock' || productVariant.stock <= 0) {
			toast.error('This variant is out of stock');
			return;
		}

		setIsAddingToCart(true);
		try {
			const variantTermSlug = productVariant.attributes[0]?.term_slug ?? '';
			const variantAttributes = productVariant.attributes.map(attr => ({ 
				attribute_id: attr.attribute_id, 
				term_slug: attr.term_slug 
			}));
			
			const productName = `${name} - ${productVariant.attributes.map(attr => attr.term_name).join(', ')}`;
			
			const allImages = (productData as typeof productData & { all_images?: Array<{ id: number; url: string; is_primary: boolean }> }).all_images;
			
			const productForCart: Product = {
				...productData,
				price: productData.primary_image?.url ?? '0',
				ProductImages: allImages?.map((img) => ({ 
					id: img.id, 
					image_url: img.url, 
					is_primary: img.is_primary 
				})) || productData.ProductImages || product.ProductImages || []
			};

			await addItemToCart(
				productForCart,
				productVariant.id,
				1,
				productVariant,
				productName,
				variantTermSlug,
				variantAttributes
			);
		} catch (err) {
			console.error("Failed to add to cart:", err);
			toast.error('Failed to add product to cart');
		} finally {
			setIsAddingToCart(false);
		}
	};

	const canAddToCart = productVariant && productVariant.stock_status === 'in_stock' && productVariant.stock > 0;

	return (
		<>
			{/* Desktop Card */}
			<div className="bg-skin-white p-4 rounded-md shadow-card hidden md:flex items-center justify-between gap-8">
				<div className="flex items-center gap-5 xl:gap-7">
					<div className="bg-skin-white p-2 rounded-10 shadow-product-card">
						<Link href={productLink}>
							<NoImage
								src={imageUrl}
								alt={name}
								width={104}
								height={100}
							/>
						</Link>
					</div>
					<div className="space-y-4 max-w-lg">
						<Link href={productLink}>
							<h3 className="text-content-2 xl:text-xl font-semibold text-skin-black mr-10">{name}</h3>
						</Link>
						{isLoading ? (
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
								<div className="h-10 bg-gray-200 rounded animate-pulse"></div>
							</div>
						) : productResponse && productResponse.product.attribute_terms ? (
							<>
								<BundleVariantFilter
									attributeTerms={productResponse.product.attribute_terms}
									availableAttributes={productResponse.available_terms || []}
									allVariants={productResponse.variants || []}
									onVariantSelect={handleVariantSelection}
								/>
								{productVariant && (productVariant.stock_status !== 'in_stock' || productVariant.stock <= 0) && (
									<p className="text-red-500 text-content-1 md:text-title-1 font-semibold !font-oswald">
										Out of stock
									</p>
								)}
							</>
						) : null}
					</div>
				</div>
				<div className="space-y-7 text-right">
					<div>
						{/* Show discount price if it exists, otherwise show regular price */}
						<p className="primary-gradient-100 text-title-1 md:text-h5 font-semibold !font-oswald">
							{DEFAULT_CURRENCY_SYMBOL}
							{productVariant?.discount_price || productVariant?.price || discount_price || price}
						</p>
						{/* Show strikethrough regular price only if discount exists */}
						{((productVariant?.discount_price && productVariant?.regular_price) || (discount_price && regular_price)) && (
							<p className="text-skin-neutral-300 text-title-2 xl:text-title-1 line-through font-bold">
								{DEFAULT_CURRENCY_SYMBOL}
								{productVariant?.regular_price || regular_price}
							</p>
						)}
					</div>
					<Button
						size="sm"
						radius="sm"
						color="primary"
						className="btn primary-btn w-full !min-w-fit !px-3 !py-1.5 shadow-input !rounded uppercase font-oswald text-content-1 md:text-title-1 !leading-none"
						onPress={handleAddToCart}
						isLoading={isAddingToCart}
						isDisabled={!canAddToCart || isAddingToCart}
					>
						Add to Cart
					</Button>
				</div>
			</div>

			{/* Mobile Card */}
			<div className="bg-skin-white w-full rounded-md flex flex-col gap-2.5 md:hidden shadow-product-card">
				<Link
					href={productLink}
					className="bg-skin-neutral-50 rounded-t-md p-1.5"
				>
					<NoImage
						src={imageUrl}
						alt={name}
						width={104}
						height={100}
						className="w-full aspect-square mix-blend-multiply"
					/>
				</Link>
				<div className="space-y-2 flex flex-col px-2.5 pb-2.5">
					<Link href={productLink}>
						<h4 className="text-content-1 sm:text-content-2 font-semibold text-skin-neutral-400 line-clamp-2 min-h-10">
							{name}
						</h4>
					</Link>
					<div className="flex items-end gap-2.5">
						{/* Show discount price if it exists, otherwise show regular price */}
						<p className="text-skin-neutral-500 text-content-1 font-semibold">
							{DEFAULT_CURRENCY_SYMBOL}
							{productVariant?.discount_price || productVariant?.price || discount_price || price}
						</p>
						{/* Show strikethrough regular price only if discount exists */}
						{((productVariant?.discount_price && productVariant?.regular_price) || (discount_price && regular_price)) && (
							<p className="text-content-2 sm:text-content-1 text-skin-neutral-300 line-through font-normal">
								{DEFAULT_CURRENCY_SYMBOL}
								{productVariant?.regular_price || regular_price}
							</p>
						)}
					</div>
					{isLoading ? (
						<div className="space-y-2">
							<div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
							<div className="h-9 bg-gray-200 rounded animate-pulse"></div>
						</div>
					) : productResponse && productResponse.product.attribute_terms ? (
						<>
							<BundleVariantFilter
								attributeTerms={productResponse.product.attribute_terms}
								availableAttributes={productResponse.available_terms || []}
								allVariants={productResponse.variants || []}
								onVariantSelect={handleVariantSelection}
							/>
							{productVariant && (productVariant.stock_status !== 'in_stock' || productVariant.stock <= 0) && (
								<p className="text-red-500 text-content-1 font-semibold !font-oswald">
									Out of stock
								</p>
							)}
						</>
					) : null}
					<Divider />
					<Button
						size="sm"
						radius="sm"
						color="primary"
						className="btn primary-btn w-full shadow-input !rounded uppercase font-oswald text-content-1 !leading-none !h-9"
						onPress={handleAddToCart}
						isLoading={isAddingToCart}
						isDisabled={!canAddToCart || isAddingToCart}
					>
						Add to Cart
					</Button>
				</div>
			</div>
		</>
	);
}, (prevProps: BundleProductCardProps, nextProps: BundleProductCardProps) => {
	// Custom comparison function - only re-render if product.id changes
	return prevProps.product.id === nextProps.product.id;
});

BundleProductCard.displayName = 'BundleProductCard';

export default BundleProductCard;
