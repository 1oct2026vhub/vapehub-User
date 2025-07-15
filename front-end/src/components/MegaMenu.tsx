import { zodResolver } from '@hookform/resolvers/zod';
import { Header_FORM_CONFIG, HEADER_IN_SCHEMA, HeaderFormSchema, HeaderMegaMenu } from '@/lib/config/header.config';
import { useForm } from 'react-hook-form';
import InputField from "./InputField";
import { SearchIcon } from "./Icons";
import { Form } from '@/components/ui/Form';
import Image from "next/image";
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { getAllDeals } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { Deal } from '@/lib/config/deal.config';

export const MegaMenu: React.FC<{ isOpen: boolean; menuItems: HeaderMegaMenu[] }> = ({ isOpen, menuItems }) => {

    const searchFromConfig = useForm<HeaderFormSchema>({
        resolver: zodResolver(HEADER_IN_SCHEMA),
        mode: 'onBlur',
    });

    const [deals, setDeals] = useState<Deal[]>([]);

    useEffect(() => {
        if (isOpen) {
            const fetchDeals = async () => {
                const response = await getAllDeals({ limit: 4 });
                if (response.status === ServerActionStatus.SUCCESS && response.data) {
                    setDeals(response.data.deals);
                }
            };
            fetchDeals();
        }
    }, [isOpen]);

    const getAllMenuItems = (items: HeaderMegaMenu[]): HeaderMegaMenu[] => {
        let allItems: HeaderMegaMenu[] = [];
        for (const item of items) {
            allItems.push(item);
            if (item.children && item.children.length > 0) {
                allItems = allItems.concat(getAllMenuItems(item.children));
            }
        }
        return allItems;
    };

    const productItems = useMemo(() => {
        const allItems = getAllMenuItems(menuItems);
        return allItems.filter(item =>
            item.entity_type === 'product' &&
            item.show_image &&
            item.entity_data &&
            item.entity_data.ProductImages &&
            item.entity_data.ProductImages.length > 0
        ).slice(0, 3);
    }, [menuItems]);

    return (
        <div className={`absolute left-0 -bottom-[420px] w-full border-t border-skin-neutral-200 shadow-card bg-skin-base z-20 px-12.5 py-9 transition-all duration-300 min-h-[428px] max-h-[500px] overflow-y-auto flex items-start opacity-0 invisible transform translate-y-4 ${isOpen ? '!opacity-100 !visible !translate-y-0' : ''}`}>
            <div className="w-[50%] 2xl:w-[60%] space-y-6 pr-7 border-r border-skin-neutral-200">
                <Form {...searchFromConfig}>
                    <form noValidate className="w-full">
                        <InputField
                            control={searchFromConfig.control}
                            name="search"
                            type={Header_FORM_CONFIG.SEARCH.TYPE}
                            placeholder={Header_FORM_CONFIG.SEARCH.PH}
                            className="w-full"
                            classNames={{
                                input: '!text-content-3 md:!text-title-2 font-normal md:font-bold',
                            }}
                            startContent={<SearchIcon className='w-4 h-4 md:w-max md:h-max' />}
                        />
                    </form>
                </Form>
                <div className="grid grid-cols-3 gap-9">
                    {menuItems.map((menuItem) => (
                        <div key={menuItem.id} className="mb-4">
                            <div className="border-b border-skin-neutral-200 mb-2">
                                {menuItem.parent?.label === "Deals" ?
                                    <Link href="/vapehub-deals">
                                        <h3 className="text-title-2 font-bold text-skin-neutral-500">{menuItem.label}</h3>
                                    </Link>
                                    : <h3 className="text-title-2 font-bold text-skin-neutral-500">{menuItem.label}</h3>
                                }
                            </div>
                            {menuItem.label === 'Deals' ? (
                                <ul>
                                    {menuItem.children.map((subItem) => (
                                        <li key={subItem.id}>
                                            <Link href={'/vapehub-deals'} className="block py-2 text-skin-neutral-300 font-bold text-content-1 leading-none hover:underline">
                                                {subItem.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                menuItem.children && menuItem.children.length > 0 && (
                                    <ul>
                                        {menuItem.children.map((subItem) => (
                                            <li key={subItem.id}>
                                                <Link href={subItem.original || '#'} className="block py-2 text-skin-neutral-300 font-bold text-content-1 leading-none hover:underline">
                                                    {subItem.label}
                                                </Link>
                                                {subItem.children && subItem.children.length > 0 && (
                                                    <ul className="pl-4">
                                                        {subItem.children.map(grandchild => (
                                                            <li key={grandchild.id}>
                                                                <Link href={grandchild.original || '#'} className="block py-1 text-skin-neutral-300 font-normal text-content-1 leading-none hover:underline">
                                                                    {grandchild.label}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-8 pl-7">
                <div className="grid grid-cols-3 gap-3.5">
                    {productItems.map(product => (
                        <Link href={product.original || '#'} key={product.id}>
                            <Image
                                src={product.entity_data?.ProductImages?.[0]?.image_url || '/images/no-image.png'}
                                alt={product.entity_data?.name || product.label}
                                width={183}
                                height={130}
                                className="rounded-10"
                            />
                        </Link>
                    ))}
                    {productItems.length < 3 && Array.from({ length: 3 - productItems.length }).map((_, i) => (
                        <Image
                            key={`placeholder-${i}`}
                            src="/images/no-image.png"
                            alt="placeholder"
                            width={183}
                            height={130}
                            className="rounded-10"
                        />
                    ))}
                </div>
                <ul className="space-y-2 text-skin-neutral-300 font-bold text-content-1">
                    <h3 className="text-title-2 font-bold text-skin-neutral-500">
                        Multibuy Deals
                    </h3>
                    {deals.map((deal) => (
                        <li key={deal.id}><Link href="/vapehub-deals" className="hover:underline">{deal.name}</Link></li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
