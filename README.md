# 📚 Studyland

**Studyland** is a full-stack, real-time social study platform designed to help users track their study hours, analyze their performance, and study alongside friends in virtual rooms.

Built with a focus on **Clean Architecture** utilizing **Vertical Slices** and **Domain-Driven Design (DDD)** principles, it leverages the power of **.NET 9** for a robust backend and **React 19** for a high-performance, responsive frontend.

-----

## 🏗️ Architecture: Clean Architecture & Vertical Slices

The solution follows a strict **Clean Architecture** approach, further organized by **Vertical Slices** within the Application layer. This ensures that all logic related to a specific feature (e.g., "Sessions")—from API endpoints to database queries—is cohesive and easy to maintain.

### Backend Layers

  * **`Domain`**: The core of the application. Contains enterprise logic and entities (`User`, `Session`, `Topic`) with zero external dependencies.
  * **`Application`**: Implements business logic using **CQRS** (Command Query Responsibility Segregation) via **MediatR**.
      * **Vertical Slices**: Features are organized by domain area (e.g., `Application/Sessions/Commands/CreateSession.cs`), keeping related logic together.
      * **Behaviors**: Cross-cutting concerns like Validation are handled via MediatR Pipeline Behaviors.
  * **`Persistence`**: Implements database access using **Entity Framework Core** with SQL Server.
  * **`API`**: The entry point, containing minimal controllers that delegate execution immediately to MediatR.

-----

## 🧠 Deep Dive: The Real-Time Presence System

One of the most complex parts of Studyland is managing the real-time state of users (Online, Studying, On Break) without overloading the database. This is achieved through a sophisticated **in-memory state machine**.

### 1\. The `PressenceService` (Singleton)

This service acts as the source of truth for all active WebSocket connections.

  * **Connection Mapping**: It maintains concurrent dictionaries to map `ConnectionId` ↔ `UserId` ↔ `ChannelId`.
  * **Zombie Management**: It handles "zombie connections" (orphaned sockets) to ensure users aren't stuck showing as "Online" if their browser crashes.

### 2\. `ChannelPressence` (State Machine)

Each chat room/guild is represented by a `ChannelPressence` object.

  * **In-Memory Caching**: When a user joins, their profile is fetched from the DB once and cached in memory. Subsequent status updates (starting a timer, taking a break) mutate this in-memory state, ensuring strictly **O(1)** performance for real-time updates.
  * **Timer Logic**: It manages the logic for Pomodoro timers. When a user starts studying, it records the `StartedAt` timestamp. The `CheckForExpiredTimers` method periodically checks these timestamps to automatically transition users from "Studying" to "On Break" when their timer runs out.

### 3\. `ChatHub` Integration

The SignalR Hub (`ChatHub.cs`) is a thin layer that delegates logic to the `PressenceService`. This separation allows the complex presence logic to be decoupled from the transport layer (WebSockets).

-----

## 💻 Code Highlights

### Custom FluentValidation Extensions

To keep validation logic readable and expressive, custom extension methods were built for **FluentValidation**.

  * **`.Required()`**: A shorthand that combines `.NotEmpty()` with a standardized error message format.
  * **`.MustExistInDb<T>`**: A powerful generic extension that validates foreign keys. It takes a generic `DbSet<T>` and automatically performs an asynchronous `AnyAsync` check against the database.

**Example Usage:**

```csharp
// Inside CreateSession.Validator
RuleFor(x => x.UserId)
    .Required()
    .MustExistInDb(context.Users); // Automatically checks DB and returns 404-style error if missing
```

-----

## 🚀 Tech Stack

### Backend

  * **Framework**: .NET 9 (ASP.NET Core Web API)
  * **Language**: C\#
  * **Database**: Microsoft SQL Server
  * **ORM**: Entity Framework Core
  * **Real-time**: SignalR (WebSockets)
  * **Architecture**: Clean Architecture, Vertical Slices, CQRS (MediatR)
  * **Validation**: FluentValidation
  * **Documentation**: OpenAPI (Swagger)

### Frontend

  * **Library**: React 19
  * **Build Tool**: Vite
  * **State Management**: TanStack Query (React Query)
  * **Styling**: Tailwind CSS, Shadcn UI
  * **Routing**: React Router v7

-----

## ⚠️ Limitations & Testing Philosophy

**Current Status: Manual Testing Only**

While the architecture (Clean Architecture + CQRS) is specifically designed to support rigorous Unit and Integration testing (by decoupling logic from infrastructure), **no automated tests are currently implemented** in this repository.

  * **Context**: As a solo developer optimizing for speed and feature delivery, I adopted a pragmatic approach, relying on manual testing to verify features.
  * **My Stance**: I deeply believe in the value of TDD and automated testing for long-term project health. In my commercial SaaS product (**Rufus USMLE**), I employed extensive unit testing (Jest) to ensure the reliability of critical exam engines.
  * **Future Work**: In a professional team setting, adding a test project to cover the MediatR handlers and Domain logic would be my first priority.

-----

## 🛠️ Setup & Installation

### Method 1: Docker Compose (Recommended)

Run the entire stack (Database + Backend + Frontend) with one command.

```bash
# Run via Docker Compose
docker-compose up --build
```

### Method 2: Manual Local Development

**1. Database**

```bash
docker-compose up -d db
```

**2. Backend**
Navigate to `backend/API` and run. The app will automatically apply migrations and seed data on startup.

```bash
cd backend/API
dotnet watch run
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

-----

## 📜 License

This project is open-source.
