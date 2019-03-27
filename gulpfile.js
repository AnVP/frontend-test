const autoprefixer = require(`autoprefixer`);
const csso = require(`gulp-csso`);
const del = require(`del`);
const gulp = require(`gulp`);
const htmlmin = require(`gulp-htmlmin`);
const posthtml = require(`gulp-posthtml`);
const include = require(`posthtml-include`);
const sass = require(`gulp-sass`);
const postcss = require(`gulp-postcss`);
const rename = require(`gulp-rename`);
// const rsync = require(`gulp-rsync`);
const sync = require(`browser-sync`).create();
const svgmin = require(`gulp-svgmin`);
const svgstore = require(`gulp-svgstore`);
const plumber = require(`gulp-plumber`);
const jsmin = require(`gulp-jsmin`);
const postcssPresetEnv = require(`postcss-preset-env`);
const imagemin = require(`gulp-imagemin`);
const webp = require(`gulp-webp`);
const concat = require(`gulp-concat`);
const babel = require(`gulp-babel`);

const jsFilesLibs = [
  `src/scripts/libs/jquery.js`,
  // `src/scripts/libs/slick.min.js`
];

const jsFiles = [
  `src/scripts/modal.js`,
  `src/scripts/road-map.js`
];

// svg sprite

gulp.task(`svg`, () => {
  return gulp
    .src(`src/img/svg-sprite/*.svg`)
    .pipe(svgmin())
    .pipe(
        svgstore({
          inlineSvg: true
        })
    )
    .pipe(gulp.dest(`build/img`));
});

// HTML

gulp.task(`html`, () => {
  return gulp
    .src(`src/*.html`)
    .pipe(posthtml([include()]))
    .pipe(
        htmlmin({
          removeComments: true
        })
    )
    .pipe(gulp.dest(`build`))
    .pipe(
        sync.stream({
          once: true
        })
    );
});

// CSS

gulp.task(`css`, () => {
  return gulp
    .src(`src/styles/style.scss`)
    .pipe(plumber())
    .pipe(concat(`style.css`))
    .pipe(sass())
    .pipe(
        postcss([
          postcssPresetEnv({
            stage: 0
          })
        ])
    )
    .pipe(postcss([autoprefixer]))
    .pipe(csso())
    .pipe(rename(`style.min.css`))
    .pipe(gulp.dest(`build/css`))
    .pipe(sync.stream());
});

// JS

gulp.task(`scripts`, () => {
  return (
    gulp
      // .src(`src/scripts/*.js`)
      .src(jsFiles)
      .pipe(babel())
      .pipe(concat(`scripts.js`))
      .pipe(jsmin())
      .pipe(rename({suffix: `.min`}))
      .pipe(gulp.dest(`build/scripts`))
      .pipe(
          sync.stream({
            once: true
          })
      )
  );
});

// libs

gulp.task(`libs`, () => {
  return gulp
    .src(jsFilesLibs)
    .pipe(concat(`libs.js`))
    .pipe(gulp.dest(`build/scripts`));
});

// Images

gulp.task(`webp`, function () {
  return gulp
    .src(`src/img/**/*.{png,jpg}`)
    .pipe(
        webp({
          quality: 90
        })
    )
    .pipe(gulp.dest(`build/img`));
});

gulp.task(`images`, function () {
  return gulp
    .src([`src/img/**/*.{png,jpg,gif,svg}`, `!src/img/svg-sprite/*`])
    .pipe(
        imagemin([
          imagemin.optipng({
            optimizationLevel: 3
          }),
          imagemin.jpegtran({
            progressive: true
          })
        ])
    )
    .pipe(gulp.dest(`build/img`));
});

// Copy

gulp.task(`copy`, () => {
  return gulp
    .src(
        [
          `src/fonts/*`,
          `!src/img/**/*.{jpg,png,svg}`,
          `!src/img/svg/*.svg`,
          `!src/img/svg-sprite/*`,
          `!src/styles/*`,
          `!src/scripts/*`,
          `!src/scripts/libs/*`,
          `!src/**/*.html`,
          `src/*.txt`,
          `!src/*.{jpg,png,svg}`
        ],
        {
          base: `src`
        }
    )
    .pipe(gulp.dest(`build`))
    .pipe(
        sync.stream({
          once: true
        })
    );
});

gulp.task(`clean`, function (cb) {
  return del(`build`, cb);
});

// Server

gulp.task(`server`, () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: `build`
    }
  });
});

// Watch

gulp.task(`watch:svg`, () => {
  return gulp.watch(`src/img/**/*.svg`, gulp.series(`svg`));
});

gulp.task(`watch:html`, () => {
  return gulp.watch(`src/**/*.html`, gulp.series(`html`));
});

gulp.task(`watch:css`, () => {
  return gulp.watch(`src/styles/**/*.scss`, gulp.series(`css`));
});

gulp.task(`watch:scripts`, () => {
  return gulp.watch(`src/scripts/*.js`, gulp.series(`scripts`));
});

gulp.task(`watch:libs`, () => {
  return gulp.watch(`src/scripts/libs/*.js`, gulp.series(`libs`));
});

gulp.task(`watch:copy`, () => {
  return gulp.watch(
      [
        `src/*`,
        `src/fonts/*`,
        `!src/img/**/*.{jpg,png,svg}`,
        `!src/styles/*`,
        `!src/scripts/*`,
        `!src/**/*.html`
      ],
      gulp.series(`copy`)
  );
});

gulp.task(
    `watch`,
    gulp.parallel(
        `watch:svg`,
        `watch:html`,
        `watch:css`,
        `watch:scripts`,
        `watch:libs`,
        `watch:copy`
    )
);

// Build

gulp.task(
    `all`,
    gulp.parallel(`images`, `webp`, `html`, `css`, `scripts`, `libs`, `copy`)
);

gulp.task(`build`, gulp.series(`clean`, `svg`, `all`));

// Default

gulp.task(`default`, gulp.series(`build`, gulp.parallel(`watch`, `server`)));
