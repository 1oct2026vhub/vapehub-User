import Image from 'next/image'
import React from 'react'

const WelcomeSection = () => {
    return (
        <section className='bg-white p-6 rounded-2xl md:rounded-3xl shadow-card grid grid-cols-1 lg:grid-cols-2 items-stretch gap-6 max-sm:mt-6'>
            <div className='space-y-4 text-neutral-900 text-content-1 md:text-title-2 font-medium'>
                <h1 className='text-h4 lg:text-h2 font-bold'>Welcome to <span className='primary-gradient-600'>Vapehub</span></h1>
                <p>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                </p>
                <p>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s.
                </p>
                <p>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                </p>
            </div>
            <div>
                <Image 
                    src='/images/banner-3.png'
                    width={700}
                    height={300}
                    alt='Welcome Banner'
                    className='aspect-video w-full object-fill max-w-full rounded-lg self-stretch'
                />
            </div>
        </section>
    )
}

export default WelcomeSection