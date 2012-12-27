TARGET=dist/mobile-nav

default: lint build min

lint:
	jshint src/*

build: 
	mkdir -p dist
	cat src/*.js > ${TARGET}.js
	cat src/*.css > ${TARGET}.css

min: build
	uglifyjs < ${TARGET}.js > ${TARGET}.min.js

.PHONY: lint build min
  
