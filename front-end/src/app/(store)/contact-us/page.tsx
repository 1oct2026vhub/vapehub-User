import BreadCrumbs from '@/components/BreadCrumbs'
import { getContactUs } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
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
            </section>
        </main>
    )
}

export default ContactUs 