'use client'

import BreadCrumbs from '@/components/BreadCrumbs';
import SectionHeading from '@/components/ui/SectionHeading';
import { NextPage } from 'next'
import Image from 'next/image';
import React, { ReactElement } from 'react'
import Subscription from '../(dashboard)/_components/Subscription';

const BlogsDetailsPage: NextPage = (): ReactElement => {

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Blogs", href: "/blogs", isActive: true },
        { label: "Mastering MTL: A Comprehensive Guide to Mouth to Lung Vaping", href: "/", isActive: true },

    ];

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <SectionHeading title="Blog" className='w-fit max-md:!text-h5' />
            <section className="w-full flex flex-col gap-6 md:gap-8.5 blog-details">
                <Image
                    src='/images/blog-details-1.jpg'
                    alt='Blog Card'
                    width={1340}
                    height={318}
                    className='rounded-10 w-full max-h-80 min-h-80'
                />
                <div className='space-y-3.5 md:space-y-6'>
                    <h2 className=''>Mastering MTL: A Comprehensive Guide to Mouth to Lung Vaping</h2>
                    <p>Among the myriad vaping styles and techniques, Mouth to Lung (MTL) vaping stands out as a beloved classic in the vaping community. It’s the technique that mimics the action of smoking the closest, leading many ex-smokers toward this method when transitioning to vaping. Whether you are a vaper looking to explore the nuances of MTL vaping or a smoker searching for an effective gateway to quitting, understanding MTL vaping is a valuable step in your smoke-free journey.</p>
                </div>
                <div className='space-y-3.5 md:space-y-6'>
                    <h3 className=''>Table of Contents</h3>
                    <ol className=''>
                        <li>Uncovering MTL Vaping: A Technique with Heritage</li>
                        <li>The Unmissable Benefits of MTL Vaping</li>
                        <li>Exploring MTL Vaping Devices and Their Functions</li>
                        <li>Refining Your MTL Vaping Technique</li>
                        <li>MTL Device Options: Finding Your Perfect Fit</li>
                        <li>Selecting the Right E-Liquid for Your MTL Device</li>
                        <li>The Support in the Community for MTL Vapers</li>
                        <li>Closing the Case for MTL Vaping</li>
                    </ol>
                </div>
                <div className='space-y-3.5 md:space-y-6'>
                    <h3>Uncovering MTL Vaping: A Technique with Heritage</h3>
                    <p>MTL or Mouth to Lung vaping is a procedure where vapor from an e-cigarette is drawn into the mouth and then inhaled. This method has roots deep in the history of vaping, back to the origin of the first e-cigarettes, which were designed to mimic the act of smoking. In modern times, MTL vaping devices have evolved to become a sophisticated and appealing option to those seeking a smooth and flavourful vaping experience, different from the direct lung methods practiced in DTL (Direct to Lung) vaping.</p>
                </div>
                <Image
                    src='/images/blog-details-2.jpg'
                    alt='Blog Card'
                    width={1340}
                    height={318}
                    className='rounded-10 w-full max-h-80 min-h-80'
                />
                <div className='space-y-3.5 md:space-y-6'>
                    <h3>More about the Hayati Pro Ultra 15000 Puff Disposable Vape</h3>
                    <ul>
                        <li>The Hayati Pro Ultra is a standout product from Hayati, a brand renowned for its innovative offerings in the vaping industry. This impressive device follows in the footsteps of other popular products the Hayati Twist and the Hayati Duo Mesh, which offer an exceptional vaping experience. Additionally, Hayati’s market-leading Hayati Pro Max Nic Salts are a favourite among users for their smooth throat hit and rich flavours. Together, these products demonstrate Hayati’s commitment to quality and innovation.</li>
                        <li>What sets the Hayati Pro Ultra 15000 apart is its impressive 550mAh rechargeable battery, ensuring long-lasting power that can deliver up to 15000 puffs of delightful vapor. Whether you’re a casual vaper or a dedicated enthusiast, this device has got you covered.</li>
                    </ul>
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-7'>
                    <div className='space-y-3.5'>
                        <h4>The Hayati Pro Ultra 15000 is a rechargeable disposable vape.</h4>
                        <ul>
                            <li>But it doesn’t stop there – the Hayati Pro Ultra goes above and beyond with its exceptional features. Not only does it boast a diverse selection of over 40 flavours, ranging from classic tobacco to refreshing fruity blends and indulgent dessert options, but it also offers a smooth and satisfying vaping experience. The carefully crafted flavours are designed to tantalise your taste buds and cater to even the most discerning vapers.</li>
                        </ul>
                    </div>
                    <Image
                        src='/images/blog-details-3.jpg'
                        alt='Blog Card'
                        width={785}
                        height={307}
                        className='rounded-10 w-full max-h-[307px] min-h-[307px]'
                    />
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-7'>
                    <Image
                        src='/images/blog-details-4.jpg'
                        alt='Blog Card'
                        width={785}
                        height={307}
                        className='rounded-10 w-full max-h-[307px] min-h-[307px]'
                    />
                    <div className='space-y-3.5'>
                        <h4>Over 40 unique flavours. Something for everyone!</h4>
                        <ul>
                            <li>With such an extensive range, there’s a taste that is sure to be appreciated by everyone. Whether you prefer the rich and robust notes of tobacco, the zesty freshness of fruits, or the decadent sweetness of desserts, the Hayati Pro Ultra has it all. Each puff is a journey of flavour, delivering an unparalleled vaping pleasure that will keep you coming back for more.</li>
                        </ul>
                    </div>
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-7'>
                    <div className='space-y-3.5'>
                        <h4>How do you use the Hayati Pro Ultra 15000?</h4>
                        <ul>
                            <li>Experience the ultimate vaping pleasure with the Hayati Pro Ultra vape – a disposable vape that not only exceeds expectations in both performance and flavour but also offers a wide range of choices to cater to your individual preferences. Elevate your vaping experience with this remarkable device that is designed to deliver satisfaction with every puff.</li>
                        </ul>
                    </div>
                    <Image
                        src='/images/blog-details-5.jpg'
                        alt='Blog Card'
                        width={785}
                        height={307}
                        className='rounded-10 w-full max-h-[307px] min-h-[307px]'
                    />
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-7'>
                    <Image
                        src='/images/blog-details-6.jpg'
                        alt='Blog Card'
                        width={785}
                        height={307}
                        className='rounded-10 w-full max-h-[307px] min-h-[307px]'
                    />
                    <div className='space-y-3.5'>
                        <h4>The Hayati Pro 15000 has a Visual Display Screen which shows how much battery life is left.</h4>
                    </div>
                </div>
                <Subscription />
            </section>
        </main>
    )
}

export default BlogsDetailsPage
