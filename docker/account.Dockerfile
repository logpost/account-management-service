# Building stage
FROM node:14.2 as builder
WORKDIR /usr/src/app

COPY . .
RUN npm ci
RUN npm run build
RUN ls -al

# Starting stage
FROM node:14.2-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules node_modules/
COPY --from=builder /usr/src/app/dist dist/
COPY --from=builder /usr/src/app/config config/
COPY --from=builder /usr/src/app/package.json .
EXPOSE 5000 5000
CMD [ "npm", "run", "start:prod"]