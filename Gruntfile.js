/**
 * Keong.
 * Grunt Definitions.
 * Language: Javascript.
 * Created by mahdaen on 12/8/14.
 * License: GNU General Public License v2 or later.
 */

/* Gunt Module */
module.exports = function(grunt) {
    var source = 'source/';
	var libs = 'libraries/';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            libs: require('./grunt/concat.libs.js'),
            core: require('./grunt/concat.core.js')
        },

        /* Uglifying Scripts */
        uglify: {
            options: {
                mangle: true,
            },
            build: {
                files: {
                    'build/assets/scripts/com.libs.min.js': 'build/assets/scripts/com.libs.js',
                    'build/assets/scripts/com.keong.min.js': 'build/assets/scripts/com.keong.js',
                }
            }
        },

        /* Syncronize Files */
        sync: require('./grunt/sync.main.js'),

        less: {
            /* Main Styles */
            devel: require('./grunt/less.devel.js'),

            /* View Specific Styles */
            views: require('./grunt/less.views.js'),
        },

        /* Watch for File Changes */
        watch: require('./grunt/watch.main.js')
    });

    /* Loading Tasks */
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sync');

    /* Registering Tasks */
    grunt.registerTask('devel', ['concat', 'concat', 'less', 'sync', 'watch']);
    grunt.registerTask('alpha', ['concat', 'less', 'sync']);
    grunt.registerTask('build', ['concat:build', 'uglify:build']);
}
