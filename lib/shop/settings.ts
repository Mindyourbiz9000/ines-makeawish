// Helpers serveur pour lire/écrire les paramètres admin dans shop_settings.
// Clé/valeur JSONB côté DB. Aucun accès client : tout passe par la secret key.

import { createServerClient } from "@/lib/supabase/server";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean; // true pour port 465 (SSL), false pour 587 (STARTTLS)
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export const SMTP_KEY = "smtp";

/**
 * Lit la config SMTP depuis shop_settings. Retourne null si jamais configurée.
 */
export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("shop_settings")
      .select("value")
      .eq("key", SMTP_KEY)
      .maybeSingle();
    if (!data?.value) return null;
    const v = data.value as Partial<SmtpConfig>;
    if (
      !v.host ||
      typeof v.port !== "number" ||
      !v.user ||
      !v.password ||
      !v.fromEmail
    ) {
      return null;
    }
    return {
      host: v.host,
      port: v.port,
      secure: !!v.secure,
      user: v.user,
      password: v.password,
      fromEmail: v.fromEmail,
      fromName: v.fromName ?? "InesPNJ",
    };
  } catch {
    return null;
  }
}

/**
 * Upsert la config SMTP. Le password reçu vide signifie "garde l'existant".
 */
export async function saveSmtpConfig(
  next: Partial<SmtpConfig> & { passwordChanged: boolean }
): Promise<void> {
  const supabase = createServerClient();
  const current = (await getSmtpConfig()) ?? {
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromEmail: "",
    fromName: "InesPNJ",
  };
  const merged: SmtpConfig = {
    host: next.host ?? current.host,
    port: next.port ?? current.port,
    secure: next.secure ?? current.secure,
    user: next.user ?? current.user,
    password: next.passwordChanged ? next.password ?? "" : current.password,
    fromEmail: next.fromEmail ?? current.fromEmail,
    fromName: next.fromName ?? current.fromName,
  };
  const { error } = await supabase
    .from("shop_settings")
    .upsert(
      { key: SMTP_KEY, value: merged as unknown },
      { onConflict: "key" }
    );
  if (error) throw new Error(`Save SMTP : ${error.message}`);
}

/** Variante "publique" pour l'admin UI : masque le password. */
export type SmtpConfigPublic = Omit<SmtpConfig, "password"> & {
  hasPassword: boolean;
};

export async function getSmtpConfigPublic(): Promise<SmtpConfigPublic | null> {
  const cfg = await getSmtpConfig();
  if (!cfg) return null;
  const { password: _password, ...rest } = cfg;
  return { ...rest, hasPassword: !!cfg.password };
}
