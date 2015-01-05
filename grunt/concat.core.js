/* Concat Core Options */
var libs = 'libraries/';
var source = 'source/';
var script = 'source/cores/';

module.exports = {
    files: {
        'build/assets/scripts/com.keong.js': [
            script + 'data-dom.js',
            script + 'data-provider.js',
            script + 'data-expression.js',
            script + 'com-constructor.js',
        ]
    }
};
