
import { ServerActionStatus } from '@/lib/config/app.config';
import { getWelcomeContent } from '@/lib/server.actions';
import Image from 'next/image'
import React from 'react'

const WelcomeSection = async () => {
    const welcomeContentResponse = await getWelcomeContent();

    if (welcomeContentResponse.status === ServerActionStatus.ERROR || !welcomeContentResponse.data?.welcomeContent) {
        return null;
    }

    const { title, content, image_url } = welcomeContentResponse.data.welcomeContent;

    const titleParts = title.split(' ');
    const lastWord = titleParts.pop();
    const mainTitle = titleParts.join(' ');

    return (
        // Use flex so children can stretch to the same height on wide screens.
        <section className='flex flex-col lg:flex-row items-stretch gap-6 max-sm:mt-6'>
            {/* Left: text content, vertically centered */}
            <div className='flex-1 flex flex-col justify-center space-y-4 text-neutral-900 text-content-1 md:text-title-2 font-medium'>
                <h2 className='text-h4 lg:text-h2 font-bold primary-gradient-600 w-fit'>
                    {mainTitle}{' '}{lastWord}
                </h2>
                <div className='welcome-text' dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Right: image - reduced height (70% on xl, 60% on md) to visually balance the section */}
            <div className='flex-1 flex items-center justify-center w-full'>
                {/*
                  - Default (mobile): auto height so image stacks naturally
                  - md: 60% of the column height
                  - xl: 70% of the column height (i.e. decrease image height by ~30%)
                  - max-h clamp prevents excessive upscaling on very tall content
                */}
                <div className='w-full max-w-full rounded-md overflow-hidden h-auto max-h-[350px]'>
                    <Image
                        src={image_url}
                        width={658}
                        height={500}
                        alt={title}
                        className='w-full h-full object-cover rounded-md block max-h-[350px]'
                        priority={false}
                    />
                </div>
            </div>
        </section>
    );
}

export default WelcomeSection
