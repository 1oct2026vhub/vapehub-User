import BreadCrumbs from "@/components/BreadCrumbs";
import { AsyncReactElement } from "@/lib/config/app.config";
import { ROUTES } from "@/lib/routes";
import { Metadata } from "next";
import BrandList from "./BrandList";
import { getBrandList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BRANDS | VapeHub",
  description: "",
};

type BrandsPageProps = {
  searchParams: Promise<Record<string, string>>;
};

const BrandsListing = async ({ searchParams }: BrandsPageProps): AsyncReactElement => {
  const params = await searchParams;
  const pageFromQuery = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : pageFromQuery;
  const limit = 20;

  const response = await getBrandList({ page, limit });
  const data = response.status === ServerActionStatus.SUCCESS ? response.data : null;
  const fetchError =
    response.status === ServerActionStatus.ERROR
      ? response.message.trim() || "Failed to load brands"
      : undefined;

  const breadcrumbs = [
    { label: "Home", href: ROUTES.WELCOME },
    { label: "Brands", href: ROUTES.BRANDS, isActive: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[1520px]">
      <section className="product-listing-container flex-col">
        <BreadCrumbs items={breadcrumbs} />
        <div>
          <h1 className="primary-gradient-600 w-fit text-h5 font-semibold md:text-h2">Brands</h1>
          <div className="product-content mt-2 text-content-1 font-normal leading-relaxed text-skin-neutral-500 md:text-content-1">
            <p>
              At Vapehub we offer products from all the major brands in the world! Whether it&apos;s
              the leading disposable vape brands or the leading E-Liquid brands, we have them all!
              If you&apos;re looking to buy a product from a particular brand, you may browse the list
              below and click on the brand of your choice.
            </p>
          </div>
        </div>
      </section>
      <BrandList data={data} fetchError={fetchError} />
    </div>
  );
};

export default BrandsListing;
