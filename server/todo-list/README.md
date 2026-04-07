# Todo App

A personal task management application built with the Quarkus framework in Java. The application provides CRUD (Create, Read, Update, Delete) functionality for todos with JWT user authentication.

## Key Features

- ✅ **Registration and Login**: User authentication with JWT
- ✅ **Todo Management**: Create, read, update, delete tasks
- ✅ **Filtering and Search**: Filter by status, priority, due date
- ✅ **Pagination**: Support for pagination in todo lists
- ✅ **API Documentation**: Swagger UI for API testing
- ✅ **Security**: JWT authentication and role-based authorization

## Technical Architecture

- **Framework**: Quarkus (Java)
- **Database**: PostgreSQL
- **ORM**: Hibernate Panache
- **Security**: JWT (SmallRye JWT)
- **API**: RESTful with JAX-RS
- **Build Tool**: Gradle
- **Testing**: JUnit + Mockito

## System Requirements

- Java 11 or higher
- PostgreSQL 12+
- Gradle 7+

## Installation and Running

### 1. Clone repository

```bash
git clone <repository-url>
cd todo-app
```

### 2. Database Configuration

Create PostgreSQL database:

```sql
CREATE DATABASE todo;
CREATE USER postgres WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE todo TO postgres;
```

### 3. Environment Variables Configuration

Create a `.env` file in the project root directory or set environment variables:

```bash
# Database configuration
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=123456
DATABASE_URL=jdbc:postgresql://localhost:5432/todo
```

**Note**: If environment variables are not set, the application will use default values:

- DATABASE_USERNAME: todo_user
- DATABASE_PASSWORD: todo_pass
- DATABASE_URL: jdbc:postgresql://localhost:5432/todo_db

### 4. JWT Keys Configuration

Generate RSA key pair for JWT:

```bash
# Generate private key
openssl genrsa -out src/main/resources/META-INF/resources/privateKey.pem 2048

# Generate public key from private key
openssl rsa -pubout -in src/main/resources/META-INF/resources/privateKey.pem -out src/main/resources/META-INF/resources/publicKey.pem
```

### 5. Run the application

#### Development mode (recommended)

```bash
./gradlew quarkusDev
```

The application will run at: http://localhost:8080

#### Production build

```bash
./gradlew build
java -jar build/quarkus-app/quarkus-run.jar
```

#### Native executable

```bash
./gradlew build -Dquarkus.native.enabled=true
./build/todo-app-1.0.0-SNAPSHOT-runner
```

## API Endpoints

### Authentication

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/auth/register` | Register a new account      |
| POST   | `/auth/login`    | Login and receive JWT token |

### Todos (requires JWT token)

| Method | Endpoint      | Description                    |
| ------ | ------------- | ------------------------------ |
| POST   | `/todos`      | Create a new todo              |
| GET    | `/todos`      | Get list of todos with filters |
| GET    | `/todos/{id}` | Get todo by ID                 |
| PUT    | `/todos/{id}` | Update todo                    |
| DELETE | `/todos/{id}` | Delete todo                    |
| DELETE | `/todos`      | Delete all todos               |

### Query Parameters for GET /todos

- `completed`: `true`/`false` - Filter by completion status
- `searchText`: String - Search in title
- `priority`: `LOW`/`MEDIUM`/`HIGH` - Filter by priority
- `dueDateBefore`: ISO DateTime - Todos due before this date
- `limit`: Integer - Number of items per page
- `offset`: Integer - Starting index

## API Usage Examples

### 1. Registration

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

Response will contain JWT token.

### 3. Create Todo

```bash
curl -X POST http://localhost:8080/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project report",
    "description": "Quarterly report",
    "priority": "HIGH",
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

### 4. Get List of Todos

