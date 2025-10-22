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

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

EXPOSE 3000

RUN npm run build

# Start frontend
CMD ["npm", "run", "frontend"]