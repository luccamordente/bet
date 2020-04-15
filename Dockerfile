FROM node:13.13.0-alpine3.11

ARG INSTALL_CHROMIUM=false
RUN test ${INSTALL_CHROMIUM} = false || ( \
  echo http://nl.alpinelinux.org/alpine/edge/community > /etc/apk/repositories \
  && echo http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
  && apk add --no-cache chromium=80.0.3987.132-r2 \
)

ENV CHROME_BIN=/usr/bin/chromium-browser \
  CHROME_PATH=/usr/lib/chromium/ \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Add non-privileged user
RUN addgroup -S apprunner && adduser -S -g apprunner apprunner \
  # Chromium needs user home and downloads directories
  && mkdir -p /home/apprunner/Downloads \
  && chown -R apprunner:apprunner /home/apprunner

WORKDIR /app
COPY . .
RUN yarn install --immutable --immutable-cache

# Run everything after as non-privileged user.
USER apprunner
