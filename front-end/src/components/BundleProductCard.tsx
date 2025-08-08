import { Button, Divider, Select, SelectItem } from '@nextui-org/react';
import React from 'react';
import { ProductInDeal } from '@/lib/config/deal.config';
import NoImage from './NoImage';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import Link from 'next/link';

type BundleProductCardProps = {
	product: ProductInDeal;
};

const BundleProductCard: React.FC<BundleProductCardProps> = ({ product }) => {
	const { name, primary_image, image, price, discount_price, regular_price, slug } = product;
	const productLink = `/${slug}`;
	
	// Handle both old and new image structure
	const imageUrl = image?.image_url || primary_image?.url;

	return (
		<>
			<div className="bg-skin-white p-4 rounded-14 shadow-card hidden md:flex items-center justify-between gap-8">
				<div className="flex items-center gap-5 xl:gap-7">
					<div className="bg-skin-white p-2 rounded-10 shadow-deal-card">
						<Link
							href={productLink}
							// className="bg-skin-base border border-skin-neutral-100 rounded p-3 shadow"
						>
							<NoImage
								src={imageUrl}
								alt={name}
								width={104}
								height={100}
							/>
						</Link>
					</div>
					<div className="space-y-8 max-w-lg">
						<Link href={productLink}>
							<h3 className="text-lg xl:text-title-1 font-semibold text-skin-neutral-400 mr-10">{name}</h3>
						</Link>
						{product.Flavors && product.Flavors.length > 0 && (
							<Select
								size="sm"
								className="w-full"
								variant="bordered"
								label="Choose your flavour"
								classNames={{
									label: '!text-content-1 !text-skin-neutral-500 font-bold',
									trigger: 'shadow-base border-skin-neutral-100',
									listboxWrapper: 'max-h-[400px]',
								}}
							>
								{product.Flavors.map((flavour: { name: string; id: number }) => (
									<SelectItem key={flavour.id}>{flavour.name}</SelectItem>
								))}
							</Select>
						)}
					</div>
				</div>
				<div className="space-y-7 text-right">
					<div>
						<p className="primary-gradient-100 text-title-1 xl:text-h5 font-bold">
							{DEFAULT_CURRENCY_SYMBOL}
							{price}
						</p>
						{regular_price && (
							<p className="text-skin-neutral-300 text-title-2 xl:text-title-1 line-through font-bold">
								{DEFAULT_CURRENCY_SYMBOL}
								{regular_price}
							</p>
						)}
					</div>
					<Button
						as={Link}
						href={productLink}
						size="sm"
						radius="sm"
						color="primary"
						className="btn primary-btn w-full shadow-input !rounded-10 text-content-1 !leading-none"
					>
						View Product
					</Button>
				</div>
			</div>

			{/* Mobile Card */}
			<div className="bg-skin-white p-2.5 w-full rounded-xl flex flex-col gap-2.5 md:hidden border border-skin-neutral-100">
				<div className="space-y-2 flex flex-col">
					<Link
						href={productLink}
						className="bg-white border border-skin-primary-100 rounded-lg p-3 shadow-md"
					>
						<NoImage
							src={imageUrl}
							alt={name}
							width={104}
							height={100}
							className="w-full aspect-square"
						/>
					</Link>
					<Link href={productLink}>
						<h4 className="text-content-1 sm:text-content-2 font-semibold text-skin-neutral-400 line-clamp-2 min-h-10">
							{name}
						</h4>
					</Link>
					<div className="flex items-end gap-2.5">
						<p className="text-black text-content-1 sm:text-title-2 font-semibold">
							{DEFAULT_CURRENCY_SYMBOL}
							{price}
						</p>
						{discount_price && (
							<p className="text-content-2 sm:text-content-1 text-skin-neutral-300 line-through font-normal">
								{DEFAULT_CURRENCY_SYMBOL}
								{regular_price}
							</p>
						)}
					</div>
					{product.Flavors && product.Flavors.length > 0 && (
						<Select
							size="sm"
							className="w-full"
							variant="bordered"
							label="Choose flavour"
							classNames={{
								label: '!text-xs sm:!text-content-2 !text-skin-neutral-500 font-medium',
								trigger: 'shadow-base border-skin-neutral-100',
								listboxWrapper: 'max-h-[300px]',
							}}
						>
							{product.Flavors.map((flavour: { name: string; id: number }) => (
								<SelectItem key={flavour.id}>{flavour.name}</SelectItem>
							))}
						</Select>
					)}
				</div>
				<Divider />
				<Button
					as={Link}
					href={productLink}
					size="sm"
					radius="sm"
					color="primary"
					className="btn primary-btn w-full shadow-input !rounded-10 text-content-1 !leading-none !h-9"
				>
					View Product
				</Button>
			</div>
		</>
	);
};

export default BundleProductCard;
