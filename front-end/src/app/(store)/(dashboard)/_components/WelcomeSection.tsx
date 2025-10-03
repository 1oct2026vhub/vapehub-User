
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
        <section className='bg-white p-6 rounded-2xl md:rounded-3xl shadow-card grid grid-cols-1 xl:grid-cols-2 items-stretch gap-6 max-sm:mt-6'>
            <div className='space-y-4 text-neutral-900 text-content-1 md:text-title-2 font-medium flex flex-col justify-center'>
                <h1 className='text-h4 lg:text-h2 font-bold'>
                    {mainTitle}{' '}
                    <span className='primary-gradient-600'>{lastWord}</span>
                </h1>
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            <div className='flex items-center justify-center'>
                <Image 
                    src={image_url}
                    width={1920}
                    height={700}
                    alt={title}
                    className='w-full h-auto object-cover max-w-full rounded-lg'
                />
            </div>
        </section>
    )
}

export default WelcomeSection
