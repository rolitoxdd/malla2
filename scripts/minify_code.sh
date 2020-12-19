#!/bin/bash

# based on:
# https://unix.stackexchange.com/questions/249701/how-to-minify-javascript-and-css-with-command-line-using-minify-tool
# minification of js files
find js/ -type f \
    -name "*.js" ! -name "*.min.*" ! -name "vfs_fonts*" \
    -exec echo {} \; \
    -exec npx terser -o {}.min {} \; \
    -exec rm {} \; \
    -exec mv -f {}.min {} \;

# minification of css files
find css/ -type f \
    -name "*.css" ! -name "*.min.*" \
    -exec echo {} \; \
    -exec npx uglifycss --output {}.min {} \; \
    -exec rm {} \; \
    -exec mv -f {}.min {} \;

# compress js files even more with gzip
gzip js/*
