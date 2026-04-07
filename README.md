# Todo List Application

A full-stack todo list application consisting of a React frontend and a Quarkus Java backend API.

## Project Structure

This project is organized into two main parts:

- **client/**: React-based frontend application for managing todos
- **server/**: Quarkus-based backend API with PostgreSQL database

## Client (React Frontend)

A simple and minimal To-Do List web application built with **ReactJS**. This app allows users to manage their daily tasks by adding, completing, and removing to-dos. Data is stored in the browser using `localStorage`, so tasks remain even after refreshing the page.

### Features

- Add new tasks
- Mark tasks as completed
- Delete tasks
- Persist data using `localStorage`
- Edit tasks
- Filter by status (Completed / Active)
- Search functionality
- Theme selector

### Technologies Used

- React 18
- Vite (build tool)
- Ant Design (UI library)
- Styled Components
- FontAwesome icons
- Lodash-es
- UUID for unique IDs
- Local Storage for data persistence

### Getting Started (Client)

1. **Prerequisites**

   - Node.js (v16 or later)
   - npm or yarn

2. **Installation**

   ```bash
   cd client
   npm install
   # or
   yarn install
   ```

3. **Running the Application**

   ```bash
   yarn dev
   ```

   The app will run on `http://localhost:5173`

4. **Building for Production**

   ```bash
   yarn build
   ```

5. **Preview Production Build**

   ```bash
   yarn preview
   ```

6. **Testing**
   ```bash
   yarn test
   ```

### Live Demo

Live Demo: comming soon!

## Server (Quarkus Backend)

A personal task management application built with the Quarkus framework in Java. The application provides CRUD (Create, Read, Update, Delete) functionality for todos with JWT user authentication.

### Features

- User registration and login with JWT authentication
- Todo management (Create, Read, Update, Delete)
- Filtering and search by status, priority, due date
- Pagination support
- API documentation with Swagger UI
- Role-based authorization

### Technologies Used

- **Framework**: Quarkus (Java)
- **Database**: PostgreSQL
- **ORM**: Hibernate Panache
- **Security**: JWT (SmallRye JWT)
- **API**: RESTful with JAX-RS
- **Build Tool**: Gradle
- **Testing**: JUnit + Mockito
- **Validation**: Hibernate Validator
- **Documentation**: SmallRye OpenAPI

### API Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Todos (Requires JWT token)

- `GET /todos` - Get all todos (with pagination and filtering)
- `POST /todos` - Create a new todo
- `GET /todos/{id}` - Get a specific todo
- `PUT /todos/{id}` - Update a todo
- `DELETE /todos/{id}` - Delete a todo

### Getting Started (Server)

1. **Prerequisites**

   - Java 17 or higher
   - PostgreSQL 12+
   - Gradle 7+

2. **Database Setup**

   ```sql
   CREATE DATABASE todo;
   CREATE USER postgres WITH PASSWORD '123456';
   GRANT ALL PRIVILEGES ON DATABASE todo TO postgres;
   ```

3. **Environment Configuration**

   Create `application.properties` in `src/main/resources/`:

   ```properties
   quarkus.datasource.db-kind=postgresql
   quarkus.datasource.username=postgres
   quarkus.datasource.password=123456
   quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/todo

   quarkus.hibernate-orm.database.generation=update

   # JWT Configuration
   mp.jwt.verify.publickey.location=META-INF/resources/publicKey.pem
   mp.jwt.verify.issuer=https://quarkus.io/issuer
   smallrye.jwt.sign.key.location=META-INF/resources/privateKey.pem
   ```

4. **Running the Application**

   ```bash
   cd server/todo-list
   ./gradlew quarkusDev
   ```

   The API will be available at `http://localhost:8080`

5. **API Documentation**

   Swagger UI: `http://localhost:8080/q/swagger-ui/`

6. **Testing**

   ```bash
   ./gradlew test
   ```

7. **Building for Production**
   ```bash
   ./gradlew build
   ```

## Running Both Client and Server

1. Start the server first:

   ```bash
   cd server/todo-list
   ./gradlew quarkusDev
   ```

2. In a new terminal, start the client:
   ```bash
   cd client
   npm start
   ```

Note: The current client implementation uses localStorage and does not connect to the server API. To integrate the client with the server, you would need to modify the client to make API calls to the backend instead of using localStorage.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
