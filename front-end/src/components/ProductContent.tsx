"use client"
import { Card, CardBody,  Tab, Tabs } from '@nextui-org/react'
// import Image from 'next/image'
import React, { ReactElement } from 'react'
import ReviewCard from './ReviewCard'; 
import { ProductViewDetails } from '@/lib/config/product.config';
type ProductContentProps = {
    product: ProductViewDetails;
}

const ProductContent: React.FC<ProductContentProps> = ({product}): ReactElement => {
    return (
        <section className='bg-skin-white p-4 md:p-6 xl:p-10 rounded-2.5xl shadow-card space-y-7.5'>
            <div className="flex w-full flex-col">
                <Tabs aria-label="Options"
                    variant='bordered'
                    color='primary'
                    classNames={{
                        base: "mb-5",
                        tabList: "gap-3 px-5 py-4 mx-auto border border-skin-neutral-100 rounded-xl !bg-skin-base",
                        cursor: "bg-primary-gradient-100 border-none text-skin-white rounded-lg shadow-md",
                        tab: "rounded-lg min-w-[124px] h-10 border border-skin-primary2-500 text-skin-primary2-500 group-data-[selected=true]:!border-none",
                        tabContent: "group-data-[selected=true]:!text-skin-white text-title-2 leading-none font-semibold",
                    }}
                >
                    <Tab key="Description" title="Description">
                        <Card classNames={{
                            base: "!bg-transparent border-none shadow-none p-0"
                        }}>
                            <CardBody className='p-0'>
                                <div className='space-y-6'>
                                    <div className='space-y-3.5'>
                                        <h2 className='text-title-1 md:text-h5 xl:text-38 font-semibold text-black'>Description</h2>
                                        <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                                    </div>
                                    {/* <Divider />
                                    <div className='space-y-3.5'>
                                        <h2 className='text-title-2 md:text-h5 xl:text-h4 font-semibold text-black'>Package Contains</h2>
                                        <ul className='list-disc text-skin-neutral-400 text-content-2 md:text-content-1 font-bold pl-5'>
                                            <li>1 x Hayati Pro Max 4000 Disposable Vape Device</li>
                                        </ul>
                                    </div>
                                    <Divider />
                                    <div className='space-y-3.5'>
                                        <h2 className='text-title-2 md:text-h5 xl:text-h4 font-semibold text-black'>Key Features</h2>
                                        <ul className='list-disc text-skin-neutral-400 text-content-2 md:text-content-1 font-bold pl-5'>
                                            <li>Draw activated</li>
                                            <li>Ideal for both new and seasoned vapers</li>
                                            <li>Dual 1.2 Ohm Mesh Coil</li>
                                            <li>Up to 4000 puffs</li>
                                            <li>1500 mAh battery</li>
                                            <li>LED light at the bottom</li>
                                            <li>Crystal appearance</li>
                                            <li>Not rechargeable</li>
                                        </ul>
                                    </div>
                                    <Divider />
                                    <div className="space-y-3.5">
                                        <h2 className='text-title-2 md:text-h5 xl:text-h4 font-semibold text-black'>Hayati Pro Max 4000 Disposable Vape Flavours</h2>
                                        <p className='text-content-1 font-semibold text-skin-neutral-400'>At VapeHub, we offer a huge selection of disposable vape devices and kits. Within the Hayati Pro Max range, there is a huge selection of fantastic flavours to choose from:</p>
                                        <div className='space-y-2'>
                                            <div className='grid grid-cols-3 gap-2'>
                                                <Image
                                                    src='/images/desc-content-1.jpg'
                                                    alt='Content 1'
                                                    width={415}
                                                    height={114}
                                                    className='w-full min-h-[114px]'
                                                />
                                                <Image
                                                    src='/images/desc-content-2.jpg'
                                                    alt='Content 1'
                                                    width={415}
                                                    height={114}
                                                    className='w-full min-h-[114px]'
                                                />
                                                <Image
                                                    src='/images/desc-content-3.jpg'
                                                    alt='Content 1'
                                                    width={415}
                                                    height={114}
                                                    className='w-full min-h-[114px]'
                                                />
                                            </div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <Image
                                                    src='/images/desc-content-4.jpg'
                                                    alt='Content 1'
                                                    width={415}
                                                    height={114}
                                                    className='w-full min-h-[114px]'
                                                />
                                                <Image
                                                    src='/images/desc-content-5.jpg'
                                                    alt='Content 1'
                                                    width={415}
                                                    height={114}
                                                    className='w-full min-h-[114px]'
                                                />
                                            </div>
                                        </div>
                                        <ul className='list-disc text-skin-neutral-400 text-content-2 md:text-content-1 font-bold pl-5'>
                                            <li>Atomic Fireballs: A fiery, cinnamon-flavoured delight that packs a punch with every bite, leaving a warm and spicy sensation.</li>
                                            <li>Banana Ice: Smooth banana flavour with an icy finish, offering a refreshing twist to the classic banana taste.</li>
                                            <li>Blackcurrant Mango: A sweet and tangy fusion of blackcurrant and mango, creating a unique and vibrant flavour profile.</li>
                                            <li>Blue Fusion: A vibrant blend of assorted blue fruits that delivers a burst of fruity goodness with each taste.</li>
                                            <li>Blue Razz Cherry: Tangy blue raspberry complemented by sweet cherry, creating a perfect balance of tart and sweet.</li>
                                            <li>Blue Razz Gummy Bear: The nostalgic taste of gummy bears mixed with blue raspberry, bringing back childhood memories with a fruity twist.</li>
                                            <li>Blue Razz Lemonade: Refreshing blue raspberry lemonade with a summery vibe, perfect for hot days and cooling off.</li>
                                            <li>Blue Sour Raspberry: A tart and tangy blue raspberry treat that will tantalize your taste buds with its sharp flavour.</li>
                                            <li>Blueberry Banana: A smooth blend of ripe blueberries and creamy banana, offering a rich and satisfying flavour combination.</li>
                                            <li>Blueberry Bubblegum: Classic bubblegum flavour with a blueberry twist, blending the familiar with a fruity surprise.</li>
                                            <li>Blueberry Cherry Cranberry: A medley of blueberries, cherries, and cranberries, providing a complex and layered berry experience.</li>
                                            <li>Blueberry and Mint: Fresh blueberries with a hint of mint, creating a refreshing and invigorating taste sensation.</li>
                                            <li>Blueberry Kiwi: A perfect blend of sweet blueberries and tart kiwi, delivering a balanced and delightful flavour.</li>
                                            <li>Blueberry Raspberry: Juicy blueberries paired with ripe raspberries, offering a double berry treat that is both sweet and tangy.</li>
                                            <li>Bru Ice: A refreshing icy burst with a hint of berries, perfect for those who enjoy a cool and fruity experience.</li>
                                            <li>Bubblegum Ice: Classic bubblegum flavour with a cool, icy touch, adding a refreshing twist to the traditional taste.</li>
                                            <li>Bull Ice: A strong, invigorating flavour with an icy finish, designed to awaken your senses and provide a boost.</li>
                                            <li>Cherry Cola: Beloved cherry-infused cola taste, combining the classic soda flavour with a fruity twist.</li>
                                            <li>Cola Ice: Classic cola flavour with a refreshing icy twist, perfect for cooling down and enjoying a familiar taste.</li>
                                            <li>Cola Lime: Zesty lime combined with classic cola taste, offering a citrusy twist to the traditional cola flavour.</li>
                                            <li>Cream Tobacco: Rich, creamy tobacco flavour that provides a smooth and satisfying experience for those who enjoy a robust taste.</li>
                                            <li>Fizzy Cherry: An effervescent cherry experience that tingles the taste buds with its sparkling and fruity flavour.</li>
                                            <li>Fresh Menthol Mojito: Cool, minty mojito flavour that refreshes and invigorates, perfect for a taste of the tropics.</li>
                                            <li>Fresh Mint: Pure and refreshing mint, offering a clean and crisp flavour that revitalizes the senses.</li>
                                            <li>Gummy Bear: The nostalgic taste of classic gummy bears, bringing a sweet and chewy delight that takes you back to your childhood.</li>
                                            <li>Hubba Bubba: The iconic bubblegum flavour that everyone knows and loves, offering a classic and timeless taste.</li>
                                            <li>Juicy Peach: Sweet and juicy ripe peach flavour, capturing the essence of fresh peaches in every bite.</li>
                                            <li>Lemon and Mint: A refreshing blend of tangy lemon and cool mint, delivering a balanced and invigorating flavour combination.</li>
                                            <li>Lemon Lime: A zesty combination of lemon and lime, providing a citrusy burst that is both tart and refreshing.</li>
                                            <li>Mad Blue: A wild mix of assorted blue fruits, offering a complex and vibrant flavour experience that is sure to delight.</li>
                                            <li>Mango Peach Pineapple: A tropical blend of mango, peach, and pineapple, transporting you to a sunny beach with every taste.</li>
                                            <li>Mr Blue: A mysterious and complex blue fruit blend, offering a unique and intriguing flavour profile that keeps you guessing.</li>
                                            <li>Mr Pink: A vibrant, fruity mix with a hint of mystery, providing a playful and delightful taste experience.</li>
                                            <li>Pineapple Ice: Sweet pineapple flavour with an icy finish, perfect for cooling down and enjoying a tropical treat.</li>
                                            <li>Prime Strawberry Watermelon: Delightful blend of strawberry and watermelon, offering a refreshing and juicy flavour combination.</li>
                                            <li>Red Apple Ice: Crisp red apple flavour with a refreshing icy touch, providing a cool and satisfying apple experience.</li>
                                            <li>Riberry Lemonade: Unique blend of riberry and lemonade, offering a tangy and refreshing twist on classic lemonade.</li>
                                            <li>Rocky Candy Orange: Nostalgic taste of orange rock candy, bringing back memories of childhood treats with a citrusy twist.</li>
                                            <li>Sakura Grape: Delicate sakura paired with sweet grape, offering a unique and floral fruit flavour that is both elegant and delightful.</li>
                                            <li>Strawberry Banana: Classic blend of sweet strawberries and creamy banana, providing a perfectly balanced and delicious flavour combination.</li>
                                            <li>Strawberry Hubba Bubba: Iconic bubblegum flavour with a strawberry twist, offering a playful and fruity take on a classic.</li>
                                            <li>Strawberry Jelly Beans: Sweet and fruity strawberry jelly beans flavour, capturing the essence of a favorite candy treat.</li>
                                            <li>Strawberry Mojito: Refreshing strawberry mojito taste, blending the sweetness of strawberries with the cool minty flavour of a mojito.</li>
                                            <li>Strawberry Raspberry Blueberry: Medley of strawberries, raspberries, and blueberries, offering a multi-berry delight that is both sweet and tangy.</li>
                                            <li>Strawberry Raspberry Ice: Sweet strawberries and raspberries with a cool, icy finish, providing a refreshing and fruity flavour experience.</li>
                                            <li>Triple Mango: Rich and juicy triple mango experience, offering an intense and delightful mango flavour.</li>
                                            <li>Vimbull Ice: Invigorating flavour with an icy touch, providing a refreshing and energizing taste experience.</li>
                                            <li>Watermelon Ice: Sweet and refreshing watermelon flavour with an icy finish, perfect for cooling down on a hot day.</li>
                                            <li>Watermelon Lemon Burst: Tangy and refreshing mix of watermelon and lemon, offering a vibrant and citrusy flavour combination.</li>
                                            <li>Watermelon Raspberry: Sweet and juicy blend of watermelon and raspberry, providing a delicious and refreshing fruit flavour.</li>
                                        </ul>
                                    </div>
                                    <Divider />
                                    <div className="space-y-4">
                                        <h2 className='text-title-2 md:text-h5 xl:text-h4 font-semibold text-black'>More about the Hayati Pro Max 4000 Disposable Vape</h2>
                                        <p className='text-content-2 md:text-content-1 font-semibold text-skin-neutral-400'>The Hayati Pro Max 4000 puff is an advanced disposable vaping device that promises you up to 4000 puffs for a memorable vaping experience, due to its pre-installed 1500 mAh battery. This packed battery and a dual 1.1 ohm mesh coil ensures exceptional and consistent flavour delivery with satisfying throat hits with each draw.</p>
                                        <Image
                                            src='/images/desc-content-6.jpg'
                                            alt='Content 1'
                                            width={1260}
                                            height={132}
                                            className='w-full min-h-[132px] rounded-10'
                                        />
                                        <h3 className='text-content-2 md:text-title-1 xl:text-h5 font-bold text-skin-neutral-500'>A dual 1.1 ohm mesh coil ensures brilliant flavour delivery combined with consistently satisfying throat hits with each draw.</h3>
                                        <p className='text-content-2 md:text-content-1 font-semibold text-skin-neutral-400'>Whether you’re seeking exotic fruits or desserts or simply a burst of berries in your e-cigarette flavours, the Hayati Pro Max has a flavour guaranteed to tantalise and captivate your taste buds! There are currently over 50 mouth-watering flavours in the Hayati Pro Max range, although this could further increase due to Hayati’s constant upgrades to the flavour range!</p>

                                    </div>
                                    <div className="space-y-4">
                                        <Image
                                            src='/images/desc-content-7.jpg'
                                            alt='Content 1'
                                            width={1260}
                                            height={132}
                                            className='w-full min-h-[132px] rounded-10'
                                        />
                                        <h3 className='text-content-1 md:text-title-1 xl:text-h5 font-semibold text-skin-neutral-500'>A massive range! Over 50 unique and tantalising flavours to choose from!</h3>
                                        <p className='text-content-2 md:text-content-1 font-semibold text-skin-neutral-400'>Featuring draw-activated power and flavoured e-liquid, this striking disposable device promises intense flavour with every puff. The device itself gives off a very striking and appealing appearance, mainly due to it’s crystal exterior. It’s not too bulky either, which means carrying the device in your pocket is seamless.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <Image
                                            src='/images/desc-content-8.jpg'
                                            alt='Content 1'
                                            width={1260}
                                            height={132}
                                            className='w-full min-h-[132px] rounded-10'
                                        />
                                        <h3 className='text-content-1 md:text-title-1 xl:text-h5 font-bold text-skin-neutral-500'>As you can see, Hayati delivers top-level performance!</h3>
                                        <p className='text-content-2 md:text-content-1 font-semibold text-skin-neutral-400'>Whether you’re new to vaping or an experienced vaper, don’t miss out on what the Hayati Pro Max has to offer. Try it today and be amazed by its unique flavourful sensations – we guarantee that you won’t regret it! If you’re looking for absolute smooth and pure taste, and uncompromising performance, then the Hayati Pro Max is for you!</p>
                                    </div>
                                    <div className="space-y-4">
                                        <Image
                                            src='/images/desc-content-9.jpg'
                                            alt='Content 1'
                                            width={1260}
                                            height={132}
                                            className='w-full min-h-[132px] rounded-10'
                                        />
                                        <h3 className='text-content-1 md:text-title-1 xl:text-h5 font-bold text-skin-neutral-500'>As you can see, Hayati delivers top-level performance!</h3>
                                    </div> */}
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="Delivery" title="Delivery">
                        <Card classNames={{
                            base: "!bg-transparent border-none shadow-none p-0"
                        }}>
                            <CardBody className='p-0'>
                                <div className="space-y-7.5">
                                    <div className='bg-skin-primary-200 px-7.5 py-4.5 rounded-xl text-center text-title-2 text-skin-neutral-500 font-semibold'>
                                        ***Free Delivery on all orders over$30***
                                    </div>
                                    <ul className='list-disc text-skin-neutral-500 text-title-2 font-bold pl-5 space-y-4 md:space-y-6'>
                                        <li>Royal Mail Tracked 48 - 2 to 4 working days</li>
                                        <li>Royal Mail Tracked 24 - 1 to 2 working days</li>
                                        <li>Royal Mail Next Day Guaranteed</li>
                                        <li>DPD Next Day Delivery</li>
                                    </ul>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="Reviews" title="Reviews">
                        <Card classNames={{
                            base: "!bg-transparent border-none shadow-none p-0"
                        }}>
                            <CardBody className='p-0'>
                                <div className='flex flex-col gap-7.5 pb-2'>
                                    <h2 className='text-h5 lg:text-h3 primary-gradient-100 font-bold'>Reviews</h2>
                                    <ReviewCard />
                                    <ReviewCard />
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </section>
    )
}

export default ProductContent