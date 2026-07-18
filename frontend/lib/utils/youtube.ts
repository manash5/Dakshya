// Extracts the video ID from common YouTube URL shapes so a thumbnail and
// embed can be built without an API key. Returns null for anything else
// (including non-YouTube video links) — those fall back to a plain link.
export function extractYouTubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    return parsed.pathname.slice(1).split("/")[0] || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }
    const embedMatch = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
    if (embedMatch) {
      return embedMatch[2];
    }
  }

  return null;
}
