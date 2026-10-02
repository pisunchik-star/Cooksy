import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    "",
    "/about",
    "/search?q=популярное",
    "/recipe/creamy-pasta",
    "/recipe/avocado-toast",
    "/recipe/tomato-soup",
    "/recipe/berry-pancakes",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
