"use server";

import { revalidatePath } from "next/cache";
import { saveSmtpConfig } from "./settings";
import { sendTestEmail } from "./email";

function readString(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function readNumber(form: FormData, key: string, fallback: number): number {
  const v = form.get(key);
  if (typeof v !== "string") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function readBool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

/**
 * Sauvegarde la config SMTP. Si le champ password est vide, on garde
 * l'existant — utile pour modifier juste le host ou le port sans devoir
 * resaisir le mot de passe.
 */
export async function saveSmtpAction(formData: FormData) {
  const host = readString(formData, "host");
  const port = readNumber(formData, "port", 587);
  const secure = readBool(formData, "secure");
  const user = readString(formData, "user");
  const password = readString(formData, "password");
  const fromEmail = readString(formData, "fromEmail");
  const fromName = readString(formData, "fromName") ?? "InesPNJ";

  if (!host) throw new Error("Hôte SMTP requis");
  if (!user) throw new Error("Utilisateur SMTP requis");
  if (!fromEmail) throw new Error("Email expéditeur requis");

  await saveSmtpConfig({
    host,
    port,
    secure,
    user,
    password: password ?? "",
    fromEmail,
    fromName,
    passwordChanged: password !== null,
  });

  revalidatePath("/shop/admin/settings");
}

/**
 * Envoie un email de test à l'adresse fournie pour valider la conf SMTP.
 * Stocke le résultat dans un cookie temporaire pour qu'il soit affichable
 * après le redirect (pattern Next 14 actions sans encore d'API native).
 */
export async function sendTestEmailAction(formData: FormData) {
  const to = readString(formData, "test_to");
  if (!to) throw new Error("Destinataire requis");
  const result = await sendTestEmail(to);
  if (!result.ok) {
    throw new Error(`Test SMTP : ${result.reason}`);
  }
  revalidatePath("/shop/admin/settings");
}
