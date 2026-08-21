import { IdAttributePlugin } from "@11ty/eleventy";
import eleventySass from "eleventy-sass";

// German slug -> English slug, for pages whose translated URL isn't just "/en" + the same slug.
const slugTranslations = {
  "impressum": "imprint",
  "datenschutz": "privacy",
  "kontakt": "contact",
  "konzept": "concept",
  "prinzipien": "principles",
};

// Given a page url in either language, return the equivalent url in targetLang ("de" or "en").
function translateUrl(url, targetLang) {
  if (url === "/" || url === "/en/") {
    return targetLang === "en" ? "/en/" : "/";
  }

  const isEnglish = url.startsWith("/en/");
  if ((isEnglish && targetLang === "en") || (!isEnglish && targetLang === "de")) {
    return url;
  }

  const slug = url.replace(/^\/en\//, "/").slice(1).replace(/\.html$/, "");
  if (isEnglish) {
    const deSlug = Object.keys(slugTranslations).find((de) => slugTranslations[de] === slug) || slug;
    return `/${deSlug}.html`;
  }
  return `/en/${slugTranslations[slug] || slug}.html`;
}

export default function(eleventyConfig) {
  eleventyConfig.addFilter("translateUrl", translateUrl);

  eleventyConfig.setChokidarConfig({
		usePolling: true,
		interval: 500,
	});

  eleventyConfig.addShortcode("meetingDate", async function(meetingDate, lang) {
    const meetingDateObj = new Date(meetingDate);
    const days = {
      "de": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      "en": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
    const formatter = new Intl.DateTimeFormat("de-DE", 
      { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

    return `${days[lang][meetingDateObj.getDay()]}, ${formatter.format(meetingDateObj)}`;
   });
  
  eleventyConfig.addPassthroughCopy({"_src/assets/img": "assets/img"});
  eleventyConfig.addPassthroughCopy({"_src/robots.txt": "robots.txt"});

	eleventyConfig.addPlugin(IdAttributePlugin);

  eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      permalink: function(contents, inputPath) {
        return (data) => {
          return data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
        };
      }
    }
  });

  eleventyConfig.addGlobalData("permalink", () => {
    return (data) => `${data.page.filePathStem}.${data.page.outputFileExtension}`;
  });
  
  return {  
    dir: {
      input: "_src"
    }
  };
}