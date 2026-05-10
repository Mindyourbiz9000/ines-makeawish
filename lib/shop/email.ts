// Envoi d'emails via SMTP. Utilise nodemailer (TCP socket, fonctionne sur les
// fonctions serverless Vercel). Les credentials sont lus depuis shop_settings
// à chaque envoi — pas de transporteur cached entre invocations.
//
// Best-effort : si SMTP n'est pas configuré ou l'envoi rate, on log et on
// renvoie false. On ne lance JAMAIS une erreur qui casserait le flow admin
// (changement de statut, etc.). Les emails sont un nice-to-have.

import nodemailer from "nodemailer";
import { getSmtpConfig, type SmtpConfig } from "./settings";

const SHOP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://inespnj.com";

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

// ---------------------------------------------------------------
// Templates
// ---------------------------------------------------------------

/**
 * Wrapper d'email : card blanche centrée sur fond crème, bande de marque
 * néon-pink → néon-yellow en haut, signature InesPNJ en footer. Conçu pour
 * fonctionner partout (Gmail, Outlook, Apple Mail) — inline styles + tables.
 */
function shellHtml(args: {
  preheader: string;
  bodyHtml: string;
}): string {
  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f6f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0c1340">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${args.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:40px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(12,19,64,0.08)">
      <tr><td style="background:linear-gradient(90deg,#ff3aa6 0%,#ffd84a 100%);height:6px;line-height:6px;font-size:0">&nbsp;</td></tr>
      ${args.bodyHtml}
      <tr><td style="background:#f6f4f0;padding:20px 32px;text-align:center;font-size:11px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">© InesPNJ</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function trackingButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0">
  <tr><td style="border-radius:9999px;background:#0c1340">
    <a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase">${label} →</a>
  </td></tr>
</table>`;
}

type ShippingInfo = {
  fullName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
};

function shippingBlock(shipping: ShippingInfo | null): string {
  if (!shipping) return "";
  const lines = [
    shipping.fullName,
    shipping.addressLine1,
    shipping.addressLine2,
    [shipping.postalCode, shipping.city].filter(Boolean).join(" "),
    shipping.country,
  ].filter(Boolean);
  if (lines.length === 0) return "";
  return `<p style="margin:24px 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af">Adresse de livraison</p>
<p style="margin:0;font-size:14px;line-height:1.5;color:#374151">${lines
    .map((l) => escapeHtml(l ?? ""))
    .join("<br>")}</p>`;
}

function carrierBlock(carrier?: string | null, tracking?: string | null): string {
  if (!carrier && !tracking) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f4f0;border-radius:12px;padding:0;margin:0">
  <tr><td style="padding:16px 20px">
    ${
      carrier
        ? `<p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af">Transporteur</p>
           <p style="margin:4px 0 0;font-size:15px;font-weight:500;color:#0c1340">${escapeHtml(carrier)}</p>`
        : ""
    }
    ${
      tracking
        ? `<p style="margin:${carrier ? "12px" : "0"} 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af">N° de suivi</p>
           <p style="margin:4px 0 0;font-size:15px;font-family:'SF Mono',Menlo,monospace;color:#0c1340;word-break:break-all">${escapeHtml(tracking)}</p>`
        : ""
    }
  </td></tr>
</table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildTrackingUrl(ref: string, viewToken: string): string {
  return `${SHOP_BASE_URL}/orders/${encodeURIComponent(ref)}?t=${encodeURIComponent(viewToken)}`;
}

// ---------------------------------------------------------------
// Test mail
// ---------------------------------------------------------------

export async function sendTestEmail(to: string): Promise<SendResult> {
  const body = `<tr><td style="padding:36px 32px 28px">
  <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9ca3af">Boutique InesPNJ</p>
  <h1 style="margin:8px 0 0;font-size:26px;font-weight:600;line-height:1.2;color:#0c1340">SMTP configuré ✓</h1>
  <p style="margin-top:16px;font-size:15px;line-height:1.55;color:#374151">Si tu reçois ce mail, ta config SMTP fonctionne — les notifications de livraison s&apos;enverront aux clients sans intervention manuelle.</p>
  <p style="margin-top:24px;font-size:12px;color:#9ca3af">Envoyé depuis /shop/admin/settings.</p>
</td></tr>`;
  return sendEmail({
    to,
    subject: "Test SMTP · Boutique InesPNJ",
    html: shellHtml({
      preheader: "Ta config SMTP fonctionne.",
      bodyHtml: body,
    }),
    text: "SMTP configuré. Si tu reçois ce mail, ta config SMTP fonctionne.",
  });
}

// ---------------------------------------------------------------
// Notifications transactionnelles
// ---------------------------------------------------------------

type OrderLine = {
  code: string;
  name: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
};

function itemsTable(items: OrderLine[], totalCents: number): string {
  const rows = items
    .map(
      (i) => `<tr>
    <td style="padding:10px 0;font-size:14px;color:#0c1340;border-bottom:1px solid #f1ecdf">
      <strong>${escapeHtml(i.name)}</strong>
      <span style="color:#9ca3af"> · ${escapeHtml(i.size)} · ×${i.quantity}</span>
    </td>
    <td align="right" style="padding:10px 0;font-size:14px;color:#0c1340;border-bottom:1px solid #f1ecdf;font-variant-numeric:tabular-nums">
      ${(i.unit_price_cents * i.quantity / 100).toFixed(2)} €
    </td>
  </tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0">
  ${rows}
  <tr>
    <td style="padding:14px 0 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af">Total</td>
    <td align="right" style="padding:14px 0 0;font-size:20px;font-weight:600;color:#0c1340;font-variant-numeric:tabular-nums">
      ${(totalCents / 100).toFixed(2)} €
    </td>
  </tr>
</table>`;
}

export async function sendOrderPlacedCustomerEmail(args: {
  to: string;
  orderRef: string;
  viewToken: string;
  items: OrderLine[];
  totalCents: number;
  shipping?: ShippingInfo | null;
}): Promise<SendResult> {
  const trackingUrl = buildTrackingUrl(args.orderRef, args.viewToken);
  const body = `<tr><td style="padding:36px 32px 32px">
  <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9ca3af">Boutique InesPNJ</p>
  <h1 style="margin:8px 0 0;font-size:28px;font-weight:600;line-height:1.2;color:#0c1340">Merci pour ta commande ❤️</h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#374151">Ta commande <strong style="font-family:'SF Mono',Menlo,monospace;color:#0c1340">${escapeHtml(args.orderRef)}</strong> est bien enregistrée. L&apos;équipe te recontacte sous 24h pour finaliser le règlement, puis on prépare l&apos;expédition.</p>
  ${trackingButton(trackingUrl, "Suivre ma commande")}
  ${itemsTable(args.items, args.totalCents)}
  ${shippingBlock(args.shipping ?? null)}
  <p style="margin-top:32px;font-size:12px;line-height:1.5;color:#9ca3af">Bookmarke le lien de suivi — il est unique et privé. Une question ? Réponds simplement à cet email.</p>
</td></tr>`;
  return sendEmail({
    to: args.to,
    subject: `Commande ${args.orderRef} reçue · Boutique InesPNJ`,
    html: shellHtml({
      preheader: `Confirmation de ta commande ${args.orderRef}`,
      bodyHtml: body,
    }),
    text: `Merci pour ta commande ${args.orderRef}. Suivi : ${trackingUrl}`,
  });
}

export async function sendOrderPlacedAdminEmail(args: {
  to: string;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  items: OrderLine[];
  totalCents: number;
  shipping?: ShippingInfo | null;
}): Promise<SendResult> {
  const adminUrl = `${SHOP_BASE_URL}/shop/admin/deliveries`;
  const body = `<tr><td style="padding:36px 32px 32px">
  <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9ca3af">Backoffice InesPNJ</p>
  <h1 style="margin:8px 0 0;font-size:26px;font-weight:600;line-height:1.2;color:#0c1340">Nouvelle commande 🎉</h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#374151"><strong>${escapeHtml(args.customerName)}</strong> (${escapeHtml(args.customerEmail)}) vient de passer la commande <strong style="font-family:'SF Mono',Menlo,monospace;color:#0c1340">${escapeHtml(args.orderRef)}</strong>.</p>
  ${trackingButton(adminUrl, "Ouvrir le backoffice")}
  ${itemsTable(args.items, args.totalCents)}
  ${shippingBlock(args.shipping ?? null)}
</td></tr>`;
  return sendEmail({
    to: args.to,
    subject: `🛍️ Nouvelle commande ${args.orderRef} · ${(args.totalCents / 100).toFixed(2)} €`,
    html: shellHtml({
      preheader: `${args.customerName} · ${(args.totalCents / 100).toFixed(2)} €`,
      bodyHtml: body,
    }),
    text: `Nouvelle commande ${args.orderRef} de ${args.customerName} (${args.customerEmail}). Total : ${(args.totalCents / 100).toFixed(2)} €. Backoffice : ${adminUrl}`,
  });
}

export async function sendOrderShippedEmail(args: {
  to: string;
  orderRef: string;
  viewToken: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  shipping?: ShippingInfo | null;
  items?: OrderLine[];
  totalCents?: number;
}): Promise<SendResult> {
  const trackingUrl = buildTrackingUrl(args.orderRef, args.viewToken);
  const itemsHtml =
    args.items && args.items.length > 0 && typeof args.totalCents === "number"
      ? itemsTable(args.items, args.totalCents)
      : "";
  const body = `<tr><td style="padding:36px 32px 32px">
  <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9ca3af">Boutique InesPNJ</p>
  <h1 style="margin:8px 0 0;font-size:28px;font-weight:600;line-height:1.2;color:#0c1340">Ta commande est partie 🚀</h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#374151">Ta commande <strong style="font-family:'SF Mono',Menlo,monospace;color:#0c1340">${escapeHtml(args.orderRef)}</strong> vient d&apos;être expédiée. Tu vas la recevoir d&apos;ici quelques jours.</p>
  ${trackingButton(trackingUrl, "Suivre ma commande")}
  ${carrierBlock(args.carrier, args.trackingNumber)}
  ${itemsHtml}
  ${shippingBlock(args.shipping ?? null)}
  <p style="margin-top:32px;font-size:12px;line-height:1.5;color:#9ca3af">Tu peux suivre l&apos;état de ta commande à tout moment via le bouton ci-dessus. Une question ? Réponds simplement à cet email.</p>
</td></tr>`;
  return sendEmail({
    to: args.to,
    subject: `Ta commande ${args.orderRef} a été expédiée ✓`,
    html: shellHtml({
      preheader: `Suivi : ${args.carrier ?? "expédiée"}${args.trackingNumber ? ` · ${args.trackingNumber}` : ""}`,
      bodyHtml: body,
    }),
    text: `Ta commande ${args.orderRef} a été expédiée. ${args.carrier ? `Transporteur : ${args.carrier}. ` : ""}${args.trackingNumber ? `N° de suivi : ${args.trackingNumber}. ` : ""}Suivi : ${trackingUrl}`,
  });
}

export async function sendOrderDeliveredEmail(args: {
  to: string;
  orderRef: string;
  viewToken: string;
  items?: OrderLine[];
  totalCents?: number;
}): Promise<SendResult> {
  const trackingUrl = buildTrackingUrl(args.orderRef, args.viewToken);
  const itemsHtml =
    args.items && args.items.length > 0 && typeof args.totalCents === "number"
      ? itemsTable(args.items, args.totalCents)
      : "";
  const body = `<tr><td style="padding:36px 32px 32px">
  <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9ca3af">Boutique InesPNJ</p>
  <h1 style="margin:8px 0 0;font-size:28px;font-weight:600;line-height:1.2;color:#0c1340">Ta commande est arrivée 📦</h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#374151">D&apos;après le suivi, ta commande <strong style="font-family:'SF Mono',Menlo,monospace;color:#0c1340">${escapeHtml(args.orderRef)}</strong> vient d&apos;être livrée. On espère que tu vas kiffer le merch !</p>
  ${trackingButton(trackingUrl, "Voir ma commande")}
  ${itemsHtml}
  <p style="margin-top:16px;font-size:14px;line-height:1.55;color:#374151">Si quelque chose cloche (article manquant, taille, défaut…) réponds simplement à cet email, on s&apos;en occupe.</p>
  <p style="margin-top:32px;font-size:12px;color:#9ca3af">Merci pour ta commande sur la boutique InesPNJ ❤️</p>
</td></tr>`;
  return sendEmail({
    to: args.to,
    subject: `Ta commande ${args.orderRef} est arrivée ✓`,
    html: shellHtml({
      preheader: "Ta commande a été livrée.",
      bodyHtml: body,
    }),
    text: `Ta commande ${args.orderRef} a été livrée. Détails : ${trackingUrl}`,
  });
}
