# Use the official Node.js 24.16.0 image with Alpine Linux
# Alpine is a small Linux distribution, which helps keep the Docker image lightweight
FROM node:24.16.0-alpine

# Set /app as the working directory inside the Docker container
# All following commands will run from this directory
WORKDIR /app

# Copy package.json and package-lock.json from your local project
# The * allows both package.json and package-lock.json to be copied
COPY package*.json ./

# Install all dependencies listed in package.json
# node_modules will be created inside the Docker container
RUN npm install

# Copy the rest of your application files into /app
# This includes your source code, configuration files, etc.
# Files listed in .dockerignore will NOT be copied
COPY . .

# Inform Docker that the application listens on port 5173
# This does not actually publish the port to your host machine
EXPOSE 5173

# Start the application using the "dev" script from package.json
# Equivalent to running: npm run dev
CMD ["npm", "run", "dev"]