```bash
curl -X GET "http://localhost:8080/todos?completed=false&priority=HIGH" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Documentation

- **Swagger UI**: http://localhost:8080/q/swagger-ui
- **OpenAPI Spec**: http://localhost:8080/q/openapi
- **Dev UI**: http://localhost:8080/q/dev (only in dev mode)

## Detailed Operational Flows

### 1. User Registration Flow

```
Client Request → AuthController.register() → UserService.register() → UserRepository.saveUser() → Database
```

**Details:**

- **Endpoint**: `POST /auth/register`
- **HTTP Method**: POST
- **Content-Type**: application/json
- **Input**: `RegisterRequest` (email, password)
- **Validation**:
  - Email does not exist in database
  - Password must be at least 10 characters long
  - Email must be in valid format (additional validation possible)
- **Detailed Steps**:
  1. AuthController receives request and calls UserService.register()
  2. UserService checks if email exists via UserRepository.existsByEmail()
  3. If email exists, throw Exception "Email already exists"
  4. Check password length, if < 10 throw Exception "Password must be at least 10 characters long"
  5. Create new User entity with email and hashed password
  6. Call PasswordEncoder.hash() to hash password with BCrypt (cost factor 12)
  7. Set default fields: active = true, createdAt = Instant.now()
  8. Call UserRepository.saveUser() to persist entity
  9. Return successful MessageResponse
- **Database Operations**: INSERT into users table
- **Error Scenarios**:
  - Email already exists: 400 Bad Request
  - Password too short: 400 Bad Request
  - Database connection error: 500 Internal Server Error
- **Response**: `MessageResponse` ("Registered Successfully!")

**Request Example:**

```json
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

**Response Example:**

```json
{
  "message": "Registered Successfully!"
}
```

### 2. Login Flow

```
Client Request → AuthController.login() → UserService.login() → JwtGenerator.generateToken() → Client
```

**Details:**

- **Endpoint**: `POST /auth/login`
- **HTTP Method**: POST
- **Content-Type**: application/json
- **Input**: `LoginRequest` (email, password)
- **Validation**:
  - User with email must exist in database
  - Account must be active (active = true)
  - Password must match stored hash
- **Detailed Steps**:
  1. AuthController receives request and calls UserService.login()
  2. UserService calls UserRepository.findByEmail() to find user
  3. If user does not exist, throw Exception "User not found!"
  4. Check user.active, if false throw Exception "Account is inactive!"
  5. Call PasswordEncoder.verifyPassword() to compare password with hash
  6. If not match, throw Exception "Invalid credentials!"
  7. If successful, call JwtGenerator.generateToken() with subject = email
  8. JwtGenerator creates JWT with:
     - Issuer: "todo-app"
     - Subject: email
     - Groups: "User"
     - Expires: 24 hours from creation time
     - Signed with private key
  9. Return LoginResponse with token
- **Security**: Use BCrypt.verifyer() to verify password
- **Error Scenarios**:
  - User does not exist: 401 Unauthorized
  - Account inactive: 401 Unauthorized
  - Wrong password: 401 Unauthorized
- **Response**: `LoginResponse` (token)

**Request Example:**

