const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");

function scripts() {
  return src([
    "app/js/*.js", 
    "!libs.min.js",
    "node_modules/slick-carousel/slick/slick.js",
])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function cleanDist() {
  return del("dist");
}

function images() {
  return src("app/img/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

// function cssTask(){
//     return src([
//         'node_modules/normalize.css/normalize.css',
//         'node_modules/slick-carousel/slick/slick.css',
//      ])
//     .pipe(concat('style.min.css'))
//     .pipe(dest('app/css'))
//     .pipe(browserSync.stream())
// }

function styles() {
  return src([
    "app/scss/*.scss",
    "node_modules/slick-carousel/slick/slick.scss",
  ])
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 8 version"],
        grid: true,
      })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    [
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/js/libs.min.js",
      "app/*.html",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/**/*.js", "!app/js/libs.min.js"], scripts);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

exports.default = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.build = build;
exports.images = images;
exports.cleanDist = cleanDist;
// exports.cssTask = cssTask;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);