import BreadCrumbs from '@/components/BreadCrumbs';
import {  AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { getProductList } from '@/lib/server.actions';
import { Metadata, NextPage } from 'next'; 
import ProductList from '../(product-listing)/_components/ProductList';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
  title: "Shop | VapeHub",
  description: "",
};
type SearchParams = {
  searchParams: Promise<Record<string, string>>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShopPage: NextPage<SearchParams> = async ({searchParams}):AsyncReactElement  => {
     
    const defaultParams = { sort_by: "id", order: "DESC", limit: 12, offset: 0 };
    const searchParamsData = await searchParams;
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
    const combinedParams = { ...defaultParams, ...variantParams };
    
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Shop", href: `/${ROUTES.SHOP}`, isActive: true },
      ];

    const response = await getProductList(combinedParams);
      if(response.status == ServerActionStatus.ERROR) {
        return (<p>{response.message}</p>);
      }
     
    return (
        <div>
        <section className="product-listing-container flex-col">
          <BreadCrumbs items={breadcrumbs} />
          {/* <ProductListingContent data={data}/> */}
        </section>
        <ProductList data={response.data}/>
        </div>
    );
};

export default ShopPage;