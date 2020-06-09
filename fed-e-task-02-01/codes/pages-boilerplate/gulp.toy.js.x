module.exports = {
  env: "development",
  base: "./src",
  temp: "./temp",
  dist: "./dist",
  compileReadPath: {
    STYLE: "**/*.scss",
    SCRIPT: ["**/*.js", "**/*.es6"],
    PAGE: ["./*.html", "./*.ejs"],
    EXTRA: "public/**",
    IMAGE: "assets/images/**",
    FONTS: "assets/fonts/**",
  },
  templateData: {
    date: new Date(),
    description: "This is a gulp toy",
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
      name: "gulp-toy",
      author: {
        url: "23333",
      },
    },
  },
  browser: {
    notify: false,
    open: true,
    server: {
      baseDir: [
        process.env.NODE_ENV === "production" ? "./dist" : "./temp",
        "public",
      ],
    },
  },
};