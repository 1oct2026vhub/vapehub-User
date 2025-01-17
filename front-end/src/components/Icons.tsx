import { JSX, SVGProps } from 'react';

export const ShoppingCartIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="29"
      height="29"
      fill="none"
      viewBox="0 0 29 29"
      {...props}
    >
      <g fill="#091410" filter="url(#filter0_d_798_3902)">
        <path d="M19.46 26.247a2.042 2.042 0 1 0 0-4.083 2.042 2.042 0 0 0 0 4.083M10.124 26.247a2.042 2.042 0 1 0 0-4.083 2.042 2.042 0 0 0 0 4.083M6.145 4.6l-.233 2.858a.925.925 0 0 0 .933 1.003h17.862c.49 0 .898-.373.933-.863.152-2.065-1.423-3.745-3.488-3.745H7.837a3.2 3.2 0 0 0-.712-1.412 3.06 3.06 0 0 0-2.228-.98H2.832a.88.88 0 0 0-.875.875c0 .478.397.875.875.875h2.03c.362 0 .7.152.945.408.245.269.362.619.338.98M24.43 10.21H6.533a.94.94 0 0 0-.933.853l-.42 5.075c-.164 1.983 1.4 3.698 3.395 3.698h12.973c1.75 0 3.29-1.435 3.418-3.185l.385-5.448a.913.913 0 0 0-.921-.992"></path>
      </g>
      <defs>
        <filter
          id="filter0_d_798_3902"
          width="30"
          height="30"
          x="-0.5"
          y="0"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="1"></feOffset>
          <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_798_3902"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_798_3902"
            result="shape"
          ></feBlend>
        </filter>
      </defs>
    </svg>
  );
};

export const UserIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="29"
      height="28"
      fill="none"
      viewBox="0 0 29 28"
      {...props}
    >
      <g filter="url(#filter0_d_798_3915)">
        <path
          fill="#091410"
          d="M14.5 14c2.888 0 5.25-2.363 5.25-5.25S17.388 3.5 14.5 3.5 9.25 5.863 9.25 8.75 11.612 14 14.5 14m0 2.625c-3.478 0-10.5 1.772-10.5 5.25V24.5h21v-2.625c0-3.478-7.022-5.25-10.5-5.25"
        ></path>
      </g>
      <defs>
        <filter
          id="filter0_d_798_3915"
          width="23"
          height="23"
          x="3"
          y="3.5"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="1"></feOffset>
          <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_798_3915"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_798_3915"
            result="shape"
          ></feBlend>
        </filter>
      </defs>
    </svg>
  )
};

export const MenuIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
      {...props}
    >
      <path stroke="#000" strokeWidth="2" d="M0 6h22M0 11h22M0 16h22"></path>
    </svg>
  )
};

export const SearchIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
      {...props}
    >
      <path
        stroke="#091410"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.375"
        d="M10.541 19.249a8.708 8.708 0 1 0 0-17.417 8.708 8.708 0 0 0 0 17.417M20.166 20.165l-1.833-1.833"
      ></path>
    </svg>
  )
};

export const InstagramIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      viewBox="0 0 48 48"
      {...props}
    >
      <path
        stroke="#fff"
        strokeWidth="1.843"
        d="M24 47c12.703 0 23-10.297 23-23S36.703 1 24 1 1 11.298 1 24s10.298 23 23 23Z"
        clipRule="evenodd"
        opacity="0.44"
      ></path>
      <path
        fill="#fff"
        d="M30.272 16.466a1.262 1.262 0 1 0 0 2.524 1.262 1.262 0 0 0 0-2.524m4.836 2.544a8 8 0 0 0-.484-2.554 5.2 5.2 0 0 0-1.22-1.861 4.94 4.94 0 0 0-1.86-1.21 7.7 7.7 0 0 0-2.555-.494c-1.115-.063-1.472-.063-4.332-.063s-3.218 0-4.332.063a7.7 7.7 0 0 0-2.555.494 5 5 0 0 0-1.861 1.21 4.94 4.94 0 0 0-1.21 1.86 7.7 7.7 0 0 0-.493 2.556c-.063 1.114-.063 1.472-.063 4.331s0 3.218.063 4.332c.018.874.185 1.738.494 2.555.257.704.67 1.34 1.209 1.861.522.537 1.158.95 1.861 1.21a7.7 7.7 0 0 0 2.555.494c1.114.063 1.472.063 4.332.063s3.217 0 4.332-.063a7.7 7.7 0 0 0 2.555-.495 4.94 4.94 0 0 0 1.86-1.209 5.1 5.1 0 0 0 1.22-1.86c.3-.82.464-1.683.484-2.556 0-1.114.063-1.472.063-4.332s0-3.217-.063-4.331m-1.892 8.538a5.9 5.9 0 0 1-.358 1.956 3.2 3.2 0 0 1-.789 1.209 3.35 3.35 0 0 1-1.209.788 5.9 5.9 0 0 1-1.955.358c-1.052.053-1.44.063-4.206.063-2.765 0-3.154 0-4.206-.063a6 6 0 0 1-2.04-.315c-.435-.181-.829-.45-1.156-.789a3.15 3.15 0 0 1-.778-1.21 5.8 5.8 0 0 1-.42-1.997c0-1.051-.064-1.44-.064-4.206 0-2.765 0-3.154.063-4.205.005-.683.13-1.359.368-1.998.185-.444.47-.84.83-1.157.32-.361.715-.648 1.157-.84a6 6 0 0 1 1.998-.358c1.052 0 1.44-.063 4.206-.063 2.765 0 3.154 0 4.206.063a5.9 5.9 0 0 1 1.955.357c.478.178.907.466 1.251.841.345.323.614.718.789 1.157.234.64.355 1.316.358 1.998.052 1.051.063 1.44.063 4.205s-.01 3.155-.064 4.206m-8.56-9.6a5.394 5.394 0 1 0 5.405 5.394 5.384 5.384 0 0 0-5.404-5.393m0 8.896a3.501 3.501 0 1 1 .001-7.003 3.501 3.501 0 0 1 0 7.003"
      ></path>
    </svg>
  )
};

