/**
 * Keong.
 * Block Importer Scripts.
 * Language: Javascript.
 * Created by mahdaen on 12/28/14.
 * License: GNU General Public License v2 or later.
 */

Compose('import-block', {
    ready: function() {
        var $this = this;

        var draft = '<!-- Imported block from "' + $this.href + '" -->';

        if (isString(this.href)) {
            $.ajax({
                url: $this.href,
                dataType: 'html',
                type: 'GET'
            }).done(function(data) {
                $(draft).insertBefore($this);
                $(data).insertAfter($this);
                $this.remove();
            });
        }
    },
    nomodel: true
});
