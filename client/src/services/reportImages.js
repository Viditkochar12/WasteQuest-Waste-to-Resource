/**
 * Return a safe Cloudinary HTTPS URL for a persisted report image, or null.
 * Report images come from the backend upload response; never invent a fallback URL.
 */
export function getReportImageUrl(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return null;

  try {
    const parsedUrl = new URL(imageUrl.trim());
    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "res.cloudinary.com" ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      return null;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
}
