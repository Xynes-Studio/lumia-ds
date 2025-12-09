import * as React from "react";
import type { SVGProps } from "react";
const SvgChatBubble = (props: SVGProps<SVGSVGElement>) => (
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
      strokeWidth={1.5}
      d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-3 3v-3H5a2.5 2.5 0 0 1-2.5-2.5v-7Z"
    />
    <circle cx={9} cy={9.5} r={1} fill="currentColor" />
    <circle cx={12} cy={9.5} r={1} fill="currentColor" />
    <circle cx={15} cy={9.5} r={1} fill="currentColor" />
  </svg>
);
export default SvgChatBubble;
