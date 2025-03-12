 
export type SortByOption = {
    label: string;
    value: string;
}

export const sortByOptions: SortByOption[] = [
    {
        label: "Default",
        value: "",
    },
    {
        label: "Latest",
        value: "DESC",
    },
    {
        label: "Oldest",
        value: "ASC",
    },
]
 
export type FilterOptionMenu = {
    label: string;
    count: number;
    value: string;
  };