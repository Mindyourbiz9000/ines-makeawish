// Admin Settings : config SMTP pour envoyer les emails de notification
// (commande expédiée, livrée). Stocke les credentials dans shop_settings
// (table privée, lecture serveur uniquement). Inclut un envoi de test.

import { getSmtpConfigPublic } from "@/lib/shop/settings";
import {
  saveSmtpAction,
  sendTestEmailAction,
} from "@/lib/shop/admin-settings-actions";

export const dynamic = "force-dynamic";

const inputBase =
  "w-full min-h-[42px] rounded-md bg-white/[0.04] px-3 text-[14px] text-white/95 ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-white/30";

export default async function AdminSettingsPage() {
  const smtp = await getSmtpConfigPublic();

  return (
    <section className="space-y-10">
      <header>
        <h2 className="text-2xl font-medium text-white">SMTP — Notifications email</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Configure le serveur SMTP qui envoie les emails de confirmation et de
          livraison aux clients. Les credentials sont stockés dans Supabase
          (table privée, aucun accès navigateur). Si tu n&apos;as pas de serveur,
          utilise un service comme{" "}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white"
          >
            Resend
          </a>
          ,{" "}
          <a
            href="https://brevo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white"
          >
            Brevo
          </a>{" "}
          ou Gmail SMTP (avec un mot de passe d&apos;application).
        </p>
      </header>

      {/* Config form */}
      <form
        action={saveSmtpAction}
        className="space-y-4 rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/[0.08]"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Hôte SMTP *
            </span>
            <input
              name="host"
              required
              defaultValue={smtp?.host ?? ""}
              placeholder="smtp.gmail.com"
              className={inputBase}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Port *
            </span>
            <input
              name="port"
              type="number"
              required
              defaultValue={smtp?.port ?? 587}
              placeholder="587"
              className={inputBase}
            />
          </label>

          <label className="flex items-center gap-3 md:mt-7">
            <input
              type="checkbox"
              name="secure"
              defaultChecked={smtp?.secure ?? false}
              className="h-5 w-5 accent-white"
            />
            <span className="text-[13px] text-white/80">
              Connexion SSL/TLS (port 465) — sinon STARTTLS (587)
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Utilisateur *
            </span>
            <input
              name="user"
              required
              autoComplete="off"
              defaultValue={smtp?.user ?? ""}
              placeholder="contact@inespnj.com"
              className={inputBase}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Mot de passe {smtp?.hasPassword ? "" : "*"}
            </span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={
                smtp?.hasPassword
                  ? "•••••••• (laisse vide pour ne pas changer)"
                  : "Mot de passe SMTP"
              }
              className={inputBase}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Email expéditeur *
            </span>
            <input
              name="fromEmail"
              type="email"
              required
              defaultValue={smtp?.fromEmail ?? ""}
              placeholder="contact@inespnj.com"
              className={inputBase}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
              Nom expéditeur
            </span>
            <input
              name="fromName"
              defaultValue={smtp?.fromName ?? "InesPNJ"}
              placeholder="InesPNJ"
              className={inputBase}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="min-h-[42px] rounded-md bg-white px-4 text-[12px] uppercase tracking-[0.18em] font-semibold text-night-900 transition-colors hover:bg-white/90"
          >
            Enregistrer
          </button>
          <span className="text-[11px] text-white/40">
            {smtp ? "SMTP configuré · prêt à envoyer." : "Pas encore configuré."}
          </span>
        </div>
      </form>

      {/* Test email */}
      {smtp ? (
        <form
          action={sendTestEmailAction}
          className="space-y-3 rounded-2xl bg-white/[0.02] p-6 ring-1 ring-white/[0.08]"
        >
          <h3 className="text-base font-medium text-white">Envoi de test</h3>
          <p className="text-[13px] text-white/55">
            Envoie un email vide à une adresse pour valider la config SMTP.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              name="test_to"
              required
              defaultValue={smtp.user}
              placeholder="email@destination.com"
              className={`${inputBase} flex-1`}
            />
            <button
              type="submit"
              className="min-h-[42px] rounded-md bg-white/[0.06] px-4 text-[12px] uppercase tracking-[0.18em] text-white/85 ring-1 ring-white/10 transition-colors hover:bg-white/[0.10] hover:text-white"
            >
              Envoyer un test
            </button>
          </div>
          <p className="text-[11px] text-white/40">
            Si tu vois une page d&apos;erreur après l&apos;envoi, c&apos;est que
            le SMTP refuse les credentials — re-vérifie host / port / user /
            mot de passe (et active TLS si requis).
          </p>
        </form>
      ) : null}
    </section>
  );
}
