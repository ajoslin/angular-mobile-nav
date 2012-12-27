angular-mobile-nav
==================

[Demo](http://ajoslin.github.com/angular-mobile-nav) (Only will work in webkit browsers)

A simple navigation service and directive which will transition between partials.  Intended for mobile applications on Android/iOS.

Usage
-----

* Setup your routes as normal with `$routeProvider`.
* Use the `$navigate` service to do your transition, instead of `<a>` links.  Use `$navigate.go('/path')`, and `$navigate.back()`.  
* You can erase history (eg when switching tabs) with `$navigate.eraseHistory()`
* You can add transition classes of your own (check out the css file for how the current ones are done). There are three presets available: `slide`, `modal`, and `none`.  Use them in the `go` function, eg `$navigate.go('/path', 'modal')`.
* Use the `<mobile-view>` element instead of the normal `<ng-view>`.

Development
-----------

* To use the Makefile, install jshint and uglifyjs with `npm install -g jshint uglifyjs`.
* If you are on windows and can't use a Makefile, there's nothing else at the moment.

TODO
----

* Add automated tests to run on iOS/Android (probably github page with "Run tests" button)
