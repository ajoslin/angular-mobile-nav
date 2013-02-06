angular-mobile-nav
==================

[Demo](http://ajoslin.github.com/angular-mobile-nav) (Only will work in webkit browsers)

[Download](http://ajoslin.github.com/angular-mobile-nav/mobile-nav.zip) (.zip)

A simple navigation service and directive which will transition between partials.  Intended for mobile applications on Android/iOS.

Licensed with MIT License.

Usage
-----

* Include `mobile-nav.js` and `mobile-nav.css` into your page
* Declare `'mobile-navigate'` as a dependency for your angular app: `angular.module('myApp', ['mobile-navigate']);`
* Setup your routes as normal with `$routeProvider`.
* Use the `$navigate` service to do your transitions, instead of `<a>` links.  Use `$navigate.go('/path')`, and `$navigate.back()`.  
* You can erase history (eg when switching tabs) with `$navigate.eraseHistory()`
* You can add transition classes of your own (check out the css file for how the current ones are done). There are three presets available: `slide`, `modal`, and `none`.  Use them in the `go` function, eg `$navigate.go('/path', 'modal')`.
* Use the `<mobile-view>` element instead of the normal `<ng-view>`.

Development
-----------

* To use the Makefile, install jshint and uglifyjs with `npm install -g jshint uglifyjs`.
* If you are on windows and can't use a Makefile, there's nothing else at the moment.
* When pushing a new build, go to the gh-pages branch and move the contents dist folder up one level (`mv dist/* .`)
