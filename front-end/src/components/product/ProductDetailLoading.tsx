import { Spinner } from '@nextui-org/react';

/** Shown on the product detail route while server data is loading (loading.tsx). */
export default function ProductDetailLoading() {
  return (
    <main className="px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10 min-h-[60vh]">
      <div className="h-4 w-48 rounded bg-skin-neutral-100 animate-pulse" aria-hidden />
      <section className="bg-skin-white p-4 md:p-6 xl:p-7.5 rounded-10 shadow-card flex flex-col lg:flex-row gap-6 xl:gap-11">
        <div className="w-full lg:w-1/2 aspect-square max-h-[420px] rounded-lg bg-skin-neutral-100 animate-pulse" aria-hidden />
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-8 w-3/4 max-w-md rounded bg-skin-neutral-100 animate-pulse" aria-hidden />
          <div className="h-5 w-1/3 rounded bg-skin-neutral-100 animate-pulse" aria-hidden />
          <div className="h-10 w-32 rounded bg-skin-neutral-100 animate-pulse" aria-hidden />
          <div className="h-12 w-full max-w-sm rounded-lg bg-skin-neutral-100 animate-pulse" aria-hidden />
          <div className="h-12 w-full max-w-sm rounded-lg bg-skin-neutral-100 animate-pulse" aria-hidden />
          <div className="h-11 w-40 rounded bg-skin-neutral-100 animate-pulse" aria-hidden />
        </div>
      </section>
      <div
        className="flex flex-col items-center justify-center gap-3 py-6"
        role="status"
        aria-live="polite"
        aria-label="Loading product"
      >
        <Spinner
          color="success"
          label="Loading product..."
          classNames={{
            label: 'text-skin-neutral-500 mt-2 font-opensans text-sm',
            circle1: 'border-skin-primary-500',
          }}
        />
      </div>
    </main>
  );
}
