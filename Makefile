DIST=dist
VERSION=
FILENAME=${DIST}/mobile-nav${VERSION}

default: lint build min demo
	rm -f ${FILENAME}.zip
	zip ${FILENAME}.zip ${DIST}/*.js ${DIST}/*.css

lint:
	jshint src/*

build: 
	mkdir -p dist
	cat src/*.js > ${FILENAME}.js
	cat src/*.css > ${FILENAME}.css

min: build
	uglifyjs < ${FILENAME}.js > ${FILENAME}.min.js

demo:
	cp -R demo/* dist

.PHONY: lint build min demo
  
