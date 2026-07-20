import Link from "next/link";

const DESIGN_TYPE_BUTTONS = [
  { label: "Shop 10ml Nic Salts", href: "/nic-salts" },
  { label: "Shortfill Vape Juice", href: "/shortfills" },
  { label: "50/50 Vape Juice", href: "/50-50-vape-juice" },
  { label: "Freebase E-Liquids", href: "/e-liquids" },
] as const;

const DesignTypeButtons = () => {
  return (
    <div className="mt-4 rounded-2xl border border-skin-neutral-100 bg-skin-neutral-50 p-3 shadow-card">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
      {DESIGN_TYPE_BUTTONS.map((button) => (
        <Link
          key={button.href}
          href={button.href}
          prefetch={false}
          className="w-full min-h-[44px] flex items-center justify-center btn primary-btn shadow-button !rounded-10 uppercase font-oswald font-semibold text-skin-white text-title-2 md:text-title-1 !py-3 !px-4 text-center transition-opacity hover:opacity-90"
        >
          {button.label}
        </Link>
      ))}
      </div>
    </div>
  );
};

export default DesignTypeButtons;

