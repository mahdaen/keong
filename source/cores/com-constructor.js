/**
 * Keong.
 * Constructor Extender.
 * Language: Javascript.
 * Created by mahdaen on 12/28/14.
 * License: GNU General Public License v2 or later.
 */

(function() {
    'use strict';

    var defid = 0;
    var events = {
        created: {},
        ready: {},
        attached: {},
        domReady: {},
        detached: {}
    }

    /* Creating Extractor */
    var extract = function(value) {
        if (!value) return;

        return value.match(/\{\{\s?[a-zA-Z\s\d\.\-\+\*\:\/\!\=\>\<\|\&\(\)\'\"]+\s?\}\}/g);
    }

    var saveExpression = function(proplist) {
        var $this = this;

        /* Creating Expression Holders */
        $this._mddef = {};
        $this._mdcon = {};
        $this._mdexp = {};
        $this._mdval = {};

        /* Enumerating Properties */
        foreach(proplist, function(prop) {
            /* Getting Value */
            var propval = $this[prop];

            /* Creating on change event */
            $this.onchanged = function() {
                console.log('test');
            }

            /* Get from attribute if not found */
            !propval ? propval = $this.getAttribute(prop) : propval;

            /* Extracting value */
            var getExpr = extract(propval);

            /* Value must be array and not empty */
            if (getExpr && getExpr.length > 0) {
                /* Saving Original Value */
                $this._mddef[prop] = propval;

                var vval = $this._mddef[prop];

                /* Creating expression list, context list and value list */
                $this._mdexp[prop] = [];
                $this._mdcon[prop] = [];
                $this._mdval[prop] = [];

                /* Iterating each expression to handling multiple expression in a value */
                foreach(getExpr, function(expr, i) {
                    /* Removing expression pattern to get inner pattern */
                    var inner = getExpr[i].replace(/\s?\{\{\s?/, '');
                    var inner = inner.replace(/\s?\}\}\s?/, '');

                    /* Saving original pattern */
                    $this._mdexp[prop].push(getExpr[i]);
                    /* Saving inner pattern */
                    $this._mdcon[prop].push(inner);
                    /* Saving inner pattern as initial value */
                    $this._mdval[prop].push(inner);

                    vval = vval.replace(getExpr[i], '');
                });

                $this[prop] = vval;
            }
        });
    }

    /* Expression Getter. Collecting expressions and save it for future use */
    var lookupExpression = function() {
        var $this = this, proplist = [];

        /* Creating Model List */
        $this._mdlis = {};

        /* Searching in available attributes */
        foreach($this.attributes, function(key, value) {
            if (key !== 'length') {
                var prop = value.name, atrval = $this.getAttribute(prop);

                if (extract(atrval) && proplist.indexOf(prop) < 0) {
                    proplist.push(prop);

                    /* adding property to list */
                    $this._mdlis[prop] = 'attr';
                }
            }
        });

        /* Searching in published attributes */
        foreach($this._publishNames, function(key) {
            var value = $this[key];
            if (extract(value) && proplist.indexOf(key) < 0) {
                proplist.push(key);

                /* adding property to list */
                $this._mdlis[key] = 'prop'
            }
        });

        /* Searching in innerText */
        if (extract($this.innerText) && proplist.indexOf('innerText') < 0) {
            proplist.push('innerText');

            /* adding property to list */
            $this._mdlis['innerText'] = 'text';
        }

        /* Saving Expressions */
        if (proplist.length > 0) {
            saveExpression.call($this, proplist);
        }
    }

    /* Prepare for Data Binding */
    var prepareBinding = function() {
        var $this = this;

        /* Creating No Lock sign to prevent invinite changes */
        $this._lock = false;

        /* Collecting Expressions */
        lookupExpression.call($this);

        /* Creating listener to bind */
        if ($this._mdlis) {
            foreach($this._mdlis, function(prop, type) {
                foreach($this._mdexp[prop], function(exp) {
                    var xp = DataExpression(exp);

                    foreach(xp.parts, function(part) {
                        if (part.search('loop') < 0 && part.match(/[a-zA-Z\d\-\_]+\.[a-zA-Z\d\-\_]+/)) {
                            if (!DataStore.Listener.hasOwnProperty(part)) {
                                DataStore.Listener[part] = [];
                            }

                            DataStore.Listener[part].push($this);
                        }
                    });
                });
            });

            /* Creating Observer */
            $this._mdobs = new ObjectObserver($this);
            $this._mdobs.open(function(add, rem, mod) {
                foreach(add, function (key, value) {
                    //console.log(key);
                });

                foreach(rem, function (key, value) {
                    //console.log(key);
                });

                foreach(mod, function (prop, value) {
                    if (!$this._lock && $this._mdlis.hasOwnProperty(prop)) {
                        foreach($this._mdcon[prop], function (path, i) {
                            if (i === 0) {
                                $this._norender = true;
                                $this._mdval[prop][i] = value;

                                DataStore.Write(path, value);
                            }
                        });
                    }
                });

                /* Unlock observer */
                $this._lock = false;
            });

            /* Trying first render */
            try { applyBinding.call($this); } catch (err) {}
        }
    }

    /* Render Binding */
    var applyBinding = function() {
        var $this = this;

        if ($this._norender) {
            $this._norender = false;
            return;
        }

        /* Proceed when model list available */
        if ($this._mdlis) {
            /* Enumerate each item */
            foreach($this._mdlis, function(prop, type) {
                /* Preparing Value */
                var nval = $this._mddef[prop], proceed = false;

                /* Iterating Expression */
                foreach($this._mdexp[prop], function(exp, i) {
                    var dx = DataExpression(exp);

                    if (exp.search('loop') < 0) {
                        var val = dx.eval();

                        if (val) {
                            nval = nval.replace(exp, val);
                        } else {
                            nval = nval.replace(exp, '');
                        }

                        if (nval !== $this._mdval[prop][i]) {
                            /* Updating Value */
                            $this._mdval[prop][i] = val;

                            /* Tell to proceed render */
                            proceed = true;
                        }
                    }
                });

                /* Render only if should be */
                if (proceed === true) {
                    /* Lock before applying data changes */
                    $this._lock = true;

                    /* Render with the value type */
                    if (type === 'attr') {
                        $this.setAttribute(prop, nval);
                    } else if (type === 'prop') {
                        $this[prop] = nval;
                    } else if (type === 'text') {
                        $this.innerText = nval;
                    }
                }

                $this.removeAttribute('unrendered');
            });
        }
    }

    var compose = function(name, proto) {
        var protos, cores, cname;

        if (isString(name) && isObject(proto)) {
            cname = name;
            protos = proto;
        } else if (isObject(name)) {
            cname = 'ev-' + (defid + 1);
            protos = name;

            defid++;
        }

        /* Creating New Event Object */
        events.created[cname] = [];

        cores = {
            cname: cname,
            unresolved: true,

            created: function() {
                var $this = this;
                $this._model = [];

                /* Adding unrendered attribute */
                $this.setAttribute('unrendered', '');

                /* Preparing Binding */
                prepareBinding.call($this);

                return this;
            },

            /* Renderer */
            render: function() {
                applyBinding.call(this);

                return this;
            }
        }

        foreach(protos, function(prop, handler) {
            if (prop !== 'created') {
                cores[prop] = handler;
            } else {
                events[prop][cname].push(handler);
            }
        });

        if (isString(name) && isObject(proto)) {
            Polymer(name, cores);
        } else if (isObject(name)) {
            Polymer(cores);
        }
    };

    window.Compose = function(name, proto) { return new compose(name, proto); };
})();