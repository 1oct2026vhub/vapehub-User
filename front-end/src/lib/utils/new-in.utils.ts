import { PRODUCT_PAYLOAD } from '@/lib/api-routes';
import { isLessThanOneMonth } from '@/lib/config/app.config';

/** Params for GET /api/product/new — drop list filters the endpoint applies server-side. */
export function toNewInApiParams(params: PRODUCT_PAYLOAD): PRODUCT_PAYLOAD {
  const { sort_by, order, ...rest } = params;
  delete rest.is_new;
  delete rest.is_coming_soon;

  if (sort_by === 'price' || sort_by === 'name' || sort_by === 'stock' || sort_by === 'id') {
    return { ...rest, sort_by, order };
  }

  if (sort_by === 'new_in_at') {
    return { ...rest, sort_by: 'new_in_at', order: order ?? 'DESC' };
  }

  if (order === 'ASC' || order === 'DESC') {
    return { ...rest, sort_by: 'new_in_at', order };
  }

  return rest;
}

/** Category/brand listings: map legacy Latest/Oldest URL to new_in_at when appropriate. */
export function normalizeNewestAvailableSort(params: PRODUCT_PAYLOAD): PRODUCT_PAYLOAD {
  const { sort_by, order, ...rest } = params;

  if (sort_by === 'new_in_at') {
    return params;
  }

  if (sort_by === 'price' || sort_by === 'name' || sort_by === 'stock' || sort_by === 'id') {
    return params;
  }

  if (sort_by === 'created_at' || sort_by === 'createdAt') {
    return params;
  }

  if (order === 'ASC' || order === 'DESC') {
    return { ...rest, sort_by: 'new_in_at', order };
  }

  return params;
}

export function getProductNewBadge(product: {
  is_new?: boolean;
  new_in_at?: string | null;
  createdAt?: string;
  created_at?: string;
}): '' | 'New' {
  if (product.is_new) {
    return 'New';
  }
  const launchDate = product.new_in_at ?? product.createdAt ?? product.created_at;
  if (!launchDate) {
    return '';
  }
  try {
    return isLessThanOneMonth(launchDate) ? 'New' : '';
  } catch {
    return '';
  }
}
