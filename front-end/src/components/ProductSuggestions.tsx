import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Spinner } from '@nextui-org/react';
import { Product } from '@/lib/config/product.config';
// import { ROUTES } from '@/lib/routes';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import { resolveProductCardPrices } from '@/lib/product-card-prices';

interface ProductSuggestionsProps {
    suggestions: Product[];
    isLoading: boolean;
    onViewAll: () => void;
    onClose: () => void;
}

const ProductSuggestions: React.FC<ProductSuggestionsProps> = ({ suggestions, isLoading, onViewAll, onClose }) => {
    const getImageUrl = (url: string | undefined | null): string => {
        if (!url) {
            return '/images/no-image.png';
        }
        if (url.startsWith('http')) {
            return url;
        }
        return `/${url.replace(/^\//, '')}`;
    };

    return (
        <div className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50`}>
            {isLoading ? (
                <div className="flex justify-center items-center p-4">
                    <Spinner />
                </div>
            ) : suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {suggestions.map(product => {
                        const { price, regularPrice } = resolveProductCardPrices(product);
                        const currentPrice = Number(price) || 0;
                        const previousPrice = Number(regularPrice) || 0;
                        const isOnSale = previousPrice > 0 && currentPrice > 0 && previousPrice > currentPrice;
                        return (
                        <li key={product.id} className="p-2 hover:bg-gray-100">
                            <Link href={`/${product.slug}`} className="flex items-center gap-4" onClick={onClose}>
                                <Image src={getImageUrl(product.ProductImages[0]?.image_url)} alt={product?.ProductImages[0]?.alt_text?? product?.name} width={40} height={40} className="object-cover rounded" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-500 flex items-baseline gap-1">
                                        <span>{DEFAULT_CURRENCY_SYMBOL}{price}</span>
                                        {isOnSale && (
                                            <span className="line-through opacity-60">{DEFAULT_CURRENCY_SYMBOL}{regularPrice}</span>
                                        )}
                                    </p>
                                </div>
                            </Link>
                        </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="p-4 text-center text-gray-500">
                    No products found.
                </div>
            )}
            <div className="p-2 border-t border-gray-200">
                <Button fullWidth color="primary" variant="ghost" onPress={onViewAll}>
                    View all results
                </Button>
            </div>
        </div>
    );
};

export default ProductSuggestions; 