```json
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

**Response Example:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

### 3. Create Todo Flow

```
Client Request (JWT) → TodoController.createTodo() → TodoService.createTodo() → TodoRepository.saveTodo() → Database
```

**Details:**

- **Endpoint**: `POST /todos`
- **HTTP Method**: POST
- **Content-Type**: application/json
- **Authentication**: Required (JWT token in Authorization header)
- **Authorization**: @RolesAllowed("User")
- **Input**: `CreateTodoRequest` (title, description, dueDate, priority, status)
- **Validation**:
  - JWT token valid and not expired
  - User has "User" role
  - Title not null and <= 100 characters
  - Authenticated user exists in database
- **Detailed Steps**:
  1. TodoController receives request, inject JsonWebToken to get user email from subject
  2. Call TodoService.createTodo(userEmail, request)
  3. TodoService calls TodoSupportService.validateAndPrepareTodo() to validate title
  4. Call TodoSupportService.findUserByEmail() to get User entity
  5. Create new Todo entity
  6. Set user = found User
  7. Call TodoSupportService.setTodoFields() to set fields from request
  8. Set default values if not provided:
     - priority = MEDIUM if null
     - status = PENDING if null
  9. Set createdAt = Instant.now()
  10. Call TodoRepository.saveTodo() to persist
  11. Call TodoSupportService.mapTodoResponse() to create response
  12. Return TodoResponse
- **Database Operations**: INSERT into todos table
- **Security Checks**: JWT validation, role-based authorization
- **Error Scenarios**:
  - JWT invalid/expired: 401 Unauthorized
  - User not found: 400 Bad Request
  - Title too long: 400 Bad Request
- **Response**: `TodoResponse` (todo details)

**Request Example:**

```json
POST /todos
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "title": "Complete project report",
  "description": "Finish the quarterly report by Friday",
  "dueDate": "2024-01-15T17:00:00Z",
  "priority": "HIGH",
  "status": "PENDING"
}
```

**Response Example:**

```json
{
  "id": 1,
  "title": "Complete project report",
  "description": "Finish the quarterly report by Friday",
  "completed": false,
  "dueDate": "2024-01-15T17:00:00Z",
  "priority": "HIGH",
  "status": "PENDING",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": null
}
```

### 4. Get Todos Flow

```
Client Request (JWT) → TodoController.getTodos() → TodoService.getTodos() → TodoRepository.findByUserWithFilters() → Database
```

**Details:**

- **Endpoint**: `GET /todos`
- **HTTP Method**: GET
- **Authentication**: Required (JWT token)
- **Authorization**: @RolesAllowed("User")
- **Query Parameters**:
  - `completed`: Boolean (true/false/null)
  - `searchText`: String (search in title, case-insensitive)
  - `priority`: String (LOW/MEDIUM/HIGH)
  - `dueDateBefore`: String (ISO instant format)
  - `limit`: Integer (number of items per page)
  - `offset`: Integer (starting index)
- **Detailed Steps**:
  1. TodoController receives request, get userEmail from JWT subject
  2. Parse dueDateBefore from String to Instant if provided
  3. Call TodoService.getTodos() with all parameters
  4. TodoService calls TodoSupportService.findUserByEmail() to get User
  5. Call TodoRepository.findByUserWithFilters() with conditions:
     - user = found User
     - If searchText provided: title like '%searchText%' (case-insensitive)
     - If priority provided: priority = priority.toLowerCase()
     - If dueDateBefore provided: dueDate < dueDateBefore
     - If completed provided: completed = completed
  6. Sort results by createdAt DESC (newest first)
  7. If limit/offset provided: apply pagination (subList from offset to offset+limit)
  8. Iterate through list, call TodoSupportService.mapTodoResponse() for each Todo
  9. Return List<TodoResponse>
- **Database Operations**: SELECT with dynamic WHERE clauses
- **Performance**: Use Panache query with parameters to avoid SQL injection
- **Sorting**: Always sort by createdAt DESC
- **Pagination**: Manual pagination after query (can be optimized with LIMIT/OFFSET in query)
- **Error Scenarios**:
  - JWT invalid: 401 Unauthorized
  - User not found: 400 Bad Request
  - Invalid date format: 400 Bad Request
- **Response**: `List<TodoResponse>`

**Request Example:**

```
GET /todos?completed=false&searchText=project&priority=HIGH&limit=10&offset=0
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

**Response Example:**

```json
[
  {
    "id": 1,
    "title": "Complete project report",
    "description": "Finish the quarterly report",
    "completed": false,
    "dueDate": "2024-01-15T17:00:00Z",
    "priority": "HIGH",
    "status": "PENDING",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": null
  }
]
```

### 5. Get Todo by ID Flow

```
Client Request (JWT) → TodoController.getTodo() → TodoService.getTodoById() → TodoSupportService.findTodoByIdAndUser() → Database
```

