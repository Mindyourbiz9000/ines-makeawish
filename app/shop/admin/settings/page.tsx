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

          <div>
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                Mot de passe SMTP {smtp?.hasPassword ? "" : "*"}
              </span>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={
                  smtp?.hasPassword
                    ? "•••••••• (laisse vide pour ne pas changer)"
                    : "Mot de passe / clé SMTP"
                }
                className={inputBase}
              />
            </label>
            <details className="group mt-2">
              <summary className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-white/55 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Où trouver ce mot de passe ?
              </summary>
              <div className="mt-3 space-y-4 rounded-md bg-white/[0.02] p-4 text-[12px] leading-relaxed text-white/70 ring-1 ring-white/[0.06]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                  ⚠ Ce n&apos;est PAS le mot de passe de ton compte email.
                  Chaque service en demande un dédié SMTP.
                </p>

                <div>
                  <p className="font-semibold text-white">Gmail / Google Workspace</p>
                  <ol className="ml-4 mt-1 list-decimal space-y-1">
                    <li>
                      Active la validation en 2 étapes sur ton compte Google
                      (obligatoire) :{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 underline decoration-white/30 underline-offset-2 hover:text-white"
                      >
                        myaccount.google.com/security
                      </a>
                    </li>
                    <li>
                      Va sur{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 underline decoration-white/30 underline-offset-2 hover:text-white"
                      >
                        myaccount.google.com/apppasswords
                      </a>{" "}
                      → crée un &quot;mot de passe d&apos;application&quot;
                      nommé &quot;InesPNJ Shop&quot;.
                    </li>
                    <li>
                      Google te donne un code de 16 caractères (genre{" "}
                      <span className="font-mono">abcd efgh ijkl mnop</span>) —
                      c&apos;est ÇA le mot de passe à coller ici (sans les
                      espaces).
                    </li>
                  </ol>
                  <p className="mt-1 text-white/55">
                    Host : <span className="font-mono">smtp.gmail.com</span> ·
                    Port : <span className="font-mono">587</span> (STARTTLS) ou{" "}
                    <span className="font-mono">465</span> (SSL).
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-white">Brevo (ex-Sendinblue)</p>
                  <ol className="ml-4 mt-1 list-decimal space-y-1">
                    <li>
                      Connecte-toi à{" "}
                      <a
                        href="https://app.brevo.com/settings/keys/smtp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 underline decoration-white/30 underline-offset-2 hover:text-white"
                      >
                        Brevo SMTP & API
                      </a>
                    </li>
                    <li>
                      Onglet &quot;SMTP&quot; → tu vois ta &quot;clé SMTP&quot; (master
                      password) — c&apos;est ÇA.
                    </li>
                    <li>
                      Utilisateur : ton email Brevo. Host :{" "}
                      <span className="font-mono">smtp-relay.brevo.com</span> ·
                      Port : <span className="font-mono">587</span>.
                    </li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-white">Resend</p>
                  <ol className="ml-4 mt-1 list-decimal space-y-1">
                    <li>
                      Crée une API key sur{" "}
                      <a
                        href="https://resend.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 underline decoration-white/30 underline-offset-2 hover:text-white"
                      >
                        resend.com/api-keys
                      </a>
                    </li>
                    <li>
                      Utilisateur : <span className="font-mono">resend</span> ·
                      Mot de passe : la clé API (commence par{" "}
                      <span className="font-mono">re_…</span>).
                    </li>
                    <li>
                      Host : <span className="font-mono">smtp.resend.com</span>{" "}
                      · Port : <span className="font-mono">465</span> (SSL).
                    </li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-white">Outlook / Office 365</p>
                  <ol className="ml-4 mt-1 list-decimal space-y-1">
                    <li>
                      Active 2FA sur ton compte Microsoft.
                    </li>
                    <li>
                      Crée un mot de passe d&apos;application :{" "}
                      <a
                        href="https://account.microsoft.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 underline decoration-white/30 underline-offset-2 hover:text-white"
                      >
                        account.microsoft.com/security
                      </a>{" "}
                      → Options de sécurité avancées → Mots de passe
                      d&apos;application.
                    </li>
                    <li>
                      Host : <span className="font-mono">smtp.office365.com</span>{" "}
                      · Port : <span className="font-mono">587</span> (STARTTLS).
                    </li>
                  </ol>
                </div>
              </div>
            </details>
          </div>

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
