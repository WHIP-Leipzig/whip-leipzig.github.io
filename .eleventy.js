import { IdAttributePlugin } from "@11ty/eleventy";
import eleventySass from "eleventy-sass";
import slugTranslations from "./_src/_data/slugTranslations.json" with { type: "json" };
import faqOverviewDe from "./_src/_data/faqOverview.json" with { type: "json" };
import enData from "./_src/en/en.11tydata.json" with { type: "json" };
import {
  berlinIsoDateTime,
  formatTime,
  shiftTime,
  MEETING_START,
  MEETING_END,
  NEWCOMER_LEAD_MINUTES,
} from "./lib/time.js";

// Meeting times as shown to readers, per language — exposed as `meetingTimes` global data so
// the FAQ text and the homepage dates both follow lib/time.js.
const meetingTimes = Object.fromEntries(["de", "en"].map((lang) => [lang, {
  start: formatTime(MEETING_START, lang),
  end: formatTime(MEETING_END, lang),
  newcomerStart: formatTime(shiftTime(MEETING_START, -NEWCOMER_LEAD_MINUTES), lang),
  newcomerLead: NEWCOMER_LEAD_MINUTES,
}]));

const weekdays = {
  de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const faqOverviewFor = (url) => (url.startsWith("/en/") ? enData.faqOverview : faqOverviewDe);

const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

const eventNames = {
  de: { meeting: "WHIP-Stammtisch", play: "Play-WHIP" },
  en: { meeting: "WHIP meetup", play: "Play-WHIP" },
};

export default function(eleventyConfig) {
  eleventyConfig.addFilter("translateUrl", translateUrl);

  // JSON-LD (schema.org Event) for the upcoming meetings listed on the homepage.
  // Only the city is given as the event location: the exact venue is intentionally not
  // published anywhere on the site (see faq.md), so this must not leak it either.
  eleventyConfig.addShortcode("eventsJsonLd", function(meetings, lang, pageUrl, siteUrl) {
    const names = eventNames[lang] || eventNames.de;
    const graph = meetings.map((meeting) => {
      const baseName = meeting.type === "meeting" ? names.meeting : names.play;
      return {
        "@type": "Event",
        name: meeting.topic ? `${baseName}: ${meeting.topic}` : baseName,
        startDate: berlinIsoDateTime(meeting.date, MEETING_START),
        endDate: berlinIsoDateTime(meeting.date, MEETING_END),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        isAccessibleForFree: true,
        location: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Leipzig",
            addressCountry: "DE",
          },
        },
        organizer: { "@id": `${siteUrl}/#organization` },
        url: `${siteUrl}${pageUrl}`,
      };
    });
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  });

  // Grouped table of contents at the top of the FAQ, from faqOverview (_data/faqOverview.json
  // for DE, en.11tydata.json for EN). Kept in sync with the actual headings by the
  // faqOverviewCheck transform below. Read straight from the files rather than the data
  // cascade: Eleventy deep-merges the two, concatenating the DE and EN group arrays.
  eleventyConfig.addShortcode("faqOverview", function() {
    const overview = faqOverviewFor(this.page.url);
    const groups = overview.groups.map((group) => {
      const links = group.items
        .map((item) => `<li><a href="#${item.id}">${escapeHtml(item.label)}</a></li>`)
        .join("");
      return `<div><h3>${escapeHtml(group.title)}</h3><ul>${links}</ul></div>`;
    });
    return `<section class="faq-overview" aria-labelledby="faq-overview">\n` +
      `<h2 id="faq-overview">${escapeHtml(overview.title)}</h2>\n` +
      `<div class="faq-overview-groups">${groups.join("")}</div>\n</section>`;
  });

  // Fails the build if the FAQ overview no longer lists exactly the FAQ's questions, in page
  // order — e.g. a question was added, renamed (its id changes) or moved without updating it.
  eleventyConfig.addTransform("faqOverviewCheck", function(content) {
    const url = this.page.url;
    if (url !== "/faq.html" && url !== "/en/faq.html") {
      return content;
    }
    const overview = faqOverviewFor(url);
    const expected = overview.groups.flatMap((group) => group.items.map((item) => item.id));
    const actual = [...content.matchAll(/<h2 id="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((id) => id !== "faq-overview");
    if (expected.join("\n") !== actual.join("\n")) {
      const missing = actual.filter((id) => !expected.includes(id));
      const stale = expected.filter((id) => !actual.includes(id));
      throw new Error(
        `FAQ overview for ${url} is out of sync with its headings.\n` +
        `  Not in overview: ${missing.join(", ") || "-"}\n` +
        `  No such heading: ${stale.join(", ") || "-"}\n` +
        `  If both are empty, the order differs: overview and page must list questions in the same order.`
      );
    }
    return content;
  });

  // Old English URLs (pre-rename) that should keep working, generated by redirects.11ty.js.
  eleventyConfig.addGlobalData("redirects", () =>
    Object.entries(slugTranslations).map(([de, en]) => ({
      from: `/en/${de}.html`,
      to: `/en/${en}.html`,
    }))
  );

  eleventyConfig.setChokidarConfig({
		usePolling: true,
		interval: 500,
	});

  eleventyConfig.addGlobalData("meetingTimes", meetingTimes);

  // Meetings from today (Europe/Berlin) on. Past ones only drop off when the site is rebuilt,
  // which the daily scheduled run in .github/workflows/main.yml takes care of.
  const berlinDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" });
  eleventyConfig.addFilter("upcoming", (meetings) => {
    const today = berlinDate.format(new Date());
    return meetings.filter((meeting) => meeting.date >= today);
  });

  eleventyConfig.addShortcode("meetingDate", async function(meetingDate, lang) {
    // "YYYY-MM-DD" parses as UTC midnight, so read it back in UTC too — the build
    // machine's local timezone would otherwise shift it to the previous day west of UTC.
    const meetingDateObj = new Date(meetingDate);
    const time = lang === "en" ? meetingTimes.en.start : `${meetingTimes.de.start} Uhr`;

    return `${weekdays[lang][meetingDateObj.getUTCDay()]}, ${dateFormatter.format(meetingDateObj)}, ${time}`;
   });
  
  eleventyConfig.addPassthroughCopy({"_src/assets/img": "assets/img"});
  eleventyConfig.addPassthroughCopy({"_src/assets/fonts": "assets/fonts"});
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