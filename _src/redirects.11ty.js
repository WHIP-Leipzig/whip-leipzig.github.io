export default class Redirects {
  // One output page per entry in the global "redirects" data (derived from
  // slugTranslations in .eleventy.js), so old URLs keep working without a
  // source file per redirect.
  data() {
    return {
      pagination: {
        data: "redirects",
        size: 1,
        alias: "redirect",
      },
      permalink: (data) => data.redirect.from,
      eleventyExcludeFromCollections: true,
    };
  }

  render({ redirect }) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${redirect.to}">
  <link rel="canonical" href="${redirect.to}">
  <meta name="robots" content="noindex">
  <title>Redirecting…</title>
</head>
<body>
  <p>This page has moved to <a href="${redirect.to}">${redirect.to}</a>.</p>
</body>
</html>
`;
  }
}
