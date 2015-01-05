/**
 * Keong.
 * LESS Compiler - Views Module Scripts.
 * Language: Javascript.
 * Created by mahdaen on 12/27/14.
 * License: GNU General Public License v2 or later.
 */

/* File Lists */
var files = {
    // Main Styles
    'build/assets/styles/main.css': 'source/assets/styles/main.less'
};

/* Registering Module */
module.exports = {
    options: require('./less.options.js'),
    files: files
};
