/**
 * Keong.
 * Data Expression Helper.
 * Language: Javascript.
 * Created by mahdaen on 12/29/14.
 * License: GNU General Public License v2 or later.
 */

(function() {
    'use strict';

    /* Creating Eval Context */
    var execs = {
        count: 0
    };

    /**
     * Data Expression Helper
     * @param str - String Expression.
     * @returns {DataExpression}
     */
    var DataExpression = function(str) {
        /* Expression should be string */
        if (isString(str)) {
            var $this = this;

            /* Saving Expression */
            $this.origin = str;

            /* Expression should be valid */
            var isexp = /\{\{\s?[a-zA-Z\s\d\.\-\+\*\:\/\!\=\>\<\|\&\(\)\'\"]+\s?\}\}/.test(str);
            if (!isexp) throw str + ' is not a valid expression.';

            /* Expression is Valid */
            str = str.replace(/\s?\{\{\s?/, '');
            str = str.replace(/\s?\}\}\s?/, '');

            /* Saving Expression Text */
            $this.inner = str;

            /* Getting Filter */
            str = str.split(/\s?\|\s?/);
            if (str.length == 2) $this.filter = str[1];
            str = str[0];

            str = str.replace(/\s?\(\s?/, ' ( ');
            str = str.replace(/\s?\)\s?/, ' ) ');

            /* Getting Expression Type */
            if (/[a-zA-Z\d\-]+\s?[\!\=\<\>]+\s?[a-zA-Z\d\-]+/.test(str)) {
                $this.type = 'compare';
            } else if (/[a-zA-Z\d\-]+\s?[\*\/\+\-]\s?[a-zA-Z\d\-]+/.test(str)) {
                $this.type = 'compute';
            } else if (/[a-zA-Z\d\-]+\s?\+\=\s?[a-zA-Z\d\-]+/.test(str)) {
                $this.type = 'increament';
            } else if (/[a-zA-Z\d\-]+\s?\-\=\s?[a-zA-Z\d\-]+/.test(str)) {
                $this.type = 'decreament';
            } else if (/\![a-zA-Z\d\-]/.test(str)) {
                $this.type = 'false';
            } else if (/[a-zA-Z\d-]+/.test(str)) {
                $this.type = 'path';
            }

            /* Splitting Parts */
            $this.parts = str.split(/\s/);
        }

        return $this;
    }

    /* Data Expression Methods */
    DataExpression.prototype = {
        eval: function() {
            var $this = this, frag, result;

            foreach($this.parts, function(path, i) {
                var nfg;

                if (/[a-zA-Z\d\-]+/.test(path)) {
                    var data = DataStore.Read(path);

                    if (isDefined(data)) {
                        nfg = DataStore.ParsePath(path, true);
                    } else {
                        nfg = path;
                    }
                } else {
                    nfg = path;
                }

                isString(frag) ? frag += ' ' + nfg : frag = nfg;
            });

            var evs = 'execs[' + (execs.count + 1) + '] = (' + frag + ')';

            eval(evs);
            result = execs[execs.count + 1];
            execs.count++;

            return result;
        },
        isCompare: function() {
            return this.type === 'compare';
        },
        isCompute: function() {
            return this.type === 'compute';
        },
        isIncreament: function() {
            return this.type === 'increament'
        },
        isDecreament: function() {
            return this.type === 'decreament'
        },
        isPath: function() {
            return this.type === 'path'
        },
        isFalse: function() {
            return this.type === 'false'
        }
    };

    /* Registering to global object */
    window.DataExpression = function(expression) { return new DataExpression(expression) };
})();