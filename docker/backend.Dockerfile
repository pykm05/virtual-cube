# Lightweight version of node
FROM node:22-alpine

# Create app directory in docker image
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all files
COPY . .

EXPOSE 4000

# Start frontend
CMD ["npm", "run", "backend"]