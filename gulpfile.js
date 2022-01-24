"use strict";
const { src, dest, parallel, series, watch, task } = require("gulp"),
  browserSync = require("browser-sync"),
  sass = require("gulp-dart-sass"),
  cleanCSS = require("gulp-clean-css"),
  autoprefixer = require("gulp-autoprefixer"),
  rename = require("gulp-rename"),
  imagemin = require("gulp-imagemin"),
  htmlmin = require("gulp-htmlmin"),
  removeComments = require("gulp-strip-css-comments"),
  webpackStream = require("webpack-stream"),
  del = require("del"),
  srcPath = "src/",
  distPath = "dist/",
  path = {
    build: {
      html: distPath,
      js: distPath + "js/",
      css: distPath + "style/",
      images: distPath + "images/",
      fonts: distPath + "fonts/",
    },

    src: {
      html: srcPath + "*.html",
      js: srcPath + "js/**/*.js",
      css: srcPath + "scss/style.scss",
      jsLibs: srcPath + "js",
      images:
        srcPath + "images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
      fonts: srcPath + "fonts/**/*.{eot,woff,woff2,ttf,svg}",
    },

    watch: {
      html: srcPath + "**/*.html",
      js: srcPath + "js/**/*.js",
      css: srcPath + "scss/**/*.scss",
      images:
        srcPath + "images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
      fonts: srcPath + "fonts/**/*.{eot,woff,woff2,ttf,svg}",
    },

    clean: "./" + distPath,
  };

task("server", () => {
  browserSync.init({
    server: {
      baseDir: "./" + distPath,
    },
  });
});

task("html", () => {
  return src(path.src.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({ stream: true }));
});

task("css", () => {
  return src(path.src.css)
    .pipe(
      sass({
        outputStyle: "compressed",
        includePaths: "./node_modules/",
      }).on("error", sass.logError)
    )
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer())
    .pipe(removeComments())
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({ stream: true }));
});

task("js", () => {
  return src(path.src.js)
    .pipe(
      webpackStream({
        mode: "production",
        output: {
          filename: "app.js",
        },
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({ stream: true }));
});

task("images", () => {
  return src(path.src.images)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 95, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({ stream: true }));
});

task("clean", () => {
  return del(path.clean);
});

task("watch", () => {
  watch([path.watch.html], series("html"));
  watch([path.watch.css], series("css"));
  watch([path.watch.js], series("js"));
  watch([path.watch.images], series("images"));
});

const build = series("clean", parallel("html", "css", "js", "images")),
  watchTask = parallel(build, "watch", "server");

exports.default = watchTask;
