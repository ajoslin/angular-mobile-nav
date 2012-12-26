angular-mobile-nav
==================

[Demo](http://embed.plnkr.co/5CmSiz5d5qoDRQlwiKxf) (Only will work in webkit browsers.  Intended for Android/iOS)

A simple navigation service and directive which will transition between partials.  Intended for mobile applications.

Usage
-----

* Setup your routes as normal with `$routeProvider`.
* Use the `$navigate` service to do your transition, instead of `<a>` links.  Use `$mobileNav.go('/path')`, and `$mobileNav.back()`.  
* You can erase history (eg when switching tabs) with `$navigate.eraseHistory()`
* You can add transition classes of your own (check out the css file for how the current ones are done). There are three presets available: `slide`, `modal`, and `none`.  Use them in the `go` function, eg `$navigate.go('/path', 'modal')`.
* Use the `<mobile-view>` element instead of the normal `<ng-view>`.

TODO
----

* Add tests to run on iOS/Android (probably github page with "Run tests" button)
* Add more full-fledged demo (github page with iUi or something)
