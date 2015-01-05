/**
 * Keong.
 * Block Repeater Scripts.
 * Language: Javascript.
 * Created by mahdaen on 12/28/14.
 * License: GNU General Public License v2 or later.
 */

Polymer('exp-loop', {
    for: null,

    ready: function() {
        var $this = this;

        $this.rendered = false;
        $this._childs = [];

        if (isString($this.for)) {
            var forstr = $this.for.split(' in ');

            try { var data = DataStore.Read(forstr[1]); } catch (err) {}

            if (data) $this.render();

            if (!DataStore.Listener[forstr[1]]) {
                DataStore.Listener[forstr[1]] = [];
            }

            DataStore.Listener[forstr[1]].push($this);
        }
    },

    render: function(mode, changes) {
        var $this = this;

        if ($this.rendered) {
            foreach($this._childs, function(child) {
                child.remove();
            });
        }

        if (isString($this.for)) {
            var forstr = $this.for.split(' in ');

            var data = DataStore.Read(forstr[1]);

            if (isArray(data)) {
                foreach(data, function(value, i) {
                    var ppath = forstr[1] + '.' + i;

                    if (!DataStore.Listener.hasOwnProperty(ppath)) {
                        DataStore.Listener[ppath] = [];
                    }

                    var obj = jQuery($this.innerHTML).insertBefore($this);

                    obj.each(function() {
                        var $obj = this;

                        $this._childs.push($obj);

                        if ($obj.hasOwnProperty('_model')) {
                            DataStore.Listener[ppath].push($obj);
                        }
                    });
                });
            } else if (isObject(data)) {
                var expr = forstr[0].replace(/\s/g, '');
                expr = expr.split(',');

                foreach(data, function(key, value) {

                });
            }

            $this.rendered = true;
        }
    }
});
