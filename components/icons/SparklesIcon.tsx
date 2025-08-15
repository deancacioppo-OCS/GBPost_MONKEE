import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
    <path d="M5 2L6 5L9 6L6 7L5 10L4 7L1 6L4 5L5 2Z" />
    <path d="M19 14L18 17L15 18L18 19L19 22L20 19L23 18L20 17L19 14Z" />
  </svg>
);

export default SparklesIcon;