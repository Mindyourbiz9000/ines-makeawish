"use client";

// Wrapper de <form> qui :
//   • soumet sur Entrée dans un champ texte/number/email
//   • affiche un état de chargement et un toast "✓ Enregistré" temporaire
// Le contenu peut être un render-prop pour pouvoir refléter l'état dans
// le bouton (ex. label "Enregistrement…").

import {
  useRef,
  useState,
  useTransition,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";

export type EnterSubmitFormState = {
  pending: boolean;
  justSaved: boolean;
};

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "children"> & {
  action: (formData: FormData) => void | Promise<unknown>;
  children: ReactNode | ((state: EnterSubmitFormState) => ReactNode);
};

export default function EnterSubmitForm({
  action,
  children,
  ...formProps
}: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  function handle(formData: FormData) {
    startTransition(async () => {
      await action(formData);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2400);
    });
  }

  return (
    <form
      {...formProps}
      ref={ref}
      action={handle}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const target = e.target as HTMLElement;
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
      {typeof children === "function"
        ? children({ pending, justSaved })
        : children}
    </form>
  );
}
