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
/**
 * Keong.
 * Data Provider.
 * Language: Javascript.
 * Created by mahdaen on 12/28/14.
 * License: GNU General Public License v2 or later.
 */

(function() {
    'use strict';

    /* Data Provider Holder */
    var DataStore = function() { 'Keong Data Store' };
    DataStore.Data = {};

    /* Watching DataStore to trigger ready event */
    var watchDataStore = new ObjectObserver(DataStore.Data);

    /* Openin Watcher */
    watchDataStore.open(function(added) {
        /* Enumerating Added Keys */
        foreach(Object.keys(added), function(key) {
            /* Enumerating Listener */
            foreach(DataStore.Listener, function(path, list) {
                var path = parsePath(path);

                /* Render if listened */
                if (path[0] === key) {
                    foreach(list, function(reader) {
                        reader.render('added');
                    });
                }
            });
        });
    });

    /* Collections of object that read the data */
    var DataListener = {};

    /* Observer object for each object path */
    var DataObserver = {};

    /**
     * Creating Listener for each object added to DataStore.
     * @param name - Data Provider Name
     */
    var createListener = function(name) {
        /* Name should be defined */
        if (isString(name)) {
            /* Wrapping Name */
            var xpath = name;

            /* Reading Data */
            var source = DataStore.Read(xpath);

            /* Creating standard path. e.g DataStore['foo']['bar'] */
            var spath = parsePath(xpath, true);

            /* Object Observer */
            if (isObject(source)) {
                var action = {};

                /* Creating New Observer */
                eval('DataStore.Observer["' + xpath + '"] = new ObjectObserver(' + spath + ')');

                /* Opening Observer */
                DataStore.Observer[xpath].open(function(added, removed, changed, getold) {
                    /* Placing changes key to enumerate them at once */
                    action.added = Object.keys(added);
                    action.removed = Object.keys(removed);
                    action.changed = Object.keys(changed);

                    /* Enumerating Changes */
                    foreach(action, function(type, changes) {
                        /* Enumerating each changes */
                        foreach(changes, function(key) {
                            /* Creating path to find in listener */
                            var wpath = xpath + '.' + key;

                            /* If found, render all object reader */
                            if (DataStore.Listener.hasOwnProperty(wpath)) {
                                foreach(DataStore.Listener[wpath], function(reader) {
                                    reader.render(type);

                                    var root = DataStore.ParsePath(wpath)[0];

                                    if (root !== wpath && DataListener.hasOwnProperty(root)) {
                                        foreach(DataListener[root], function (owner) {
                                            if (owner.update) {
                                                owner.update();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                });

                /* Recrusive Listener */
                foreach(source, function(key, value) {
                    var ypath = xpath + '.' + key;

                    if (isObject(value) || isArray(value)) {
                        createListener(ypath);
                    }
                });
            }

            /* Object Observer */
            else if (isArray(source)) {
                var action = {};

                /* Creating new Observer */
                eval('DataStore.Observer["' + xpath + '"] = new ArrayObserver(' + spath + ')');

                /* Opening Observer */
                DataStore.Observer[xpath].open(function(splice) {
                    foreach(splice, function(changes) {
                        /* Creating path to find listener */
                        var wpath = xpath + '.' + changes.index;
                        var mode = 'change';

                        /* Use parent if insertion */
                        if (changes.removed.length === 0) wpath = xpath;
                        if (changes.removed.length === 0) mode = 'insert';

                        /* Render all reader */
                        if (DataStore.Listener.hasOwnProperty(wpath)) {
                            foreach(DataStore.Listener[wpath], function(reader) {
                                reader.render(mode, changes);
                            });
                        }
                    });
                });

                /* Recrusive Listener */
                foreach(source, function(value, i) {
                    var ypath = xpath + '.' + i;

                    if (isObject(value) || isArray(value)) {
                        createListener(ypath);
                    }
                });
            }
        }
    }

    /**
     * Data Provider Injector
     * @param name - Data Provider Name
     * @param data - Data Provider Value. Can be string, array, object, etc.
     * @returns {*}
     */
    var DataProvider = function(name, data) {
        if (isString(name) && isDefined(data)) {
            DataStore.Data[name] = data;

            /* Indexing object to observer listener */
            createListener(name);
        }

        return data;
    };

    /**
     * Object Path Parser.
     * @param path - String path. Delimiter can be '.', ':', or '/'. Combining delimiter is valid. :)
     * @returns {Array}
     */
    var parsePath = function(path, standard) {
        var dot = [], colon = [], slash = [];

        if (isString(path)) {
            /* Enumerating path by dot */
            dot = path.split('.');

            /* Enumerating path by colon */
            foreach(dot, function(path) {
                var split = path.split(':');

                foreach(split, function (path) {
                    colon.push(path);
                });
            });

            /* Enumerating path by slash */
            foreach(colon, function(path) {
                var split = path.split('/');

                foreach(split, function (path) {
                    slash.push(path);
                });
            });
        }

        if (standard) {
            var xpt = 'DataStore.Data';

            foreach(slash, function(key) {
                xpt += '[\'' + key + '\']';
            });

            return xpt;
        } else {
            return slash;
        }
    }

    /**
     * Data Reader using Path.
     * @param path - String path to read. Delimiter can be dot (.), colon (:), or slash (/). Combining delimiter is valid.
     * @param src - Optional - Reading source.
     * @returns {*}
     */
    /* Creating Eval Context */
    var execs = {
        count: 0
    };

    var dataReader = function(path, src) {
        var source, result;

        /* Use DataStore as source if no src defined */
        isDefined(src) ? source = src : source = DataStore;

        /* Path must be defined */
        if (isString(path) && !Number(path)) {
            /* Parsing Path */
            path = parsePath(path);

            /* Getting the first path */
            var xpath = 'DataStore.Data[\'' + path[0] + '\']';

            /* Converting the rest paths to standard path */
            var ypath;
            foreach(path, function (key, i) {
                if (i > 0) {
                    xpath += '[\'' + key + '\']';
                }

                isString(ypath) ? ypath += '.' + key : ypath = key;
            });

            /* Creating Eval String */
            var estr = 'execs[' + (execs.count + 1) + '] = ' + xpath;

            /* Evaluating */
            try { eval(estr); } catch (err) {}

            /* Wrapping Result */
            result = execs[execs.count + 1];

            /* Increase Counter */
            execs.count++;
        }

        /* If found, return it. Else return undefined */
        return result;
    }

    /**
     * Data Provider Writer
     * @param path - String path to write in. Delimiter can be dot (.), colon (:), or slash (/).
     * @param value - Value to be write in.
     * @param src - Optioan - Source object.
     * @returns {*}
     */
    var dataWriter = function(path, value, src) {
        var xpath, estr, source;

        /* Use src as source if defined */
        isDefined(src) ? source = src : source = DataStore.Data;

        if (isString(path)) {
            path = parsePath(path);

            /* Getting first path */
            xpath = path[0];

            /* Lookup in DataStore first */
            if (source.hasOwnProperty(xpath)) {
                xpath = 'DataStore.Data["' + xpath + '"]';
            }

            /* Converting the rest paths to standard path */
            foreach(path, function(key, i) {
                if (i > 0) {
                    xpath += '["' + key + '"]';
                }
            });

            /* Converting to eval string with specific value type */
            if (isString(value)) {
                estr = xpath + ' = "' + value + '"';
            } else if (isObject(value) || isArray(value)) {
                var jsd = JSON.stringify(value);
                estr = xpath + ' = JSON.parse(\'' + jsd + '\')';
            } else {
                estr = xpath + ' = ' + value;
            }

            /* Evaluating */
            eval(estr);
        }

        /* Return the new value itself */
        return value;
    }

    /* Wrapping DataStore Instances */
    DataStore.Listener = DataListener;
    DataStore.Observer = DataObserver;
    DataStore.Read = dataReader;
    DataStore.Write = dataWriter;
    DataStore.ParsePath = parsePath;

    /* Registering DataStore and DataProvider to window */
    window.DataStore = DataStore;
    window.DataProvider = function(name, data) { return new DataProvider(name, data) };
})();
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