---
'@lumia-ui/cli': patch
---

Reject unsafe or malformed SVG input before generating icon components. Parse a bounded static SVG subset, emit escaped JSX instead of template literals/raw HTML, and preserve previous generated output when any input or name fails validation. Scripts, event/URL-bearing markup, CSS, animation, foreign content, interpolation, and unsupported SVG features now fail closed.
