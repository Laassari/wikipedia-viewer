const gulp = require('gulp')
const browserSync = require('browser-sync')
const reload = browserSync.reload
const autoprefixer = require('gulp-autoprefixer')
const eslint = require('gulp-eslint')
const minifyCss = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const clean = require('gulp-clean')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const concat = require('gulp-concat')
// watch files for changes and reload
gulp.task('serve', (done) => {
  browserSync({
    server: {
      baseDir: 'dist'
    }
  })

  gulp.watch(['app*.html', 'app/*.css', 'app/*.js'], {
    cwd: 'app'
  }, reload)
  done()
})


//autoprefix styles
gulp.task('styles', (done) => {
  return gulp.src('app/style.css')
  .pipe(autoprefixer({
    browsers: ['> 1%', 'not dead', ''],
    cascade: false
  }))
  .pipe(minifyCss())
  .pipe(gulp.dest('dist'))
})

//eslint
gulp.task('lint', (done) =>{
  return gulp.src('app/*.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

//copy SW.js and manifest
gulp.task('sw', (done) => {
  gulp.src(['app/sw.js', 'app/manifest.json'])
      .pipe(gulp.dest('dist'))
      done()
})


//uglify js
gulp.task('uglify', (done) => {
  return gulp.src(['app/*.js', '!app/sw.js'])
  .pipe(sourcemaps.init())
  .pipe(concat('index.js'))
  .pipe(babel({
    presets: ['es2017']
  }))
  // .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist'))
})

//copy html
gulp.task('html', (done) => {
  return gulp.src('app/index.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'))
})

//copy images
gulp.task('copy-images', (done) => {
  return gulp.src('app/*.png')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest('dist'))
})

//copy icons
gulp.task('copy-icons', (done) => {
  return gulp.src('app/icons/*.png')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest('dist/icons'))
})


//clean dist folder
gulp.task('clean', (done) => {
  return gulp.src('dist', {
      read: false
    })
    .pipe(clean())
})

//build

gulp.task('default', gulp.series('styles', 'copy-images', 'copy-icons', 'html', 'lint', 'sw', 'uglify', 'lint'))
gulp.task('watch', () => {
  gulp.watch(['app/*.js'], gulp.series('uglify', 'sw', 'serve'))
  gulp.watch(['app/*.css'], gulp.series('styles', 'serve'))
  gulp.watch(['app/*.html'], gulp.series('html', 'serve'))
})
gulp.task('build', gulp.series('clean', 'styles', 'copy-images', 'copy-icons', 'html', 'lint', 'sw', 'uglify', 'serve', 'watch'))