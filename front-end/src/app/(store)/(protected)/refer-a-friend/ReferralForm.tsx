'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendReferralCode } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { toast } from 'sonner';
import { FacebookShareIcon, TwitterXIcon, WhatsAppIcon } from '@/components/Icons';
import { Button } from '@nextui-org/button';
import InputForm from '@/components/InputForm';
import { Form } from '@/components/ui/Form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface ReferralFormProps {
    referralCode: string;
}

export default function ReferralForm({ referralCode }: ReferralFormProps) {
    const [copied, setCopied] = useState(false);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}?referral_code=${referralCode}`;
    const shareMessage = encodeURIComponent(`Check out this awesome store! Sign up using my referral link to receive a discount on your first purchase.`);
    const {status} = useSession();
    const router = useRouter();
    const form = useForm<EmailFormData>({
        mode: 'all',
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: ''
        }
    });

    const socialLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareMessage}`,
        whatsapp: `https://wa.me/?text=${shareMessage}%20${encodeURIComponent(shareUrl)}`
    };

    const onSubmit = async (data: EmailFormData) => {
        try {
            const response = await sendReferralCode({
                email: data.email,
                referral_code: referralCode
            });
            if (response.status === ServerActionStatus.SUCCESS) {
                form.reset();
                toast.success(response.data.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error sending referral:', error);
            toast.error('Error sending referral');
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
             router.push(ROUTES.MY_ACCOUNT);
        }
    }, [status]);
    return (
        <div className="w-full flex flex-col gap-4">

            <div className='flex gap-4 gap-1 justify-center items-center'>
                <p className='text-content-1 font-semibold rounded-10 bg-skin-neutral-50 px-4 py-3 truncate'>{shareUrl}</p>
                <Button
                    radius="sm"
                    color="primary"
                    className="btn primary-btn shadow-input w-fit !min-w-fit text-content-1 !px-4 !py-2 !rounded-10 "
                    onPress={copyToClipboard}
                >
                    {copied ? 'Copied' : 'Copy'}
                </Button>

            </div>
            <div className='flex gap-4 flex-wrap justify-center'>
                <Button
                    variant='bordered'
                    color='default'
                    className="btn shadow-input w-fit !min-w-fit text-content-1 !px-4 !py-2 !rounded-10 mt-4 xl:mt-8"
                    startContent={<FacebookShareIcon width={15} height={15} />}
                    onPress={() => window.open(socialLinks.facebook, '_blank')}
                >
                    <span className='max-sm:hidden'>Share via Facebook</span>
                </Button>
                <Button
                    variant='bordered'
                    color='default'
                    className="btn shadow-input w-fit !min-w-fit text-content-1 !px-4 !py-2 !rounded-10 mt-4 xl:mt-8"
                    startContent={<TwitterXIcon width={15} height={15} />}
                    onPress={() => window.open(socialLinks.twitter, '_blank')}
                >
                    <span className='max-sm:hidden'>Share via X</span>
                </Button>
                <Button
                    variant='bordered'
                    color='default'
                    className="btn shadow-input w-fit !min-w-fit text-content-1 !px-4 !py-2 !rounded-10 mt-4 xl:mt-8"
                    startContent={<WhatsAppIcon width={15} height={15} />}
                    onPress={() => window.open(socialLinks.whatsapp, '_blank')}
                >
                    <span className='max-sm:hidden'>Share via WhatsApp</span>
                </Button>

            </div>
            <p className='text-content-1 font-semibold text-center'>OR</p>
            <Form {...form}>
                <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 flex-col md:flex-row">
                    <div className='w-full'>
                        <InputForm
                            control={form.control}
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="Enter friend's email"
                            isRequired={true}
                        />

                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        radius="sm"
                        color="primary"
                        className="btn primary-btn shadow-input w-full md:w-fit !min-w-fit text-content-1 !px-4 !py-2 !rounded-10 "
                        isLoading={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </form>
            </Form>
        </div>
    );
} 