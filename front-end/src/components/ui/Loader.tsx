import { cn } from '@/lib/utils';
import {
  ComponentPropsWithoutRef,
  FunctionComponent,
  ReactElement,
} from 'react';

interface Props extends Pick<ComponentPropsWithoutRef<'div'>, 'className'> {
  loaderText?: string;
}

const Loader: FunctionComponent<Props> = ({
  className,
  loaderText = '',
}): ReactElement => {
  return (
    <div
      className={cn(
        'flex h-screen w-screen flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div className='loader mb-4 h-12 w-12 rounded-full border-4 border-t-4 border-gray-200 ease-linear'></div>
      <span className='text-center font-bold text-skin-neutral-500'>{loaderText}</span>
    </div>
  );
};

export default Loader;
