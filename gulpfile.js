const { src, dest, parallel, series, watch } = require('gulp');
const fileinclude = require('gulp-file-include');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fs = require('fs');
const del = require('del');
const browsersync = require('browser-sync').create();

const html = () => {
    return src('src/**/*.html')
        .pipe(dest('public'));
}

const styles = () => {
    return src('src/sass/main.sass')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: 'last 10 versions',
            grid: true,
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/css'))
        .pipe(browsersync.stream());
};

const scripts = () => {
    return src('src/js/**/*.js')
        .pipe(webpackStream({
            mode: 'development',
            output: {
                filename: 'main.js'
            },
            module: {
                rules: [
                  {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: ['@babel/preset-env']
                      }
                    }
                  }
                ]
              }
        }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/js'))
        .pipe(browsersync.stream());
};

const svgSprites = () => {
    return src('src/images/**/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(dest('public/images/'))
        .pipe(browsersync.stream());
};

const images = () => {
    return src('src/images/**/*{jpg,png,svg,ico,webp}')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: {
                removeViewBox: false
            },
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest('public/images'))
        .pipe(browsersync.stream());
};

const fonts = () => {
    src('src/fonts/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest('public/fonts'))
        .pipe(browsersync.stream());
    src('src/fonts/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('public/fonts'))
        .pipe(browsersync.stream());
    return src('src/fonts/*.ttf')
        .pipe(dest('public/fonts'));
};

const clean = () => {
    return del('public');
};

const startWatch = () => {
    browsersync.init({
        server: {
            baseDir: 'public'
        },
        notify: false,
        // online: true
    });
    watch('src/*.html').on('change', browsersync.reload);
    watch('src/sass/**/*.{scss|sass}', styles);
    watch('src/js/**/*.js', scripts);
    watch('src/images/**/*.svg', svgSprites);
    watch('src/images/**/*.{jpg,png,svg,ico,webp}', images);
    watch('src/fonts/**}', fonts);
};

exports.default = series(clean, parallel(scripts, fonts, images, svgSprites), html, styles, startWatch);