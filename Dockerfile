# Use the official Node.js 24 image with Alpine Linux.
# Alpine is a small Linux distribution, so the Docker image is lightweight.
FROM node:24-alpine


# Set /app as the working directory inside the container.
# All following commands will run from this directory.
WORKDIR /app


# Copy package.json and package-lock.json into the container.
# The * means it can copy package.json and package-lock.json if they exist.
COPY package*.json ./


# Install all dependencies listed in package.json.
# This creates the node_modules folder inside the container.
RUN npm install


# Copy the rest of your application files into the /app directory.
# This includes index.js and other source files.
COPY . .


# Inform Docker that the application will listen on port 3000.
# IMPORTANT: EXPOSE does not actually publish the port to your computer.
EXPOSE 3000


# Command that runs when the container starts.
# It starts your Node.js application using index.js.
CMD ["node", "index.js"]