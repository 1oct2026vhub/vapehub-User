import BreadCrumbs from '@/components/BreadCrumbs'
import { getContactUs } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
import { sanitizeHtml } from '@/lib/sanitize-html'

const SocialMedia = async () => {
    const response = await getContactUs();
    const socialMediaInfo = response.status === ServerActionStatus.SUCCESS ? response.data : null;
    return (
        <main className='p-10'>
            <BreadCrumbs
                items={[
                    {
                        label: "Home",
                        href: "/",
                    },
                    {
                        label: `Social Media`,
                        href: ``,
                    },
                ]}
            />
            <section className="container-sm my-10 lg:my-20">
                <div className="space-y-4 text-title-2 text-skin-neutral-500 rich-text"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(socialMediaInfo?.social_media || '') }}
                />
            </section>
        </main>
    )
}

export default SocialMedia 