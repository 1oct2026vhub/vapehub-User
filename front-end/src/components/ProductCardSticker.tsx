import { ProductSticker } from '@/lib/config/product.config';

export type ProductCardStickerProps = {
  sticker: ProductSticker;
};

/** Pick light or dark label text from a #RRGGBB chip background. */
function getContrastingTextColor(hex: string): string {
  const cleaned = hex.replace('#', '').trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return '#FFFFFF';
  }

  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.55 ? '#083122' : '#FFFFFF';
}

/**
 * Shared product-card / PDP sticker chip.
 * Trusts server `is_active` — do not recompute date windows on the client.
 */
function ProductCardSticker({ sticker }: ProductCardStickerProps) {
  if (sticker?.is_active !== true) {
    return null;
  }

  const textColor = getContrastingTextColor(sticker.background_color);

  return (
    <span
      className="product-card-sticker"
      style={{
        backgroundColor: sticker.background_color,
        color: textColor,
      }}
    >
      <span className="product-card-sticker__label">{sticker.name}</span>
      <span
        className="product-card-sticker__fold"
        aria-hidden
        style={{ backgroundColor: sticker.background_color }}
      />
    </span>
  );
}

export default ProductCardSticker;
