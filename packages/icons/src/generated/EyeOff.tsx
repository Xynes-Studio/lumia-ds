import * as React from "react";
import type { SVGProps } from "react";
const SvgEyeOff = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2 12s3.5-7 10-7c2.1 0 3.9.6 5.4 1.6"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.5 8.5A3.9 3.9 0 0 0 8 12c0 2.2 1.8 4 4 4 1.1 0 2.1-.5 2.8-1.2M22 12s-1.6 3.2-4.8 5.3M3 3l18 18"
    />
  </svg>
);
export default SvgEyeOff;
