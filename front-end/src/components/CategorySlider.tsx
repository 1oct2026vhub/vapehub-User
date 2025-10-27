"use client"
import React, { ReactElement } from "react";
import CategoryCard from "./CategoryCard";
import { Category } from "@/lib/config/category.config";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";

type props = {
    categories: Category[];
};

const CategorySlider: React.FC<props> = ({ categories }): ReactElement => {


    if (categories.length === 0) {
        return <EmptyPlaceholder title='Uh, oh!' description='No categories available' />;
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 lg:gap-4.5 items-stretch" >
            {
                categories.map((category, index) => (
                    <CategoryCard
                        key={index}
                        title={category.name}
                        imageSrc={category.logo_url}
                        link={category.slug}
                    />
                ))
            }
        </div>
    );
};

export default CategorySlider;
