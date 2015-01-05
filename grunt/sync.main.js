/**
 * Keong.
 * Sync Files to Build Folder.
 * Language: Javascript.
 * Created by mahdaen on 12/27/14.
 * License: GNU General Public License v2 or later.
 */

/* Less Options */
module.exports = {
    /* Assets */
    fonts: {
        files: [
            {
                cwd: 'source/assets/fonts',
                src: ['**'],
                dest: 'build/assets/fonts'
            }
        ],
        verbose: true,
        updateAndDelete: true
    },
    images: {
        files: [
            {
                cwd: 'source/assets/images',
                src: ['**'],
                dest: 'build/assets/images'
            }
        ],
        verbose: true,
        updateAndDelete: true
    },
    icons: {
        files: [
            {
                cwd: 'source/assets/icons',
                src: ['**'],
                dest: 'build/assets/icons'
            }
        ],
        verbose: true,
        updateAndDelete: true
    },

    /* Views */
    views: {
        files: [
            {
                cwd: 'source/public/views',
                src: ['**/*.html', '**/*.js', '**/*.css'],
                dest: 'build/public/views'
            },
            {
                cwd: 'source/',
                src: ['*.html', 'public/.bowerrc', '**/*.json'],
                dest: 'build'
            }
        ]
    }
};
