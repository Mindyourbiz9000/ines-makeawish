"use client";

// Petit wrapper de <form> qui s'assure que la touche Entrée dans un champ
// texte/number/email soumet le formulaire. Standard HTML mais certains
// setups (file inputs + multipart + server actions) peuvent saboter le
// comportement implicite.

import { useRef, type FormHTMLAttributes, type ReactNode } from "react";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export default function EnterSubmitForm({ children, ...formProps }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      {...formProps}
      ref={ref}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const target = e.target as HTMLElement;
        // Laisse Entrée faire sa job dans les textareas et boutons.
        if (
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          (target as HTMLInputElement).type === "submit"
        )
          return;
        e.preventDefault();
        ref.current?.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}
