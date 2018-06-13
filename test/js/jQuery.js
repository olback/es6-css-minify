/**
 *  Issue #1 test
 *  https://github.com/olback/es6-css-minify/issues/1
 */

(function ($) {
    class showDivWithText {
        constructor(param) {
            this.text = param;
            this.init();
        }

        init() {
            $("<div />").text(this.text).appendTo('body');
        }
    }
})(jQuery);

let a = {
    bs: "fghfghfg",
    cs: "khfgjhkjfghkljfgjhfghfggfhgf",
    ds: "gfdgdjghdfjghdfjghdfjlghfd",
    es: "aaaaaaaaaaaaaaaaaaaaaaaaa"
}
