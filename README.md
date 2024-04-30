# Secret DB - Encrypted Database for Images and APIs

This API enables you to securely upload and download encrypted images. Images are encrypted using the AES-256 encryption algorithm with a secret key.

Utilizing SQLite as the database backend makes this application highly portable. You can effortlessly copy the dev.db file to a flash disk and utilize this application as a client to manage your data across various machines.

It's worth noting that while saving images in a database is not generally recommended due to performance and scalability concerns, this project was created as an experimental solution for the purpose of saving and encrypting images.

## ⚠️ Disclaimer

Please note that this project was developed within 3 hours. As a result, certain design decisions, such as choosing JavaScript over TypeScript or old Prisma version, were made to speed up development. It might require some additional steps for production usage. 

## Prerequisites

- Node.js 18.20.1+ installed on your machine

## Installation

1. Clone this repository:

```bash
git clone https://github.com/Websitescity/Secret-DB.git
cd Secret-DB
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory of the project and add your secret key:

```
SECRET_KEY=your_secret_key_here
DATABASE_URL=file:./db/dev.db
PORT=3000
```

Replace `your_secret_key_here` with your secret key for encryption and decryption.

4. Generate Prisma Client:

```bash
npm run generate
```

This command generates the Prisma Client based on your schema.

5. Run database migrations:

```bash
npm run migrate
```

This command runs the migrations to create the necessary database tables.

## Usage

Start the server:

```bash
npm start
```

The server will run on http://localhost:3000 by default, unless you specify a different port in the `.env` file.

### Running with Docker

If you prefer to build and run the application with Docker, you can use the following commands:

1. Build the Docker image:

```bash
docker build -t secret-db .
```

2. Run the Docker container:

Powershell
```bash
docker run -p 3000:3000 -v ${PWD}/db/:/usr/src/app/db -d secret-db
```

CMD
```bash
docker run -p 3000:3000 -v %cd%/db/:/usr/src/app/db -d secret-db
```

Linux
```bash
docker run -p 3000:3000 -v ${pwd}/db/:/usr/src/app/db -d secret-db
```



This command starts a Docker container with your application, maps port 3000 on your host to port 3000 in the container, and mounts the `db` directory from your current directory into the container's `/usr/src/app/db` directory. The project contains an empty SQLite database file (db/dev.db) with tables ready to use. This file will be automatically populated with data when you run the database migrations.



## API Endpoints

### Upload Image

- **POST /upload**

  Uploads an encrypted image.

  Request Body:

  - `image`: The image file to upload (multipart/form-data)
  - `secretKey` (optional): Secret key for encryption. If not provided, the default secret key from the environment variable will be used.

  Response:

  - Status Code: 200
  - Body: JSON object containing the ID of the uploaded image and a success message.

### Download Image

- **GET /download/:id**

  Downloads an image by ID.

  Parameters:

  - `id`: ID of the image to download

  Query Parameters:

  - `secretKey` (optional): Secret key for decryption. If not provided, the default secret key from the environment variable will be used.

  Response:

  - Status Code: 200
  - Body: Binary image data

### API Documentation

- **GET /**

  View the API documentation using Swagger UI.

## Author

Michal Rafalski










