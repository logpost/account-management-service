# Building stage
FROM node:14.2 as builder
WORKDIR /usr/src/app

ARG GIT_ACCESS_TOKEN_CURL_CONFIG

COPY *.sh *.json *.js Makefile .babelrc ./
COPY src src/ 
COPY config config/

RUN curl -o production.yml https://${GIT_ACCESS_TOKEN_CURL_CONFIG}@raw.githubusercontent.com/logpost/logpost-environment/master/environment/account-management-service/production.yml
RUN curl -o development.yml https://${GIT_ACCESS_TOKEN_CURL_CONFIG}@raw.githubusercontent.com/logpost/logpost-environment/master/environment/account-management-service/development.yml
RUN curl -o staging.yml https://${GIT_ACCESS_TOKEN_CURL_CONFIG}@raw.githubusercontent.com/logpost/logpost-environment/master/environment/account-management-service/staging.yml
RUN mv -f production.yml staging.yml development.yml config

RUN npm ci
RUN npm run build

# Starting stage
FROM node:14.2-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules node_modules/
COPY --from=builder /usr/src/app/dist dist/
COPY --from=builder /usr/src/app/config config/
COPY --from=builder /usr/src/app/package.json .
EXPOSE 8080 8080
CMD [ "npm", "run", "start:stag"]