export const FacebookIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="49"
      height="48"
      fill="none"
      viewBox="0 0 49 48"
      {...props}
    >
      <path
        stroke="#fff"
        strokeWidth="1.843"
        d="M24.428 47c12.702 0 23-10.297 23-23s-10.298-23-23-23-23 10.298-23 23 10.297 23 23 23Z"
        clipRule="evenodd"
        opacity="0.44"
      ></path>
      <path
        fill="#fff"
        d="M28.118 15.678h3.032a.513.513 0 0 0 .506-.52v-3.122a.513.513 0 0 0-.506-.52h-3.032c-3.066 0-5.56 2.566-5.56 5.722v3.642h-3.539a.513.513 0 0 0-.505.52v3.122c0 .287.226.52.505.52h3.538v10.925c0 .287.227.52.506.52h3.033a.513.513 0 0 0 .505-.52V25.042h3.538a.51.51 0 0 0 .48-.356l1.012-3.122a.53.53 0 0 0-.07-.469.5.5 0 0 0-.41-.215H26.6v-3.642c0-.86.68-1.56 1.517-1.56"
      ></path>
    </svg>
  )
};

export const TwitterIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      viewBox="0 0 48 48"
      {...props}
    >
      <path
        stroke="#fff"
        strokeWidth="1.843"
        d="M24 47c12.703 0 23-10.297 23-23S36.703 1 24 1 1 11.298 1 24s10.298 23 23 23Z"
        clipRule="evenodd"
        opacity="0.44"
      ></path>
      <path
        fill="#fff"
        d="M33.848 35.17h-6.77l-5.08-7.564-6.362 7.563h-2.808l7.924-9.414-7.804-11.614h6.77l4.802 7.148 6.012-7.148h2.808l-7.573 8.998 8.09 12.03zm-6.327-.86h4.738l-7.554-11.237 6.806-8.092h-.6l-6.474 7.696-5.172-7.696h-4.738l7.278 10.821-7.157 8.508h.6l6.825-8.111zm4-.397h-3.64l-12.633-18.47h3.638zm-3.205-.85h1.597l-11.46-16.76h-1.598z"
      ></path>
    </svg>
  )
};

export const EyeOpenIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        stroke="#3A4340"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15.58 12.002c0 1.98-1.6 3.58-3.58 3.58s-3.58-1.6-3.58-3.58 1.6-3.58 3.58-3.58 3.58 1.6 3.58 3.58"
      ></path>
      <path
        stroke="#292D32"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 20.269c3.53 0 6.82-2.08 9.11-5.68.9-1.41.9-3.78 0-5.19-2.29-3.6-5.58-5.68-9.11-5.68s-6.82 2.08-9.11 5.68c-.9 1.41-.9 3.78 0 5.19 2.29 3.6 5.58 5.68 9.11 5.68"
      ></path>
    </svg>
  )
};

export const EyeClosedIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="#3A4340"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m14.53 9.472-5.06 5.06a3.576 3.576 0 1 1 5.06-5.06"
    ></path>
    <path
      stroke="#292D32"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M17.82 5.767c-1.75-1.32-3.75-2.04-5.82-2.04-3.53 0-6.82 2.08-9.11 5.68-.9 1.41-.9 3.78 0 5.19.79 1.24 1.71 2.31 2.71 3.17M8.42 19.53c1.14.48 2.35.74 3.58.74 3.53 0 6.82-2.08 9.11-5.68.9-1.41.9-3.78 0-5.19-.33-.52-.69-1.01-1.06-1.47"
    ></path>
    <path
      stroke="#292D32"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M15.51 12.703a3.565 3.565 0 0 1-2.82 2.82M9.47 14.531 2 22.001M22 2l-7.47 7.47"
    ></path>
  </svg>
  )
};