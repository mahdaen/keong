/* Concat Libs Options */
var libs = 'libraries/';

module.exports = {
    files: {
        'build/assets/scripts/com.libs.js': [
            /* Native JS */
            libs + 'native-js/index.js',

            /* jQuery */
            libs + 'jquery/dist/jquery.js',

            /* Web Components JS */
            libs + 'webcomponentsjs/webcomponents.js',
            libs + 'polymer/polymer.js',

            /* Enquire */
            libs + 'enquire/dist/enquire.js',

            /* Annyang */
            libs + 'annyang/annyang.js',
        ]
    }
};
