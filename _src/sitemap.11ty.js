const baseUrl = "https://whip-leipzig.de";

export default class Sitemap {
  data() {
    return {
      permalink: "sitemap.xml",
      eleventyExcludeFromCollections: true,
    };
  }

  render({ collections }) {
    const pages = collections.all.filter(
      (item) => item.url.endsWith(".html") || item.url.endsWith("/")
    );

    const urls = pages
      .map((item) => `  <url><loc>${baseUrl}${item.url}</loc></url>`)
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  }
}
