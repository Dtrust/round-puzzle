const {gulp, src, dest, series, watch}	= require('gulp'),
	bufer	  				= require('vinyl-buffer'),
	merge					= require('merge-stream'),
	pug 					= require('gulp-pug'),
	htmlmin 				= require('gulp-htmlmin'),
	sass 					= require('gulp-sass'),
	autoprefixer 			= require('gulp-autoprefixer'),
	cleanCSS 				= require('gulp-clean-css'),
	rename 					= require('gulp-rename'),
	sourcemaps 				= require('gulp-sourcemaps'),
	plumber 				= require('gulp-plumber'),
	notify 					= require('gulp-notify'),
	image					= require('gulp-image'),
	spritesmith				= require('gulp.spritesmith'),
	del 					= require('del'),
	webpack 				= require('webpack'),
	webpackStream 			= require('webpack-stream'),
	webpackConfig 			= require('./webpack.config.js'),
	makeFavicon				= require('./gulp-tasks/gulp-favicon.js'),
	ghPages 				= require('gulp-gh-pages'),
	browserSync 			= require('browser-sync').create();

const sourceDir = 'app';
const baseDir = 'dist';

const path = {
	pug: {
		dir: `${sourceDir}/pug/**/*.*`,
		src: `${sourceDir}/pug/pages/*.pug`,
	},
	html: {
		src: `${sourceDir}/templates`,
	},
	styles: {
		sass: {
			dir: `${sourceDir}/sass/**/*.*`,
			src: `${sourceDir}/sass/pages`,
			dest: `${sourceDir}/css`,
		},
		css: {
			dest: `${baseDir}/css`
		},
	},
	scripts: {
		dir: `${sourceDir}/js/**/*.*`,
		src: `${sourceDir}/js/**/*.js`,
		dest: `${baseDir}/js`,
	},
	fonts: {
		src: `${sourceDir}/fonts/*.*`,
		dest: `${baseDir}/assets/fonts`,
	},
	img: {
		dir: `${sourceDir}/img`,
		src: `${sourceDir}/img/*.*`,
		dest: `${baseDir}/assets/img`,

		sprites: {
			src: `${sourceDir}/img/icons/*.*`,
			dest: `${baseDir}/assets/img/sprites`,
		}
	},
	favicon: {
		src: `${sourceDir}/img/favicon/src/*.*`,
		dest: `${baseDir}/assets/img/favicon`,
	},
	media: {
		src: `${sourceDir}/media/*.*`,
		dest: `${baseDir}/assets/media`,
	}
};

// JS Compiling
function jsCompiling(cb) {
	return src(path.scripts.src)
		.pipe(webpackStream(webpackConfig), webpack)
		.pipe(dest(path.scripts.dest));
	cb();
};

// PUG to HTML
function convertPug(cb) {
	return src(path.pug.src)
		.pipe(pug({
			pretty: true,
		}))
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(dest(path.html.src));
	cb();
};

//HTML minify
function minifyHTML(cb) {
	return src(`${path.html.src}/*.html`)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(baseDir));
	cb();
};

// SASS to CSS
function convertSASS(cb) {
	return src(`${path.styles.sass.src}/*.sass`)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sass())
		.pipe(dest(path.styles.sass.dest));
	cb();
};

// CSS Optimize
function optimizeCSS(cb) {
	return src(`${path.styles.sass.dest}/*.css`)
		.pipe(sourcemaps.init())
		.pipe(autoprefixer({
			overrideBrowserslist: [
				'last 4 Chrome versions',
				'last 4 Firefox versions',
				'last 4 Edge versions',
				'last 4 Safari versions',
				'ie >= 10',
				'> 1.49%',
				'not ie <= 9'
			],
			cascade: false
		}))
		// CSS Minify
		.pipe(cleanCSS({level: 2}))
		.pipe(rename('style.min.css'))
		.pipe(sourcemaps.write())
		.pipe(dest(path.styles.css.dest));
	cb();
}

// IMG Optimize
function optimizeIMG(cb) {
	return src(`${path.img.src}`)
		.pipe(image({
			pngquant: true,
			optipng: true,
			zopflipng: true,
			jpegRecompress: false,
			mozjpeg: true,
			guetzli: false,
			gifsicle: true,
			svgo: false,
			concurrent: 10,
			quiet: true
		}))
		.pipe(dest(path.img.dest));
	cb();
};

// Static Transfer
function transferFonts(cb) {
	return src(path.fonts.src)
		.pipe(dest(path.fonts.dest));
	cb();
};
function transferMedia(cb) {
	return src(path.media.src)
		.pipe(dest(path.media.dest));
	cb();
};
function transferFavicon(cb) {
	return src(path.favicon.src)
		.pipe(dest(path.favicon.dest));
	cb();
};

// Sprites Generator
function generateSprite(cb) {
	let spriteData = src(path.img.sprites.src)
		.pipe(spritesmith({
			imgName: 'sprite.png',
			imgPath: '../img/sprites/sprite.png',
			cssName: '_sprite.sass',
			padding: 10
		}));

	let imgStream = spriteData.img
		.pipe(bufer())
		.pipe(image())
		.pipe(dest(path.img.sprites.dest));

	let cssStream = spriteData.css
		.pipe(dest('app/sass/bin'));

	cb();

	return merge(imgStream, cssStream);
};

// Clean "DIST"
function clean(cb) {
	return del([`${baseDir}/*`, path.html.src]);
};

// Watch project
function watchProject(cb) {
	watch([path.pug.dir], series(convertPug, minifyHTML)).on('change', browserSync.reload);
	watch([path.styles.sass.dir], series(convertSASS, optimizeCSS));
	watch([path.scripts.dir], jsCompiling);
	watch([path.fonts.src], transferFonts);
	watch([path.img.dir], optimizeIMG),
		watch([path.media.src], transferMedia);
	watch([path.favicon.src], transferFavicon);
	watch([path.img.sprites.src], generateSprite);

	browserSync.init({
		server: {
			baseDir: `./${baseDir}/`,
		}
	})
};

exports.default = series(
	clean,
	transferFonts,
	optimizeIMG,
	transferMedia,
	transferFavicon,
	convertPug,
	minifyHTML,
	convertSASS,
	optimizeCSS,
	jsCompiling,
	watchProject,
);
