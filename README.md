angular-mobile-nav
==================

[](Plunker Example)

A simple navigation service and directive which will transition between partials.  Intended for mobile applications.

Usage
-----

* Setup your routes as normal with `$routeProvider`.
* Use the `$mobileNav` service to do your transition, instead of `<a>` links.  Use `$mobileNav.go('/path')`, and `$mobileNav.back()`.  
* If you wish to change URLs without adding to the history (Eg for tabs on a mobile app, you want to go somewhere but not add to the history for tab press), use `$mobileNav.goNoHistory('/path')`.

TODO
----

* Add phonegap event listener for android back button
* Make android back button exit app if history stack is empty
* Make transition type configurable either by class name or give transition type strings people can use ("slide", "slideVertical", etc)
