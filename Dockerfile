# Use an official Node.js runtime as the base image
FROM node:18.20.2-bullseye-slim


# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run generate

# DB file is provided with docker run
# RUN npm run migrate


# Expose the port your application listens on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
