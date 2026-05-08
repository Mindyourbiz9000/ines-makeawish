// Scraping HTML de sullygnome.com pour récupérer les stats Twitch sur N jours.
// Pas d'API publique : on fetch la page channel et on regex les valeurs.
//
// Robustesse :
// - User-Agent navigateur pour passer Cloudflare.
// - Cache 6 h (revalidate 21600s) — les stats sont aggrégées, pas besoin de live.
// - Tout est défensif : la moindre erreur renvoie `null`, le composant affiche rien.
// - On parse les valeurs en string brutes ("12.3K", "1,234") sans les convertir : on
//   garde le formatage natif de sullygnome.

const SULLY_BASE = "https://sullygnome.com";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type SullyPeriod = 7 | 14 | 30 | 90 | 365;

export type SullyStats = {
  period: SullyPeriod;
  hoursWatched: string | null;
  hoursStreamed: string | null;
  averageViewers: string | null;
  peakViewers: string | null;
  followersGained: string | null;
  streamsCount: string | null;
};

const LABEL_REGEXES: Record<keyof Omit<SullyStats, "period">, RegExp> = {
  hoursWatched: /hours?\s*watched/i,
  hoursStreamed: /hours?\s*streamed/i,
  averageViewers: /average\s*viewers?/i,
  peakViewers: /(?:peak|max)\s*viewers?/i,
  followersGained: /followers?\s*gained/i,
  streamsCount: /\bstreams\b/i,
};

// Trouve le label dans le HTML, puis cherche la valeur numérique la plus proche.
// SullyGnome affiche typiquement la valeur AU-DESSUS du label dans une tuile,
// donc on regarde d'abord en arrière (jusqu'à 600 chars), puis en avant.
function extractValue(html: string, label: RegExp): string | null {
  const m = label.exec(html);
  if (!m) return null;
  const idx = m.index;

  // Pattern de valeur : 12.3, 1,234, 12K, 12.3K, 1 234 (espaces fr), etc.
  const numPattern =
    /(?:>|"|\s|^)(\d{1,3}(?:[., \s]\d{3})*(?:[.,]\d+)?(?:\s*[KkMm])?)(?=[<\s,.!?])/g;

  // Backward scan : on prend le DERNIER number avant le label (le plus proche).
  const before = html.slice(Math.max(0, idx - 600), idx);
  const beforeMatches = [...before.matchAll(numPattern)];
  if (beforeMatches.length > 0) {
    const last = beforeMatches[beforeMatches.length - 1];
    return last[1].trim();
  }

  // Forward scan : sinon, premier number après le label.
  const after = html.slice(idx, idx + 600);
  const afterMatch = numPattern.exec(after);
  if (afterMatch) return afterMatch[1].trim();

  return null;
}

export async function fetchSullyGnomeStats(
  login: string,
  period: SullyPeriod = 7
): Promise<SullyStats | null> {
  try {
    const url = `${SULLY_BASE}/channel/${encodeURIComponent(
      login.toLowerCase()
    )}/${period}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
      },
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Garde-fou : si on a moins de 5 KB, c'est qu'on a chopé un challenge Cloudflare
    // ou une redirect, pas la vraie page.
    if (!html || html.length < 5000) return null;
    // Si Cloudflare a foutu un challenge, le mot "Just a moment" apparaît typiquement.
    if (/just a moment|attention required|cloudflare/i.test(html.slice(0, 2000))) {
      return null;
    }

    const stats: SullyStats = {
      period,
      hoursWatched: extractValue(html, LABEL_REGEXES.hoursWatched),
      hoursStreamed: extractValue(html, LABEL_REGEXES.hoursStreamed),
      averageViewers: extractValue(html, LABEL_REGEXES.averageViewers),
      peakViewers: extractValue(html, LABEL_REGEXES.peakViewers),
      followersGained: extractValue(html, LABEL_REGEXES.followersGained),
      streamsCount: extractValue(html, LABEL_REGEXES.streamsCount),
    };

    // Si on n'a pas pu extraire AU MOINS deux valeurs, on considère que le scraping
    // a foiré (Cloudflare déguisé, HTML changé, etc.) — mieux vaut rien afficher.
    const filled = Object.values(stats).filter(
      (v) => v != null && v !== period
    ).length;
    if (filled < 2) return null;

    return stats;
  } catch {
    return null;
  }
}
