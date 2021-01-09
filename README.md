# account-management-service

## Pre-requires 👻

-   Docker
-   NPM
-   Node (LTS version)

## Installation 🎉

```sh
npm install
```

## Building 🔧

```sh
npm run build
```

## Starting 🚀

```sh
npm run start:dev # development mode
# or
npm run start:stag # staging mode
# or
npm run start:prod # production mode
```

## Branch 🔥

-   develop : Branch for development
-   stag-release-image: Branch for release to GCR: GCR is registry for storing image.
-   stag-release: Branch for release to Cloud Run (GCP) (staging environment)

## Dependencies 🤖

-   [async-redis](https://ghub.io/async-redis): Light wrapper over redis_node with first class async &amp; promise support.
-   [axios](https://ghub.io/axios): Promise based HTTP client for the browser and node.js
-   [bcrypt](https://ghub.io/bcrypt): A bcrypt library for NodeJS.
-   [config-yaml](https://ghub.io/config-yaml): YAML configuration for NodeJS
-   [cookie-parser](https://ghub.io/cookie-parser): Parse HTTP request cookies
-   [cors](https://ghub.io/cors): Node.js CORS middleware
-   [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
-   [jsonwebtoken](https://ghub.io/jsonwebtoken): JSON Web Token implementation (symmetric and asymmetric)
-   [mongoose](https://ghub.io/mongoose): Mongoose MongoDB ODM
-   [nodemailer](https://ghub.io/nodemailer): Easy as cake e-mail sending from your Node.js applications
-   [passport](https://ghub.io/passport): Simple, unobtrusive authentication for Node.js.
-   [passport-jwt](https://ghub.io/passport-jwt): Passport authentication strategy using JSON Web Tokens

## Dev Dependencies 👻

-   [@babel/cli](https://ghub.io/@babel/cli): Babel command line.
-   [@babel/core](https://ghub.io/@babel/core): Babel compiler core.
-   [@babel/node](https://ghub.io/@babel/node): Babel command line
-   [@babel/plugin-proposal-class-properties](https://ghub.io/@babel/plugin-proposal-class-properties): This plugin transforms static class properties as well as properties declared with the property initializer syntax
-   [@babel/preset-env](https://ghub.io/@babel/preset-env): A Babel preset for each environment.
-   [nodemon](https://ghub.io/nodemon): Simple monitor script for use during development of a node.js app.

## Contributor 🤓

-   [POONSHT - 6010500109](https://github.com/aslupin)
-   [ASMBD - 6010502748](https://github.com/asmbd)

## License

MIT
