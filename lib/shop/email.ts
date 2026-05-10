// Envoi d'emails via SMTP. Utilise nodemailer (TCP socket, fonctionne sur les
// fonctions serverless Vercel). Les credentials sont lus depuis shop_settings
// à chaque envoi — pas de transporteur cached entre invocations.
//
// Best-effort : si SMTP n'est pas configuré ou l'envoi rate, on log et on
// renvoie false. On ne lance JAMAIS une erreur qui casserait le flow admin
// (changement de statut, etc.). Les emails sont un nice-to-have.

import nodemailer from "nodemailer";
import { getSmtpConfig, type SmtpConfig } from "./settings";

export type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: string };

function buildTransporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
  });
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    return { ok: false, reason: "SMTP non configuré" };
  }
  try {
    const transporter = buildTransporter(cfg);
    const info = await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    return { ok: true, messageId: info.messageId };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

/** Test rapide : envoie un email "Hello world" pour valider la conf. */
export async function sendTestEmail(to: string): Promise<SendResult> {
  return sendEmail({
    to,
    subject: "Test SMTP · Boutique InesPNJ",
    html: `<div style="font-family:Inter,system-ui,sans-serif;line-height:1.5;color:#111">
      <h1 style="font-weight:600;margin:0 0 12px">SMTP configuré ✓</h1>
      <p>Si tu reçois ce mail, ta config SMTP fonctionne — les notifications de livraison s'enverront aux clients sans intervention manuelle.</p>
      <p style="color:#666;font-size:13px;margin-top:24px">Envoyé depuis /shop/admin/settings · Boutique InesPNJ</p>
    </div>`,
    text: "SMTP configuré. Si tu reçois ce mail, ta config SMTP fonctionne.",
  });
}

// ---------------------------------------------------------------
// Notifications transactionnelles
// ---------------------------------------------------------------

type ShippingInfo = {
  fullName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
};

function shippingAddressHtml(shipping: ShippingInfo | null): string {
  if (!shipping) return "";
  const lines = [
    shipping.fullName,
    shipping.addressLine1,
    shipping.addressLine2,
    [shipping.postalCode, shipping.city].filter(Boolean).join(" "),
    shipping.country,
  ].filter(Boolean);
  if (lines.length === 0) return "";
  return `<p style="color:#444;margin:16px 0">${lines.join("<br>")}</p>`;
}

export async function sendOrderShippedEmail(args: {
  to: string;
  orderRef: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  shipping?: ShippingInfo | null;
}): Promise<SendResult> {
  const tracking =
    args.carrier || args.trackingNumber
      ? `<p style="margin:16px 0">
          ${args.carrier ? `Transporteur : <strong>${args.carrier}</strong><br>` : ""}
          ${args.trackingNumber ? `N° de suivi : <strong>${args.trackingNumber}</strong>` : ""}
        </p>`
      : "";
  return sendEmail({
    to: args.to,
    subject: `Ta commande ${args.orderRef} a été expédiée ✓`,
    html: `<div style="font-family:Inter,system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px">
      <h1 style="font-weight:600;margin:0 0 12px">Ta commande est partie 🚀</h1>
      <p>Ta commande <strong>${args.orderRef}</strong> vient d'être expédiée. Tu vas la recevoir d'ici quelques jours.</p>
      ${tracking}
      ${shippingAddressHtml(args.shipping ?? null)}
      <p style="color:#666;font-size:13px;margin-top:24px">Merci pour ta commande sur la boutique InesPNJ ❤️</p>
    </div>`,
    text: `Ta commande ${args.orderRef} a été expédiée. ${args.carrier ? `Transporteur : ${args.carrier}. ` : ""}${args.trackingNumber ? `N° de suivi : ${args.trackingNumber}. ` : ""}`,
  });
}

export async function sendOrderDeliveredEmail(args: {
  to: string;
  orderRef: string;
}): Promise<SendResult> {
  return sendEmail({
    to: args.to,
    subject: `Ta commande ${args.orderRef} est arrivée ✓`,
    html: `<div style="font-family:Inter,system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px">
      <h1 style="font-weight:600;margin:0 0 12px">Ta commande est arrivée 📦</h1>
      <p>D'après le suivi, ta commande <strong>${args.orderRef}</strong> vient d'être livrée. On espère que tu vas kiffer le merch !</p>
      <p>Si quelque chose cloche (article manquant, taille, etc.) réponds à cet email, on s'en occupe.</p>
      <p style="color:#666;font-size:13px;margin-top:24px">Merci pour ta commande sur la boutique InesPNJ ❤️</p>
    </div>`,
    text: `Ta commande ${args.orderRef} a été livrée. Merci !`,
  });
}
