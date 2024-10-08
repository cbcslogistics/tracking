# Use the official Node.js image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the app's source code
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]
