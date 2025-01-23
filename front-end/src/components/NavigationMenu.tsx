import React from "react";

const NavigationMenu = () => {
  const menuItems = ["New", "Disposables", "Pod Kits", "Vape Kits", "Nic Salts", 
    "E-liquids", "Pouches & Strips", "Hardware", "Brands", "Blogs", "Deals"];

  return (
    <div className="hidden lg:block">
      <ul className="inline-flex flex-wrap items-center justify-center xl:justify-between w-full">
        {menuItems.map((item, index) => (
          <li key={index}>
            <a href="#" className="px-3 rounded-md text-shadow text-lg text-skin-neutral-400 uppercase font-extrabold hover:opacity-70 transition-all duration-200 ease-in">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;
