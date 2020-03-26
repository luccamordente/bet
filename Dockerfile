FROM node:13.10.1-alpine3.11

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

WORKDIR /app
COPY . .