**Details:**

- **Endpoint**: `GET /todos/{id}`
- **HTTP Method**: GET
- **Authentication**: Required (JWT token)
- **Authorization**: @RolesAllowed("User")
- **Path Parameters**: `id` (Long) - Todo ID
- **Detailed Steps**:
  1. TodoController receives request, get userEmail from JWT subject
  2. Parse id from path parameter
  3. Call TodoService.getTodoById(userEmail, id)
  4. TodoService calls TodoSupportService.findTodoByIdAndUser(userEmail, id)
  5. TodoSupportService.findUserByEmail() to get User entity
  6. TodoService.findById(id) to find Todo
  7. Check Todo exists and belongs to user: todo.user.equals(foundUser)
  8. If not found or not owned by user: throw Exception "Todo not found"
  9. Call TodoSupportService.mapTodoResponse(todo) to create response
  10. Return TodoResponse
- **Security**: Ownership check - user can only access their own todos
- **Database Operations**: SELECT todo WHERE id = ? AND user_id = ?
- **Status Computation**: In mapTodoResponse, call computeStatus():
  - If completed = true: COMPLETED
  - If overdue (dueDate < now() && !completed): OVERDUE
  - Otherwise: return current status (PENDING, IN_PROGRESS, etc.) or PENDING if null
- **Error Scenarios**:
  - JWT invalid: 401 Unauthorized
  - Todo not found: 404 Not Found
  - User not found: 400 Bad Request
- **Response**: `TodoResponse`

**Request Example:**

```
GET /todos/1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

**Response Example:**

```json
{
  "id": 1,
  "title": "Complete project report",
  "description": "Finish the quarterly report by Friday",
  "completed": false,
  "dueDate": "2024-01-15T17:00:00Z",
  "priority": "HIGH",
  "status": "PENDING",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": null
}
```

### 6. Update Todo Flow

```
Client Request (JWT) → TodoController.updateTodo() → TodoService.updateTodo() → TodoRepository.saveTodo() → Database
```

**Details:**

- **Endpoint**: `PUT /todos/{id}`
- **HTTP Method**: PUT
- **Content-Type**: application/json
- **Authentication**: Required (JWT token)
- **Authorization**: @RolesAllowed("User")
- **Path Parameters**: `id` (Long) - Todo ID to update
- **Input**: `UpdateTodoRequest` (title, description, dueDate, priority, status, completed)
- **Validation**:
  - JWT valid and user has "User" role
  - Todo exists and belongs to user
  - Title <= 100 characters if provided
- **Detailed Steps**:
  1. TodoController receives request, get userEmail from JWT subject
  2. Parse id from path parameter
  3. Validate request fields via TodoSupportService.validateAndPrepareTodo()
  4. Call TodoService.updateTodo(userEmail, id, request)
  5. TodoService calls TodoSupportService.findTodoByIdAndUser() to get Todo
  6. Set updatedAt = Instant.now()
  7. Call TodoSupportService.setTodoFields() to update fields from request
  8. If request.completed != null: set todo.completed = request.completed
  9. Entity auto-persists (PanacheEntity)
  10. Call TodoSupportService.mapTodoResponse() to create response
  11. Return TodoResponse
- **Database Operations**: UPDATE todos SET ... WHERE id = ? AND user_id = ?
- **Field Updates**: Only update fields provided in request
- **Status Logic**: Status computed in mapTodoResponse based on completed and dueDate
- **Error Scenarios**:
  - JWT invalid: 401 Unauthorized
  - Todo not found: 400 Bad Request
  - Title too long: 400 Bad Request
- **Response**: `TodoResponse` (updated todo)

**Request Example:**

```json
PUT /todos/1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "title": "Complete project report - Updated",
  "completed": true,
  "status": "COMPLETED"
}
```

**Response Example:**

```json
{
  "id": 1,
  "title": "Complete project report - Updated",
  "description": "Finish the quarterly report by Friday",
  "completed": true,
  "dueDate": "2024-01-15T17:00:00Z",
  "priority": "HIGH",
  "status": "COMPLETED",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-12T14:30:00Z"
}
```

### 7. Delete Todo Flow

```
Client Request (JWT) → TodoController.deleteTodo() → TodoService.deleteTodo() → TodoRepository.deleteTodo() → Database
```

**Details:**

- **Endpoint**: `DELETE /todos/{id}`
- **HTTP Method**: DELETE
- **Authentication**: Required (JWT token)
- **Authorization**: @RolesAllowed("User")
- **Path Parameters**: `id` (Long) - Todo ID to delete
- **Detailed Steps**:
  1. TodoController receives request, get userEmail from JWT subject
  2. Parse id from path parameter
  3. Call TodoService.deleteTodo(userEmail, id)
  4. TodoService calls TodoSupportService.findTodoByIdAndUser() to get Todo
  5. Check Todo exists and belongs to user
  6. Call TodoRepository.deleteTodo(todo) to delete entity
  7. Return successful MessageResponse
- **Database Operations**: DELETE FROM todos WHERE id = ?
- **Security**: Only allow deleting user's own todos
- **Cascade**: No cascade delete (todos have no foreign keys)
- **Error Scenarios**:
  - JWT invalid: 401 Unauthorized
  - Todo not found: 400 Bad Request
- **Response**: `MessageResponse` ("Todo deleted successfully!")

**Request Example:**

```
DELETE /todos/1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

