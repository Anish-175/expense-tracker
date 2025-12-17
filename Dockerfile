
ARG NODE_VERSION=24.11.1

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.

WORKDIR /usr/src/app

# Copy package.json
COPY package*.json ./

# Fix permissions
RUN chown -R node:node /usr/src/app

# Run the application as a non-root user.
USER node


# install dependencies.
RUN npm install

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "run", "start:dev"]
