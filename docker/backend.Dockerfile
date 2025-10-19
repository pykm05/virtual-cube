# Lightweight version of node
FROM node:22-alpine

# Create app directory in docker image
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Start backend
CMD ["npm", "run", "dev"]