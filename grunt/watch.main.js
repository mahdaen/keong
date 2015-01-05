/* Watch Options */
var source = 'source/';
var libs = 'libraries/';

module.exports = {
    options: {
        livereload: 1973
    },

    /* Core */
    core: {
        files: [source + 'cores/**/*.js'],
        tasks: ['concat:core']
    },
    styles: {
        files: [source + 'assets/**/*.less'],
        tasks: ['less:devel']
    },

    /* Assets */
    font: {
        files: [source + 'assets/fonts/**'],
        tasks: ['sync:fonts']
    },
    icon: {
        files: [source + 'assets/icons/**'],
        tasks: ['sync:icons']
    },
    image: {
        files: [source + 'assets/images/**'],
        tasks: ['sync:images']
    },

    /* Libs */
    jslibs: {
        files: [libs + '**/*.js'],
        tasks: ['concat:libs']
    },
    lslibs: {
        files: [libs + '**/*.less'],
        tasks: ['less:libs']
    },

    /* Views */
    viewles: {
        files: [source + 'public/views/**/*.less'],
        tasks: ['less:views']
    },
    viewscr: {
        files: [source + 'public/views/**/*.js', source + '**/*.html', source + '**/*.json'],
        tasks: ['sync:views']
    },

    /* Models */
};
