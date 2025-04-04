import { getBlogByCategoryAndSlug, getBlogBySlug, getDynamicPageSlug, getProductByCategory, getProductVariantByID } from "@/lib/server.actions";
import CategoryProducts from "../CategoryProducts";
import { ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import ProductView from "../ProductView";
import CategoryBlogs from "../../blogs/_components/CategoryBlog";
import { DynamicPageSlugResponse } from "@/lib/config/global.config";
import { AttributeProductTerms, AttributeTerms, CategoryResponseData, ProductResponse } from "@/lib/config/product.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse } from "@/lib/config/blog.config";
import BlogListView from "../../blogs/_components/BlogList";
import { PRODUCT_PAYLOAD, PRODUCT_VARIANT_ATTRIBUTE, PRODUCT_VARIANT_PAYLOAD } from "@/lib/api-routes";

type PageProps = {
  slug: string[];
};

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) => {

  const slug = (await params).slug;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const searchParamsData = await searchParams;
  const primarySlug: string | null = slug[0];
  const secondarySlug: string | null = slug[1];
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(primarySlug);
  if (!dynamicPageSlug) {
    return notFound();
  }

  if (primarySlug && secondarySlug) {
    const response = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);
    const variantTerms: AttributeTerms[] | undefined = response?.product.attribute_terms.filter((attrTerm: AttributeTerms) => attrTerm.attribute.used_in_variation === true);
    const variant: AttributeProductTerms | null = variantTerms?.reduce((result: AttributeProductTerms | null, attrTerm: AttributeTerms) => {

      const matchingTerm = attrTerm.terms.find(term => term.slug === secondarySlug);
      if (matchingTerm) {
        return {
          attribute: attrTerm.attribute,
          terms: matchingTerm
        };
      }
      return result;
    }, null) ?? null;

    const payload: PRODUCT_VARIANT_ATTRIBUTE[] = [];

    // Add variant payload if exists
    if (variant) {
      payload.push({ 
        attribute_id: variant.attribute.id, 
        term_id: variant.terms.id 
      });
    }
     
    // Add search params payload
    if (searchParams) {
      Object.entries(searchParams).forEach(([attributeId, termSlug]) => {
        const term = variantTerms?.find(term => term.attribute.id === parseInt(attributeId) && term.terms.find(t => t.slug === termSlug));
        // Skip if this attribute is already in payload from variant
        if (attributeId !== variant?.attribute.id.toString()) {
          payload.push({
            attribute_id: parseInt(attributeId),
            term_id: term?.terms.find(t => t.slug === termSlug)?.id ?? 0
          });
        }
      });
    } 
     
    const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, payload);

    if (!variant || !data || !data.variants.length || !data.product || !data.product.category) {
      return notFound();
    }
    const availableVariants = data.available_terms;
    return <ProductView data={data} isVariant={true} selectedVariant={variant} availableVariants={availableVariants} />;
  }


  const entityTypeHandlers: Record<string, () => Promise<React.ReactNode>> = {
    blog_category: async () => {
      const blogs = await fetchBlogBySlug(primarySlug);
      return blogs && <BlogListView selectedId={blogs.id.toString()} />;
    },
    blog: async () => {
      const categoryBlogs = await fetchBlogByCategoryAndSlug(primarySlug);
      return categoryBlogs && <CategoryBlogs data={categoryBlogs} />;
    },
    category: async () => {
      const combinedParams = buildVariantParams(searchParamsData, defaultParams);
      const category = await fetchCategory(primarySlug, combinedParams as PRODUCT_PAYLOAD);
      return category && <CategoryProducts data={category} />;
    },
    product: async () => {
      const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);

      if (!data?.product || !data.product.category) {
        notFound();
      } else {
        return <ProductView data={data} />;
      }
    }
  };

  const handler: () => Promise<React.ReactNode> = entityTypeHandlers[dynamicPageSlug?.entity_type ?? ""];
  if (!handler) {
    notFound();
  }

  const result: React.ReactNode = dynamicPageSlug ? await handler() : null;
  if (!result) {
    notFound();
  }

  return result;
}

export default Page;

