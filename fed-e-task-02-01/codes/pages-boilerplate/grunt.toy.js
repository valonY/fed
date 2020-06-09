module.exports = {
  dist: getCwdPath(`./dist/`),
  base: getCwdPath("./src"),
  test: {
    js: {
      use: ["**/*.js", "**/*.es6"],
      options: {
        sourceMap: false,
      },
    },
    css: {
      use: ["**/*.scss", "**/*.sass"],
      options: {
        sourceMap: false,
        implementation: sass,
      },
    },
    html: {
      use: ["./*.html", "./*.swig"],
      options: {
        cache: false,
        data: {
          date: new Date(),
          description: "This is a grunt toy",
          homepage: "0.0.0.0",
          menus: [
            {
              name: "home",
              icon: "aperture",
              link: "index.html",
            },
            {
              name: "Features",
              link: "features.html",
            },
            {
              name: "About",
              link: "about.html",
            },
            {
              name: "Contact",
              link: "#",
              children: [
                {
                  name: "Twitter",
                  link: "https://twiter.com/w_zce",
                },
                {
                  name: "About",
                  link: "https://weibo.com/zceme",
                },
                {
                  name: "divider",
                },
              ],
            },
          ],
          pkg: {
            name: "grunt-toy",
            author: {
              url: "23333",
            },
          },
        },
      },
    },
  },
};
