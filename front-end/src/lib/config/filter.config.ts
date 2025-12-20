 
export type SortByOption = {
    label: string;
    value: string;
}

export const sortByOptions: SortByOption[] = [
    // {
    //     label: "Default",
    //     value: "",
    // },
    {
        label: "Popularity",
        value: "popularity",
    },
    {
        label: "Latest",
        value: "DESC",
    },
    {
        label: "Oldest",
        value: "ASC",
    },
    {
        label: "Price: Low to High",
        value: "price_asc",
    },
    {
        label: "Price: High to Low",
        value: "price_desc",
    },
]
 
export type FilterOptionMenu = {
    label: string;
    count: number;
    value: string;
  };