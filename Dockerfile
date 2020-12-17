FROM node:buster-slim

ARG USER_UID="1001"
ARG USER_GID="1001"

EXPOSE 8080

# create and set working dir
RUN mkdir -p /var/www/html
WORKDIR /var/www/html

# copy all repo files
COPY . /var/www/html/

# install required packages
RUN npm update \
    && npm install -g http-server terser uglifycss

# add user and group, then change ownership to new user
RUN groupadd -g "$USER_UID" mallas \
    && useradd -m -d /home/mallas -s /bin/bash -u "$USER_UID" -g "$USER_GID" mallas \
    && chown -R "$USER_UID":"$USER_GID" /var/www/html

# drop privs to user
USER mallas

# install packages from package.json
RUN npm install

# based on:
# https://unix.stackexchange.com/questions/249701/how-to-minify-javascript-and-css-with-command-line-using-minify-tool
# minification of js files
RUN find js/ -type f \
    -name "*.js" ! -name "*.min.*" ! -name "vfs_fonts*" \
    -exec echo {} \; \
    -exec terser -o {}.min {} \; \
    -exec rm {} \; \
    -exec mv -f {}.min {} \;

# minification of css files
RUN find css/ -type f \
    -name "*.css" ! -name "*.min.*" \
    -exec echo {} \; \
    -exec uglifycss --output {}.min {} \; \
    -exec rm {} \; \
    -exec mv -f {}.min {} \;

# compress js files even more with gzip
RUN gzip js/*

# start webserver on port 80
ENTRYPOINT ["/usr/local/bin/http-server", "--no-dotfiles", "--gzip", "-p", "8080"]
