import * as React from "react";
import type { SVGProps } from "react";
const SvgEye = (props: SVGProps<SVGSVGElement>) => (
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
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7"
    />
    <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={2} />
  </svg>
);
export default SvgEye;
