import BreadCrumbs from '@/components/BreadCrumbs'
import { getContactUs } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
import Link from 'next/link';
import { Metadata } from 'next';
// import parse from 'html-react-parser';

export const metadata: Metadata = {
  title: 'Contact | VapeHub',
  description: 'Get in touch with VapeHub. Send us a message or call us for any inquiries about our products and services.',
};

const ContactUs = async () => {
    const response = await getContactUs();
    const contactInfo = response.status === ServerActionStatus.SUCCESS ? response.data : null;
    return (
        <main className='p-10'>
            <BreadCrumbs
                items={[
                    {
                        label: "Home",
                        href: "/",
                    },
                    {
                        label: `Contact`,
                        href: ``,
                    },
                ]}
            />
            <section className="my-10 lg:my-20">
                <div>
                    <h1 className="primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit">Contact</h1>
                </div>
                <div className="flex flex-col gap-8 text-title-2 text-skin-neutral-500 mt-8">
                    <div className='space-y-2'>
                        <h2 className='text-h4 font-bold'>SEND US A MESSAGE</h2>
                        <div className='rich-text' dangerouslySetInnerHTML={{ __html: contactInfo?.send_us_a_message || '' }} />
                    </div>
                    <div className='space-y-2'>
                        <h2 className='text-h4 font-bold'>CALL US</h2>
                        <div className='rich-text' dangerouslySetInnerHTML={{ __html: contactInfo?.call_us || '' }} />
                    </div>
                    <div className='flex flex-col gap-2 text-skin-neutral-500'>
                        <h2 className='text-h4 font-bold'>YOU MAY HAVE YOUR QUESTIONS ANSWERED BY CLICKING ANY OF THE LINKS BELOW:</h2>
                        <div className='flex flex-col gap-2 text-title-1 font-semibold'>
                            <Link href="/delivery-information" className='text-skin-neutral-500'>– Delivery Information</Link>
                            <Link href="/privacy-policy" className='text-skin-neutral-500'>– Privacy Policy</Link>
                            <Link href="/returns-policy" className='text-skin-neutral-500'>– Returns Policy</Link>
                            <Link href="/terms-conditions" className='text-skin-neutral-500'>– Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ContactUs 