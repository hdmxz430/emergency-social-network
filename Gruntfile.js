var coverageFolder = process.env.CIRCLE_TEST_REPORTS == undefined ? 'coverage' : process.env.CIRCLE_TEST_REPORTS + '/coverage';

module.exports = function (grunt) { /* Project configuration. */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        mochaTest: {
            local: {
                options: {
                    reporter: 'spec', //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    ui: 'tdd'
                },
                src: ['test/**/*.js']
            },
        },
        mocha_istanbul: {
            coverage: {
                src: ['test/**/*.js'], // a folder works nicely
                options: {
                    mochaOptions: ['--ui', 'tdd'], // any extra options for mocha
                    istanbulOptions: ['--dir', coverageFolder],
                    reporter: 'spec',
                    reportFormats: ['html', 'lcovonly']
                }
            }
        }
    });
    /*  Load the plugin that provides the "uglify" task. grunt.loadNpmTasks('grunt-mocha'); Client Side testing */
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('default', []);
    /*  Default task(s). */
    grunt.registerTask('test', ['env', 'mochaTest:local']);
    /* Test */
    grunt.registerTask('coverage', ['mocha_istanbul']);
    /* Coverage */
};
