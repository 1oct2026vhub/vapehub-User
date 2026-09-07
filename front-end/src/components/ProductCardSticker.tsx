import { CSSProperties } from 'react';
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

/** Same path as public/images/new-before.svg — right-side ribbon fold. */
function buildFoldContent(backgroundColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="7" viewBox="0 0 6 7" fill="none"><path d="M0 7L6 0H0V7Z" fill="${backgroundColor}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Shared product-card / PDP sticker.
 * Mirror of the left `.quantity` puff badge (size + ribbon fold), coloured from API.
 */
function ProductCardSticker({ sticker }: ProductCardStickerProps) {
  if (sticker?.is_active !== true) {
    return null;
  }

  const bg = sticker.background_color;
  const style = {
    backgroundColor: bg,
    color: getContrastingTextColor(bg),
    '--sticker-fold': buildFoldContent(bg),
  } as CSSProperties;

  return (
    <span className="product-card-sticker" style={style}>
      {sticker.name}
    </span>
  );
}

export default ProductCardSticker;
