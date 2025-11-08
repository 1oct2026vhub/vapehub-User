import React, { FunctionComponent, ReactElement } from "react";
import CategorySlider from "@/components/CategorySlider";
import { CategoryDetails, Category } from "@/lib/config/category.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getHomeBlocks } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

const ShopByCategory: FunctionComponent = async (): Promise<ReactElement> => {
  const homeBlocksResponse = await getHomeBlocks();
  console.log("homeBlocksResponse", homeBlocksResponse);
  if (homeBlocksResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load categories' />;
  }
  
  // Get shopByCategories from the API response
  const shopByCategories = homeBlocksResponse.data?.shopByCategories || [];
  if (!shopByCategories?.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No categories available' />;
  }
  
  // Map the data to match CategorySlider's expected format
  // Use image_url from shopByCategories item, and category data from nested category object
  const categories: Category[] = shopByCategories
    .filter(item => item.status && item.category) // Only include active items with category data
    .sort((a, b) => a.order - b.order) // Sort by order
    .map(item => ({
      ...item.category,
      logo_url: item.image_url || item.category.logo_url, // Use image_url from shopByCategories, fallback to category logo_url
    }));
   
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <h1 className="text-h5 md:text-h3 w-fit font-semibold primary-gradient-100">{CategoryDetails.title}</h1>
        {/* <ViewAllLink href={CategoryDetails.viewAllHref} /> */}
      </div>
      <div className="slider-container section-slider">
        <CategorySlider categories={categories.slice(0, 8)}/>
      </div>
    </section>
  );
};

export default ShopByCategory;
