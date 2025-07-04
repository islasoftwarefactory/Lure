# Lure E-commerce Platform

Lure is a modern e-commerce platform designed to provide a seamless and secure online shopping experience. This project is built with a decoupled architecture, featuring a robust Flask backend and a dynamic React frontend.

## ✨ Features

- **Authentication**: Secure user authentication using JWT, with support for anonymous guest users and Google OAuth.
- **Shopping Cart**: Persistent shopping cart that syncs between the client and server.
- **Product Management**: Support for product categories, sizes, and favorites.
- **Payments**: Integration with Stripe for secure payment processing.
- **User Dashboard**: Users can view their order history, manage addresses, and update their profile.
- **DDOS Protection**: Built-in rate limiting and trust scoring to protect against malicious attacks.

## 🚀 Technology Stack

### Backend
- **Framework**: Flask
- **ORM**: SQLAlchemy
- **Database**: MySQL
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker, Gunicorn

### Frontend
- **Framework**: React (with Next.js)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context API

### Infrastructure
- **Web Server**: Nginx
- **Containerization**: Docker Compose

## 🏗️ Project Structure

The project is organized into two main parts:

- **`api/`**: The Flask backend application. It handles all business logic, database interactions, and API endpoints. Each module is structured with `model.py` for database models and `routes.py` for API routes.
- **`app/`**: The React frontend application. It contains all the UI components, pages, and client-side logic for interacting with the backend API.

## 🏃‍♀️ Getting Started

This project is fully containerized using Docker, making it easy to set up and run the development environment.

### Prerequisites
- Docker
- Docker Compose

### Running the application
To start the application, run the following command from the root of the project:

```bash
docker-compose -f compose.yml up --build
```

This will build the Docker images for the backend, frontend, and database, and start all the services.

- The frontend will be available at `http://localhost:3000`
- The backend API will be available at `http://localhost:5000`

## 🏛️ Architectural Principles

- **Separation of Concerns**: The backend and frontend are completely separate applications, communicating only through a RESTful JSON API. This allows for independent development and scaling.
- **Modularity**: The backend is organized into blueprints, with each feature having its own set of models and routes.
- **Security First**: Protected routes are enforced using JWT decorators. The system includes DDOS protection and follows security best practices.
- **Consistency**: The project follows strict coding patterns, error handling structures, and API endpoint conventions to maintain a consistent and predictable codebase.

## 📄 License

This project is proprietary. All rights reserved.