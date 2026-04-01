/* ──────────────────────────────────────────────────────
   PlaceIQ — Global Animation Variants
   Reusable Framer Motion primitives for consistent UX
────────────────────────────────────────────────────── */

/** Page-level enter/exit transitions */
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

/** Card entrance animation */
export const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Stagger parent — apply to a container wrapping multiple cardVariants children */
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07 },
  },
};

/** List item slide-in (left → right) */
export const listItem = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

/** Spring-based scale-on-hover helper — spread onto motion elements */
export const scaleOnHover = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap:   { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};

/** Primary button press effect */
export const buttonHover = {
  whileHover: {
    scale: 1.03,
    boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
  },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};

/** Icon button (bell, toggle, etc.) */
export const iconButtonHover = {
  whileHover: { scale: 1.1, rotate: 15 },
  whileTap:   { scale: 0.9 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

/** Toast slide-in/out */
export const toastVariants = {
  initial: { x: 100, opacity: 0, scale: 0.9 },
  animate: { x: 0, opacity: 1, scale: 1 },
  exit:    { x: 100, opacity: 0, scale: 0.9 },
};

/** Notification dropdown */
export const dropdownVariants = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.96 },
};

/** Badge pop */
export const badgePop = {
  initial:    { scale: 0 },
  animate:    { scale: 1 },
  transition: { type: 'spring', stiffness: 500, damping: 20 },
};
