# Adonis API application

This is the boilerplate for creating an API server in AdonisJs, it comes pre-configured with.

1. Bodyparser
2. Authentication
3. CORS
4. Lucid ORM
5. Migrations and seeds

## Setup

Use the adonis command to install the blueprint

```bash
adonis new yardstick --api-only
```

or manually clone the repo and then run `npm install`.

### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```

### Database Setup

The application uses MySQL 5.7 running in Docker. To start the database server:

```bash
docker run --name mysql-server \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=chat_api \
  -e MYSQL_ROOT_HOST=% \
  -p 3306:3306 \
  -d mysql:5.7
```

To stop the database server:

```bash
docker stop mysql-server
```

To start an existing database server:

```bash
docker start mysql-server
```

To remove the database server (this will delete all data):

```bash
docker rm mysql-server
```

Make sure to update your `.env` file with these database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=chat_api
```

### Testing

The application uses AdonisJS's testing framework with a separate test database. Follow these steps to run the tests:

1. Create the test database (if not already created):

```bash
docker exec mysql-server mysql -uroot -ppassword -e "CREATE DATABASE IF NOT EXISTS chat_api_test;"
```

2. Configure the test environment:

   - Copy `.env.example` to `.env.testing`
   - Update database name to `chat_api_test`
   - Adjust other values as needed

3. Run the tests:

```bash
node ace test
```

The test suite includes:

- User registration tests
- Authentication tests
- Protected route access tests

Each test run will:

- Automatically migrate the test database
- Run all tests
- Reset the database after completion
