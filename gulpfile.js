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

// watch files for changes and reload
gulp.task('serve', () => {
  browserSync({
    server: {
      baseDir: 'dist'
    }
  })

  gulp.watch(['*.html', 'styles/**/*.css', 'scripts/**/*.js'], {
    cwd: 'dist'
  }, reload)
})


//autoprefix styles
gulp.task('styles', () =>
  gulp.src('app/style.css')
  .pipe(autoprefixer({
    browsers: ['> 1%', 'not dead', ''],
    cascade: false
  }))
  .pipe(minifyCss())
  .pipe(gulp.dest('dist'))
)

//eslint
gulp.task('lint', () =>
  gulp.src('app/*.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
)

//uglify js
gulp.task('uglify', () =>
  gulp.src('app/*.js')
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['env']
  }))
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist'))
)

//copy html
gulp.task('html', (done) => {
  gulp.src('app/index.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'))
  done()
})

//copy images
gulp.task('copy-images', (done) => {
  gulp.src('app/*.png')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest('dist'))
  done()
})

//clean dist folder
gulp.task('clean', (done) => {
  gulp.src('dist', {
      read: false
    })
    .pipe(clean())
  done()
})

//build
gulp.task('build', gulp.series('clean', 'styles', 'copy-images', 'html', 'lint', 'uglify', () => {

  browserSync.init({
    server: '.dist'
  })
}))

gulp.task('default', gulp.series('styles', 'lint', 'copy-images', 'html', () => {

  browserSync.init({
    server: '.dist'
  })
}))