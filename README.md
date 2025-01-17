FullStack assesssment response by Ed Borden
This document serves as a development guide for the app. See [Development Log](DEVLOG.md) for notes related to the assessment prompt and the development process.

# Chat API

A messaging API built with AdonisJS, featuring user authentication, real-time messaging, and comprehensive API versioning.

## Features

- User authentication and registration
- Real-time messaging between users
- Paginated message history
- User management
- API versioning (V1 and V2)
- Comprehensive test coverage
- MySQL database with optimized queries
- JWT authentication
- Input validation
- Error handling

## Tech Stack

- Node.js (>= 14.x)
- AdonisJS 4.1
- MySQL 5.7
- Docker (for development)
- JWT for authentication

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (>= 14.x)
- npm or yarn
- Docker and Docker Compose
- Git

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
APP_KEY=generate_a_random_key
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=chat_api
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

To manage the database container:
```bash
# Stop the database
docker stop mysql-server

# Start an existing database
docker start mysql-server

# Remove the database (deletes all data)
docker rm mysql-server
```

### Running the Application

1. Run database migrations:
```bash
node ace migration:run
```

2. Start the development server:
```bash
node ace serve --watch
```

The API will be available at `http://localhost:3333`

### Testing

The application includes comprehensive tests. To run them:

1. Set up the test database:
```bash
docker exec mysql-server mysql -uroot -ppassword -e "CREATE DATABASE IF NOT EXISTS chat_api_test;"
```

2. Configure test environment:
```bash
cp .env.example .env.testing
```

Update `.env.testing`:
```env
DB_DATABASE=chat_api_test
```

3. Run tests:
```bash
node ace test
```

### API Versions

The API supports two versions (V1 and V2) with different features and capabilities:

#### V1 Routes (`/api/v1`)
- Basic functionality without pagination
- Simple authentication
- Endpoints:
  - `/register`: User registration
  - `/login`: User authentication
  - `/users`: List all users
  - `/message`: Send and retrieve messages between users

#### V2 Routes (`/api/v2`)
- Enhanced functionality with pagination support
- Improved validation and error handling
- JWT authentication required for all routes
- Endpoints:
  - `/register`: User registration with improved validation
  - `/login`: User authentication with JWT
  - `/users`: Paginated user listing with sorting
  - `/messages`: Paginated message history between users
  
Key Differences:
1. **Authentication**:
   - V1: Basic token authentication
   - V2: JWT-based authentication required for all routes

2. **Pagination**:
   - V1: Returns all records
   - V2: Supports pagination with customizable page size (max 50 items)

3. **Response Format**:
   - V1: Basic success/error responses
   - V2: Detailed responses with pagination metadata

4. **Validation**:
   - V1: Basic input validation
   - V2: Enhanced validation with detailed error messages

5. **Error Handling**:
   - V1: Basic error responses
   - V2: Comprehensive error handling with consistent formats

For new integrations, we recommend using V2 endpoints as they provide better scalability and features.

## API Documentation

### Authentication

All V2 endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### Common Response Formats

Success Response:
```json
{
  "success_code": "200",
  "success_title": "Operation Successful",
  "success_message": "Details about the success"
}
```

Error Response:
```json
{
  "error_code": "400",
  "error_title": "Operation Failed",
  "error_message": "Details about the error"
}
```

Paginated Response:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "per_page": 10,
    "current_page": 1,
    "last_page": 10,
    "from": 1,
    "to": 10
  }
}