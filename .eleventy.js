import eleventySass from "eleventy-sass";

export default function(eleventyConfig) {
  eleventyConfig.setChokidarConfig({
		usePolling: true,
		interval: 500,
	});
  
  eleventyConfig.addPassthroughCopy({"_src/assets/img": "assets/img"});

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