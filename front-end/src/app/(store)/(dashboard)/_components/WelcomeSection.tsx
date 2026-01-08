
import { ServerActionStatus } from '@/lib/config/app.config';
import { getWelcomeContent } from '@/lib/server.actions';
import Image from 'next/image'
import React from 'react'

const WelcomeSection = async () => {
    const welcomeContentResponse = await getWelcomeContent();
    if (welcomeContentResponse.status === ServerActionStatus.ERROR || !welcomeContentResponse.data?.welcomeContent) {
        return null;
    }

    const { title, content, image_url ,alt_text} = welcomeContentResponse.data.welcomeContent;
    const titleParts = title.split(' ');
    const lastWord = titleParts.pop();
    const mainTitle = titleParts.join(' ');

    const hasImage = image_url && image_url.trim() !== '';

    return (
        // Use flex so children can stretch to the same height on wide screens.
        <section className={`flex flex-col ${hasImage ? 'lg:flex-row' : ''} items-stretch gap-6 max-sm:mt-6`}>
            {/* Text content - full width if no image, otherwise flex-1 */}
            <div className={`${hasImage ? 'flex-1' : 'w-full'} flex flex-col justify-center space-y-4 text-neutral-900 text-content-1 md:text-title-2 font-medium`}>
                <h2 className='text-h4 lg:text-h2 font-bold primary-gradient-600 w-fit'>
                    {mainTitle}{' '}{lastWord}
                </h2>
                <div className='welcome-text rich-text' dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Right: image - only render if image_url exists */}
            {hasImage && (
                    <div className='w-full max-w-md aspect-square rounded-md overflow-hidden'>
                        <Image
                            src={image_url}
                            width={500}
                            height={500}
                            alt={alt_text ?? title}
                            className='w-full h-full object-cover rounded-md block'
                            priority={false}
                        />
                    </div>
            )}
        </section>
    );
}

export default WelcomeSection
