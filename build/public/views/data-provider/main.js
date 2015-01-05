/**
 * Keong.
 * Data Provider Scripts.
 * Language: Javascript.
 * Created by mahdaen on 12/28/14.
 * License: GNU General Public License v2 or later.
 */

Compose('data-provider', {
    ready: function() {
        var $this = this;

        if (isString($this.name) && isString($this.src)) {
            $.ajax({ url: $this.src, dataType: 'JSON' }).done(function(data) {
                if (!DataStore.Listener.hasOwnProperty($this.name)) {
                    DataStore.Listener[$this.name] = [];
                }

                /* Storing data to DataStore */
                DataProvider($this.name, data);

                /* Creating new Listener */
                DataStore.Listener[$this.name].push($this);
            });
        } else {
            console.warn('DataProvider name must be defined!');
            console.log(this.outerHTML);
        }
    },
    update: function() {
        var $this = this;
        var data = DataStore.Read($this.name);

        console.log(data);
    },
    nomodel: true
});
