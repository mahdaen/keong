/**
 * Keong.
 * LESS Compiler Options.
 * Language: Javascript.
 * Created by mahdaen on 12/27/14.
 * License: GNU General Public License v2 or later.
 */

/* Less Options */
module.exports = {
    paths: ['source/public/views', 'source/assets/styles'],
    compress: false,
    cleancss: false,

    customFunctions: {
        hrgba: function(less, color, opacity) {
            if (color.rgb !== 'undefined') {
                var result = 'rgba(' + color.rgb[0] + ', ' + color.rgb[1] + ', ' + color.rgb[2] + ', ' + opacity.value +')';
                return result;
            }
        }
    }
};
