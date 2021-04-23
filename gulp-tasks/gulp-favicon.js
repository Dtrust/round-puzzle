const gulp = require('gulp'),
    del = require('del'),
    realFavicon = require ('gulp-real-favicon'),
    fs = require('fs');

// File where the favicon markups are stored
let FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).

gulp.task('get-favicon', function(done) {
    return del(['./app/img/favicon/src/*']),
        realFavicon.generateFavicon({
            masterPicture: './app/img/favicon/favicon.svg',
            dest: './app/img/favicon/src',
            iconsPath: '/',
            design: {
                ios: {
                    pictureAspect: 'noChange',
                    assets: {
                        ios6AndPriorIcons: false,
                        ios7AndLaterIcons: false,
                        precomposedIcons: false,
                        declareOnlyDefaultIcon: true
                    }
                },
                desktopBrowser: {
                    design: 'raw'
                },
                windows: {
                    pictureAspect: 'noChange',
                    backgroundColor: 'rgba(71, 88, 252, 1)',
                    onConflict: 'override',
                    assets: {
                        windows80Ie10Tile: false,
                        windows10Ie11EdgeTiles: {
                            small: false,
                            medium: true,
                            big: false,
                            rectangle: false
                        }
                    }
                },
                androidChrome: {
                    pictureAspect: 'noChange',
                    themeColor: '#252525',
                    manifest: {
                        display: 'standalone',
                        orientation: 'notSet',
                        onConflict: 'override',
                        declared: true
                    },
                    assets: {
                        legacyIcon: false,
                        lowResolutionIcons: false
                    }
                }
            },
            settings: {
                scalingAlgorithm: 'Mitchell',
                errorOnImageTooSmall: false,
                readmeFile: false,
                htmlCodeFile: false,
                usePathAsIs: false
            },
            markupFile: FAVICON_DATA_FILE
        }, function() {
            done();
        });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.

gulp.task('inject-favicon-markups', function() {
    return gulp.src([ './app/pug/modules/head.pug' ])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        // .pipe(gulp.src('TODO: Path to the directory where to store the HTML files'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});