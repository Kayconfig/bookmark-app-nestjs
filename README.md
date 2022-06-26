# BOOKMARK MANAGER API

## Description

This API enables users to manage their bookmarks efficiently.

## Requirement

### DOCKER

Docker needs to be installed to run and test this Application

### MANUAL

Setup your local Postgres server and put the url in .env file, or .env.test to perform test.

## Installation

Navigate to the root folder of the project.

```bash
$ yarn
```

## Setting up the app

Running the following sets up and starts the app automatically for dev or testing.

```bash
$ yarn start:dev

or

$ yarn test:e2e

```

## Running the app

```bash
# start in development mode ( watch mode)
$ yarn start:dev

# production mode
$ yarn start:prod

```

## Test

```bash
# e2e tests
$ yarn test:e2e

```

shutdown all db instances on docker

```bash
yarn db:shutdown
```