**Response Example:**

```json
{
  "message": "Todo deleted successfully!"
}
```

### 8. Delete All Todos Flow

```
Client Request (JWT) → TodoController.deleteAllTodos() → TodoService.deleteAllTodos() → TodoRepository.deleteAllByUser() → Database
```

**Details:**

- **Endpoint**: `DELETE /todos`
- **HTTP Method**: DELETE
- **Authentication**: Required (JWT token)
- **Authorization**: @RolesAllowed("User")
- **Detailed Steps**:
  1. TodoController receives request, get userEmail from JWT subject
  2. Call TodoService.deleteAllTodos(userEmail)
  3. TodoService calls UserService.findByEmail() to get User entity
  4. If user does not exist: throw Exception "User not found"
  5. Call TodoRepository.deleteAllByUser(user) to delete all user's todos
  6. Return successful MessageResponse
- **Database Operations**: DELETE FROM todos WHERE user_id = ?
- **Security**: Only delete current user's todos
- **Performance**: Use batch delete via Panache
- **Warning**: Operation cannot be undone - permanently deletes all todos
- **Error Scenarios**:
  - JWT invalid: 401 Unauthorized
  - User not found: 400 Bad Request
- **Response**: `MessageResponse` ("All todos deleted successfully!")

**Request Example:**

