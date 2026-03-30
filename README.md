# Dexen Backend

This is the backend service for Dexen, built with [NestJS](https://nestjs.com/). It provides features for user authentication, profile management, and attendance tracking with Kafka-based audit logging and real-time WebSocket notifications.


---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Kafka Broker (running on `localhost:9092` by default)

### Installation
```bash
$ npm install
```

### Run the App
The application consists of two separate processes:

1. Fill create the value on the .env file (can copy from .env.example)
2. run


### 1. migrate main DB
```bash
$ npm run prisma:migrate
```

### 2. migrate log DB
```bash
$ npm run prisma:migrate:log
```

### 3. generate prisma file for dexen DB
```bash
$ npm run prisma:generate
```

### 4. generate prisma file for dexen_log DB
```bash
$ npm run prisma:generate:log
```

### 5. Start the API Gateway & WebSockets
```bash
$ npm run start:dev
```

### 6. Start the Kafka Consumer (separate terminal)
```bash
$ npm run start:consumer:dev
```

---

## Project Structure
- `src/auth`: JWT-based authentication logic.
- `src/user`: User profiles, WebSockets gateway, and User management.
- `src/attendance`: Attendance tracking logic.
- `src/kafka`: Kafka producer setup.
- `src/kafka-consumer`: Isolated Kafka event listener.
- `src/prisma`: Database schema and service configurations.


## Tech Stack
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Messaging into logging**: Kafka (via KafkaJS)
- **Real-time update (when user data change)**: WebSockets (Socket.io)
- **File Handling**: Multer for Multipart/form-data uploads

---

## API Documentation

### Auth Module (`/auth`)
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Registers a new user. Expects `multipart/form-data` with `email`, `password`, `phone_number`, and an optional `image` file. |
| `POST` | `/auth/login` | Public | Authenticates a user and returns a JWT token. |

### User Module (`/users`)
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Protected | Returns the profile information of the current authenticated user. |
| `GET` | `/users` | Public | Returns a list of all registered users. |
| `GET` | `/users/attendances` | Protected | Fetches all attendance records for the current authenticated user. |
| `POST` | `/users/check-in` | Protected | Records a check-in for the current user for today. |
| `POST` | `/users/check-out` | Protected | Updates today's check-in record with a check-out time. |
| `PATCH` | `/users/profile` | Protected | Updates the current user's profile. Supports `phone_number`, `current_password`, `new_password`, and an `image` upload via `multipart/form-data`. |
| `PATCH` | `/users/:id/profile` | Public | Updates any user's profile by ID. Same payload as `/users/profile`. |

### Attendance Module (`/attendances`)
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendances/check-in` | Protected | Original check-in endpoint (mirrored in `/users/check-in`). |
| `POST` | `/attendances/check-out` | Protected | Original check-out endpoint (mirrored in `/users/check-out`). |
| `GET` | `/attendances` | Protected | Lists attendance records for the current user. Supports `from_date` and `to_date` (YYYY-MM-DD) query parameters. |

---

## Real-time Notifications (WebSockets)
The backend broadcasts user update events via Socket.io.
- **URL**: Same with main dexen app port (in env, 5000 by default)
- **Event Name**: `userUpdated`
- **Payload**: `{ userId: string, oldData: object, newData: object }`
- **Attendance Checking**: Attendance can only be made once a day (1 check-in, 1 checkout a day)

## Audit Logging (Kafka)
The system publishes events to Kafka topic `USER_UPDATE_LOG` whenever a profile is updated. A dedicated consumer process listens and persists these logs to an audit database (separate from main database).
