FROM node:slim

EXPOSE 8080

# create and set working dir
RUN mkdir -p /var/www/html
WORKDIR /var/www/html

# copy all repo files
COPY . /var/www/html/

# install appropiate packages
RUN npm update \
    && npm install terser uglifycss http-server -g

# based on:
# https://unix.stackexchange.com/questions/249701/how-to-minify-javascript-and-css-with-command-line-using-minify-tool
# minification of js files
RUN find js/ -type f \
    -name "*.js" ! -name "*.min.*" ! -name "vfs_fonts*" \
    -exec echo {} \; \
    -exec terser -o {}.min {} \; \
    -exec rm {} \; \
    -exec mv {}.min {} \;

# minification of css files
RUN find css/ -type f \
    -name "*.css" ! -name "*.min.*" \
    -exec echo {} \; \
    -exec uglifycss --output {}.min {} \; \
    -exec rm {} \; \
    -exec mv {}.min {} \;

# compress js files even more with gzip
RUN gzip js/*

# start webserver on port 80
ENTRYPOINT ["/usr/local/bin/http-server", "--no-dotfiles", "--gzip", "-p", "8080"]
