FROM node:15.4.0-buster-slim

ARG USER_UID="1001"
ARG USER_GID="1001"

EXPOSE 8080

# create and set working dir
RUN mkdir -p /var/www/html
WORKDIR /var/www/html

# copy all repo files
COPY . /var/www/html/

# install required packages
RUN npm update && npm install -g http-server

# add user and group, then change ownership to new user
RUN groupadd -g "$USER_UID" mallas \
    && useradd -m -d /home/mallas -s /bin/bash -u "$USER_UID" -g "$USER_GID" mallas \
    && chown -R "$USER_UID":"$USER_GID" /var/www/html

# drop privs to user
USER mallas

# install deps from package.json
RUN npm install

# minify code and then remove extra packages
RUN npm run build && npm run clean
RUN rm -rf scripts/

# start webserver on port 80
ENTRYPOINT ["/usr/local/bin/http-server", "--no-dotfiles", "--gzip", "-p", "8080"]
