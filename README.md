## Running the Application with Docker Compose

Follow these steps to build and run the application using Docker Compose.

### Clone the Repository

First, clone the repository to your local machine:

```bash
git clone git@github.com:Service-Sphere-GP/backend.git
cd backend
```

### Set Up Environment Variables

Ensure that the `.env.test.local` file is present in the project root and correctly configured.

### Build and Run the Application

Use Docker Compose to build and run the application:

```bash
docker-compose up --build
```

This command will:

- Build the Docker images for the application and MongoDB.
- Start the services defined in `docker-compose.yml`.
- Set up the necessary environment variables inside the containers.

### Access the Application

Once the containers are up and running, you can access the application at:

- **URL**: `http://localhost:3000`

---

## Stopping the Application

To stop the application and remove the containers, run:

```bash
docker-compose down
```

This will stop and remove the containers, networks, and volumes defined in `docker-compose.yml`.

---

## Running the Application in Development Mode (Without Docker)

If you prefer to run the application without Docker for development purposes, follow these steps:

### Install Dependencies

Ensure you have **Yarn** installed, then install the project dependencies:

```bash
yarn install
```

### Run MongoDB Locally

Start a local instance of MongoDB or adjust the `MONGODB_URI` in `.env.development.local` to point to an accessible MongoDB instance.

### Start the Application

Run the application in watch mode:

```bash
yarn start:dev
```

The application will start on `http://localhost:3000`.
