import * as React from "react";
import type { SVGProps } from "react";
const SvgSparkle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path fill="currentColor" d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    <circle cx={5} cy={6} r={1.5} fill="currentColor" />
    <circle cx={19} cy={8} r={1} fill="currentColor" />
  </svg>
);
export default SvgSparkle;
