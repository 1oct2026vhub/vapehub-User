import { FunctionComponent, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  error: string;
  description: string;
  redirect?: {
    link: string;
    name: string;
  };
  actionSlot?: ReactNode;
  variant?: 'default' | 'no-background' | 'avatar-player';
}

const UiError: FunctionComponent<Props> = ({
  error,
  description,
  redirect,
  actionSlot,
  variant = 'default',
}): ReactElement => {
  return (
    <div
      className={cn(
        'flex h-dvh overflow-auto bg-background-heart bg-cover bg-right-bottom bg-no-repeat',
        variant !== 'default' && 'h-full bg-transparent'
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center bg-skin-base backdrop-blur-sm',
          variant !== 'default' && 'bg-transparent backdrop-blur-0'
        )}
      >
        <div className='flex flex-col items-center gap-5 rounded-3xl p-8'>
          <span
            className={cn(
              'h-16 w-32 bg-empty-state bg-contain bg-center bg-no-repeat md:h-28 md:w-56',
              variant === 'avatar-player' && 'brightness-0 grayscale invert'
            )}
          ></span>
          <div className='flex flex-col gap-1'>
            <p
              className={cn(
                'text-center text-xl font-bold text-skin-primary-500 md:text-3xl',
                variant === 'avatar-player' && 'text-white'
              )}
            >
              {error ?? 'An error occurred'}
            </p>
            <p
              className={cn(
                'text-center text-lg text-skin-neutral-400',
                variant === 'avatar-player' && 'text-white'
              )}
            >
              {description}
            </p>
          </div>
          {redirect && (
            <div className='inline-flex justify-center gap-1'>
              <p className='text-skin-neutral-500 text-title-2'>Back to</p>
              <Link
                href={redirect.link}
                replace
                className='text-title-2 font-semibold text-skin-primary-500'
              >
                {redirect.name}
              </Link>
            </div>
          )}
          {actionSlot}
        </div>
      </div>
    </div>
  );
};

export default UiError;
