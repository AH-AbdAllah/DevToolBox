import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://devtoolbox.com";

  const routes = [
    "",
    "/tools/json-formatter",
    "/tools/base64-decoder",
    "/tools/password-generator",
    "/tools/csv-json-converter",
    "/tools/tailwind-playground",
    "/tools/crypto-sandbox",
    "/tools/subnet-calculator",
    "/tools/diff-checker",
    "/tools/error-translator",
    "/tools/jwt-decoder",
    "/tools/uuid-generator",
    "/tools/http-status",
    "/tools/github-analyzer",
    "/tools/interview-simulator",
    "/tools/project-validator",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
