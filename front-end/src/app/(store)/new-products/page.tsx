import BreadCrumbs from '@/components/BreadCrumbs';
import {  AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { getProductList } from '@/lib/server.actions';
import { NextPage } from 'next'; 
import ProductList from '../(product-listing)/_components/ProductList';
import { ROUTES } from '@/lib/routes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NewProductsPage: NextPage<{searchParams: Promise<any>}> = async ({searchParams}):AsyncReactElement  => {
     
    const defaultParams = { sort_by: "id", order: "DESC", limit: 12, offset: 0 };
    const combinedParams = { ...defaultParams, ...await searchParams };
    
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "New Products", href: `/${ROUTES.NEW_PRODUCTS}`, isActive: true },
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

export default NewProductsPage;