const fetchDynamicPageSlug = async (slug: string): Promise<DynamicPageSlugResponse | null> => {
  const response = await getDynamicPageSlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchCategory = async (slug: string, params: PRODUCT_PAYLOAD): Promise<CategoryResponseData | null> => {

  const response = await getProductByCategory(slug, params);

  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchProduct = async (id: number, params: PRODUCT_VARIANT_ATTRIBUTE[]): Promise<ProductResponse | null> => {

  const payload: PRODUCT_VARIANT_PAYLOAD = {
    product_id: id,
    attribute_terms: params
  }

  const response = await getProductVariantByID(payload);

  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogByCategoryAndSlug = async (categorySlug: string): Promise<BlogByCategoryAndSlugResponse | null> => {
  const response = await getBlogByCategoryAndSlug(categorySlug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogBySlug = async (slug: string): Promise<BlogBySlugResponse | null> => {
  const response = await getBlogBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const buildVariantParams = (searchParamsData: Record<string, string>, defaultParams: PRODUCT_PAYLOAD) => {
  const variantParams = Object.entries(searchParamsData)
    .reduce((acc: Record<string, unknown>, [key, value]) => {
      if (key.startsWith('attribute_')) {
        const attributeId = key.replace('attribute_', '');
        const values = value.split(',').map(Number);

        // Build variant object
        const variantObj = acc.variant ? JSON.parse(acc.variant as string) : {};
        variantObj[attributeId] = values;

        // Encode variant object as URL parameter
        acc.variant = JSON.stringify(variantObj);
      } else {
        acc[key] = value;
      }
      return acc;
    }, { ...defaultParams });

  return Object.keys(variantParams).length > 1 ? variantParams : defaultParams;
};

export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) {
  const slug = (await params).slug;
  const primarySlug: string | null = slug[0];
  const secondarySlug: string | null = slug[1];
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const searchParamsData = await searchParams;


  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(primarySlug);
  if (!dynamicPageSlug) {
    return notFound();
  }

  if (primarySlug && secondarySlug) {
    const response = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);
    const variant: AttributeProductTerms | null = response?.product.attribute_terms?.reduce((result: AttributeProductTerms | null, attrTerm: AttributeTerms) => {
      const matchingTerm = attrTerm.terms.find(term => term.slug === secondarySlug);
      if (matchingTerm) {
        return {
          attribute: attrTerm.attribute,
          terms: matchingTerm
        };
      }
      return result;
    }, null) ?? null;
    const payload = [];

    // Add variant payload if exists
    if (variant) {
      payload.push({ 
        attribute_id: variant.attribute.id, 
        term_id: variant.terms.id 
      });
    }

    // Add search params payload
    if (searchParams) {
      Object.entries(searchParams).forEach(([attributeId, termSlug]) => {
        const term = response?.product.attribute_terms?.find(term => term.attribute.id === parseInt(attributeId) && term.terms.find(t => t.slug === termSlug));
        // Skip if this attribute is already in payload from variant
        if (attributeId !== variant?.attribute.id.toString()) {
          payload.push({
            attribute_id: parseInt(attributeId),
            term_id: term?.terms.find(t => t.slug === termSlug)?.id ?? 0
          });
        }
      });
    }

    const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, payload);
    
    if (!variant || !data || !data.variants.length || !data.product || !data.product.category) {
      return notFound();
    }
    return {
      title: data.product.name,
      description: data.product.description,
      openGraph: {
        title: data.product.name,
        description: data.product.description,
        images: data.product.primary_image.url ? [{
          url: data.product.primary_image.url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };

  }


  const metadataHandlers = {
    blog_category: async () => {
      const blogs = await fetchBlogBySlug(primarySlug);
      if (!blogs) return null;

      return {
        title: `${blogs.name} | VapeHub`,
        description: "",
        openGraph: {
          title: `${blogs.name} | VapeHub`,
          description: "",
          images: blogs.image_url ? [{
            url: blogs.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    blog: async () => {
      const categoryBlogs = await fetchBlogByCategoryAndSlug(primarySlug);
      if (!categoryBlogs) return null;

      return {
        title: `${categoryBlogs.title} | VapeHub`,
        description: "",
        openGraph: {
          title: `${categoryBlogs.title} | VapeHub`,
          description: "",
          images: categoryBlogs.image_url ? [{
            url: categoryBlogs.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    category: async () => {
      const combinedParams = buildVariantParams(searchParamsData, defaultParams);
      const category = await fetchCategory(primarySlug, combinedParams as PRODUCT_PAYLOAD);

      if (!category) return null;

      return {
        title: category.name,
        description: category.description,
        openGraph: {
          title: category.name,
          description: category.description,
          images: category.logo_url ? [{
            url: category.logo_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    product: async () => {
      const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);
      if (!data?.product || !data.product.category) return null;


      return {
        title: data.product.name,
        description: data.product.description,
        openGraph: {
          title: data.product.name,
          description: data.product.description,
          images: data.product.primary_image.url ? [{
            url: data.product.primary_image.url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    }
  };

  const handler = metadataHandlers[dynamicPageSlug?.entity_type ?? ""];
  if (!handler) {
    notFound();
  }

  const metadata = dynamicPageSlug ? await handler() : null;
  if (!metadata) {
    notFound();
  }

  return metadata;
}


