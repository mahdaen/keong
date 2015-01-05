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