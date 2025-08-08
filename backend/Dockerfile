FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port that the server listens on
EXPOSE 5000

# Command to run the app
CMD ["npm", "start"]