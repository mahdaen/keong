/**
 * Keong.
 * Small Data DOM Helper.
 * Language: Javascript.
 * Created by mahdaen on 12/29/14.
 * License: GNU General Public License v2 or later.
 */

(function() {
    'use strict';

    /* Small Data Dom Maker */
    var dataDom = function(string) {
        var $this = this;

        var node = document.createElement('div');
        node.innerHTML = string;

        var childs = node.children;
        foreach(childs, function(i, node) {
            $this[i] = node;
        });

        this.length = childs.length;

        return this;
    }

    /* Prototypes */
    dataDom.prototype = {
        splice: function() {},
        each: function(handler) {
            for (var i = 0; i < this.length; ++i) {
                if (isFunction(handler)) {
                    handler.call(this[i]);
                }
            }

            return this;
        }
    }

    /* Hiding Prototypes */
    foreach(['splice', 'each'], function(key) {
        Object.defineProperty(dataDom.prototype, key, { enumerable: false });
    });

    /* Registering to global object */
    window.DataDom = function(string) { return new dataDom(string) };
})();