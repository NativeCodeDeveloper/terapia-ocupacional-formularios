"use client";

import { motion, useReducedMotion } from "framer-motion";

/* Aparición sutil al entrar en pantalla: se funde y sube 16 px.
   Con movimiento reducido solo se funde, sin desplazamiento, y en
   cualquier caso se ejecuta una sola vez por elemento. */
export default function Aparicion({ children, className, demora = 0 }) {
  const reducir = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducir ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay: demora }}
    >
      {children}
    </motion.div>
  );
}
