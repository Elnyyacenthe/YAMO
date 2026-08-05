import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/ville/",
          "/annonce/",
          "/recherche",
          "/villes",
          "/poster-une-annonce",
          "/tarifs",
          "/blog",
          "/cgu",
          "/mentions-legales",
          "/confidentialite",
        ],
        disallow: [
          "/admin",
          "/escort",
          "/client",
          "/api",
          "/connexion",
          "/inscription",
          "/compte",
          "/portefeuille",
          "/parrainage",
          "/*?ref=",
          "/*?utm_",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}