import BreadCrumbs from '@/components/BreadCrumbs'
import { getContactUs } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
import Link from 'next/link';
// import parse from 'html-react-parser';

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
                <div className="grid md:grid-cols-2 gap-8 text-title-2 text-skin-neutral-500">
                    <div className='space-y-2'>
                        <h2 className='text-title-1 font-bold'>SEND US A MESSAGE</h2>
                        <div dangerouslySetInnerHTML={{ __html: contactInfo?.send_us_a_message || '' }} />
                    </div>
                    <div className='space-y-2'>
                        <h2 className='text-title-1 font-bold'>CALL US</h2>
                        <div dangerouslySetInnerHTML={{ __html: contactInfo?.call_us || '' }} />
                    </div>
                </div>
                <div className='flex flex-col gap-2  items-center justify-center text-skin-neutral-500 mt-8'>
                  <h1 className='text-title-1 font-bold'>You may have your questions answered by clicking any of the links below:</h1>
                  <div className='flex flex-col gap-2'>
                  <Link href="/" className='text-skin-neutral-500'>– Delivery Information</Link>
                  <Link href="/" className='text-skin-neutral-500'>– Returns Policy</Link> 
                  <Link href="/" className='text-skin-neutral-500'>– Terms & Conditions</Link> 
                  </div>
                </div>
            </section>
        </main>
    )
}

export default ContactUs 