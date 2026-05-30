import Loader from '@/components/ui/Loader';

/** Centered loader on PDP while product detail APIs are in flight. */
export default function ProductDetailLoading() {
  return (
    <main
      className="px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 min-h-[60vh] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading product"
    >
      <Loader className="h-auto min-h-[40vh] w-full" loaderText="Loading product..." />
    </main>
  );
}
