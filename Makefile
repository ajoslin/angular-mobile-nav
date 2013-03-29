DIST=dist
VERSION=
FILENAME=${DIST}/mobile-nav${VERSION}

default: lint build demo

lint:
	jshint src/*.js

build: concat min
	rm -f ${FILENAME}.zip
	zip ${FILENAME}.zip ${DIST}/*.js ${DIST}/*.css

concat: 
	mkdir -p dist
	cat src/*.js > ${FILENAME}.js
	cat src/*.css > ${FILENAME}.css

min:
	uglifyjs < ${FILENAME}.js > ${FILENAME}.min.js

demo:
	cp -R demo/* dist

.PHONY: lint build concat min demo
  
