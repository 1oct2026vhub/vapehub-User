import type { Config } from "tailwindcss";
import { nextui } from '@nextui-org/react';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        skin: {
          white: "var(--background-white)",
          black: "var(--foreground-black)",
          base: "var(--background-base)",

          'primary-50': "var(--primary-50)",
          'primary-100': "var(--primary-100)",
          'primary-200': "var(--primary-200)",
          'primary-300': "var(--primary-300)",
          'primary-400': "var(--primary-400)",
          'primary-500': "var(--primary-500)",

          'primary2-400': "var(--primary2-400)",
          'primary2-500': "var(--primary2-500)",

          'primary-gradient-100': "var(--primary-gradient-100)",
          'primary-gradient-400': "var(--primary-gradient-400)",
          'primary-gradient-500': "var(--primary-gradient-500)",

          'neutral-100': "var(--neutral-100)",
          'neutral-200': "var(--neutral-200)",
          'neutral-300': "var(--neutral-300)",
          'neutral-400': "var(--neutral-400)",
          'neutral-500': "var(--neutral-500)",

          'blue-300': "var(--blue-300)",
          'blue-400': "var(--blue-400)",
          'blue-500': "var(--blue-500)",

          'blue-gradient': "var(--blue-gradient)",

          'red-200': "var(--red-200)",
          'red-300': "var(--red-300)",
          'red-400': "var(--red-400)",
          'red-500': "var(--red-500)",
          'red-600': "var(--red-600)",

          'red-gradient': "var(--red-gradient)",

          'border': "var(--border)",
        },
      },
      fontSize: {
        h1: ["3.75rem", { lineHeight: "140%" },], //60px
        h2: ["3rem", { lineHeight: "140%" },], //48px
        h3: ["2.5rem", { lineHeight: "140%" },], //40px
        h4: ["2rem", { lineHeight: "140%" },], //32px
        h5: ["1.5rem", { lineHeight: "140%" },], //24px
        'title-1': ["1.25rem", { lineHeight: "140%" },], //20px
        'title-2': ["1rem", { lineHeight: "140%" },], //16px
        'content-1': ["0.875rem", { lineHeight: "140%", },], //14px
        'content-2': ["0.75rem", { lineHeight: "140%", },], //12px
        'content-3': ["0.625rem", { lineHeight: "140%", },], //10px
        '22': ["1.375rem", { lineHeight: "120%", },], //22px
      },
      backgroundImage: {
        'primary-gradient-100': "var(--primary-gradient-100)",
        'primary-gradient-400': "var(--primary-gradient-400)",
        'primary-gradient-500': "var(--primary-gradient-500)",
        'blue-gradient': "var(--blue-gradient)",
        'red-gradient': "var(--red-gradient)",
        'notification-banner-gradient': "var(--notification-banner-gradient)",
        'footer-gradient': "var(--footer-gradient)",
      },
      spacing: {
        '4.5': '1.125rem', //18px
        '5.5': '1.375rem', //18px
        '7.5': '1.875rem', //30px
        '9.5': '2.375rem', //38px
        '10.5': '2.625rem', //42px
        '12.5': '3.125rem', //50px
        '17.5': '4.375rem', //70px
      },
      height: {
        '14.5': '3.625rem', //58px
      },
      maxHeight: {
        '12.5': '3.125rem' //50px
      }
    },
  },
  plugins: [nextui({ addCommonColors: true })],
} satisfies Config;
