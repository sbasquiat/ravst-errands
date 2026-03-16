import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ravst.ie";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/runner/", "/admin/", "/api/", "/auth/", "/role-select"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
