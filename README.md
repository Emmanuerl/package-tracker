# Package Tracker

![alt text](https://github.com/Emmanuerl/package-tracker/blob/main/documentation/logo.png?raw=true)

a simple demonstration of a package status tracking service

## Business Constraints

1. Recording package entries

- title and size of package is required
- description is optional
- status of package defaults to "WAREHOUSE" if no status is specified

2. Updating package status

- A package status can only be in "DELIVERED" once throughout it's existence
- A package status can only be in "PICKED_UP" once throughout it's existence
- Package status can move from one status to the other provided the aforementioned constraints are followed

## Tools Used

- NodeJS (v16 recommended)
- Postgres (v14 recommended)

## App specifications

- TS driven
- Inversify for IOC
- KnexJS for database communications
- Migrations are written in raw SQL (yes, i like stress 🌚)

## How to run locally

- Clone The project and CD into project root directory

- Install app dependencies

```
$ npm install
```

- Configure environment variables

```
$ cp .env.example .env
# replace the contents of .env with your desired values
```

- Ensure postgres is running locally

- Run build command

```
$ npm run build
```

- Start server

```
$ npm start
```

### To run in watch mode

- Create another terminal tab and ensure the new tab is in the project's root directory

```
# tab 1
$ npm run watch
```

```
# tab 2
$ npm run start:dev
```

## Testing

Tests are handled using Jest. To run tests, run the following command

```
$ npm test
```

# Contributors

[Chukwuemeka Chukwurah](https://github.com/emmanuerl)
