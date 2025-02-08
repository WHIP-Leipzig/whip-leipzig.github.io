import eleventySass from "eleventy-sass";

export default function(eleventyConfig) {
  // Output directory: _site

  // Copy `img/` to `_site/img`
  // eleventyConfig.addPassthroughCopy("static/img");

  // Copy `css/fonts/` to `_site/css/fonts`
  // Keeps the same directory structure.
  // eleventyConfig.addPassthroughCopy({"static/css": "css"});

  // Copy any .jpg file to `_site`, via Glob pattern
  // Keeps the same directory structure.
  // eleventyConfig.addPassthroughCopy("**/*.jpg");
  eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      permalink: function(contents, inputPath) {
        return (data) => {
          return data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
        };
      }
    }
  });

  return {  
    dir: {
      input: "_src"
    }
  };
}