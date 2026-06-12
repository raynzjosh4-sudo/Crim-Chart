export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const reg = /(?:v=|\/embed\/|\.be\/|\/v\/)([A-Za-z0-9_-]{11})/;
    const m = url.match(reg);
    if (m && m[1]) return m[1];
  } catch (e) {
    // ignore regex errors
  }
  return null;
}

/** Return a YouTube thumbnail URL for a given video id. */
export function youtubeThumbnailUrlFromId(id: string, preferMaxRes = true): string {
  if (preferMaxRes) return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Pick the best thumbnail available for a video. */
export function pickVideoThumbnail({
  explicitThumbnail,
  sideThumbnails,
  videoUrl,
  preferYouTubeMaxRes = true,
}: {
  explicitThumbnail?: string | null;
  sideThumbnails?: string[] | null;
  videoUrl: string;
  preferYouTubeMaxRes?: boolean;
}): string | null {
  if (explicitThumbnail && explicitThumbnail.trim().length > 0) {
    return explicitThumbnail;
  }

  const ytId = extractYouTubeId(videoUrl);
  if (ytId) {
    return youtubeThumbnailUrlFromId(ytId, preferYouTubeMaxRes);
  }

  if (sideThumbnails && sideThumbnails.length > 0) {
    return sideThumbnails[0];
  }

  return null;
}