```
DELETE /todos
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

**Response Example:**

```json
{
  "message": "All todos deleted successfully!"
}
```

## Entities and Relationships

### User Entity

- `id`: Long (Primary Key)
- `email`: String (Unique)
- `passwordHash`: String
- `active`: Boolean (default: true)
- `createdAt`: Instant

### Todo Entity

- `id`: Long (Primary Key, from PanacheEntity)
- `title`: String
- `description`: String
- `completed`: Boolean (default: false)
- `dueDate`: Instant
- `priority`: PriorityEnum (LOW, MEDIUM, HIGH)
- `status`: StatusEnum (PENDING, IN_PROGRESS, COMPLETED, OVERDUE)
- `user`: User (Many-to-One)
- `createdAt`: Instant
- `updatedAt`: Instant

**Relationship**: Todo belongs to User (Many-to-One)

## Security Implementation

- **JWT Authentication**: Using SmallRye JWT
- **Password Hashing**: BCrypt with cost factor 12
- **Authorization**: @RolesAllowed("User") for all Todo endpoints
- **Token Expiration**: 24 hours

## Database Schema

- **users** table: id, email, password_hash, active, created_at
- **todos** table: id, title, description, completed, due_date, priority, status, user_id, created_at, updated_at

## Error Handling

- Use try-catch in controllers
- Return ErrorResponse with message and status code
- Common exceptions: User not found, Todo not found, Invalid credentials, etc.

## Configuration

- PostgreSQL connection
- Hibernate ORM with schema update
- JWT keys (private/public key files)
- Swagger UI at /q/swagger-ui

## DTOs and Enums

### Request DTOs

- **RegisterRequest**: `{email: String, password: String}`
- **LoginRequest**: `{email: String, password: String}`
- **CreateTodoRequest**: `{title: String, description?: String, dueDate?: Instant, priority?: PriorityEnum, status?: StatusEnum}`
- **UpdateTodoRequest**: `{title?: String, description?: String, dueDate?: Instant, priority?: PriorityEnum, status?: StatusEnum, completed?: Boolean}`

### Response DTOs

- **LoginResponse**: `{token: String}`
- **TodoResponse**: `{id: Long, title: String, description: String, completed: Boolean, dueDate: Instant, priority: PriorityEnum, status: StatusEnum, createdAt: Instant, updatedAt: Instant}`
- **MessageResponse**: `{message: String}`
- **ErrorResponse**: `{message: String, statusCode: Integer}`

### Enums

- **PriorityEnum**: LOW, MEDIUM, HIGH
- **StatusEnum**: PENDING, IN_PROGRESS, COMPLETED, OVERDUE

## Performance Considerations

- **Database Queries**: Use Panache to optimize queries
- **Pagination**: Manual pagination may be slow with large datasets
- **JWT Validation**: Performed on each protected request
- **Password Hashing**: BCrypt cost factor 12 - balance between security and performance

## Monitoring and Logging

- Hibernate SQL logging enabled (`quarkus.hibernate-orm.log.sql=true`)
- Request/Response logging via Quarkus
- Error logging in controllers
- JWT token validation logging

## Testing

### Run all tests

```bash
./gradlew test
```

### Run tests with coverage

```bash
./gradlew test jacocoTestReport
```

### Test categories

- **Unit Tests**: Test services and repositories
- **Integration Tests**: Test controllers with database
- **Security Tests**: Test JWT authentication

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── todo/app/
│   │       ├── auth/
│   │       │   ├── controller/AuthController.java
│   │       │   └── dto/
│   │       ├── common/
│   │       │   ├── security/
│   │       │   └── dto/
│   │       ├── todo/
│   │       │   ├── controller/TodoController.java
│   │       │   ├── service/
│   │       │   ├── repository/TodoRepository.java
│   │       │   └── entity/
│   │       └── user/
│   │           ├── service/UserService.java
│   │           └── repository/UserRepository.java
│   └── resources/
│       ├── application.properties
│       └── META-INF/resources/
└── test/
    └── java/
        └── todo/app/
```

## Configuration

### application.properties

```properties
# PostgreSQL datasource
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=${DATABASE_USERNAME:todo_user}
quarkus.datasource.password=${DATABASE_PASSWORD:todo_pass}
quarkus.datasource.jdbc.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/todo_db}

# Hibernate ORM
quarkus.hibernate-orm.database.generation=update
quarkus.hibernate-orm.log.sql=true

# JWT Security
quarkus.smallrye-jwt.enabled=true
smallrye.jwt.sign.key.location=META-INF/resources/privateKey.pem
mp.jwt.verify.publickey.location=META-INF/resources/publicKey.pem
mp.jwt.verify.issuer=todo-app

# Swagger UI
quarkus.swagger-ui.path=/q/swagger-ui
quarkus.swagger-ui.always-include=true
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have questions or issues, please create an issue on GitHub.

---

_Built with ❤️ using Quarkus_
