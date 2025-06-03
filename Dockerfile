FROM node:18-alpine
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build React frontend
RUN npm run build

# Expose ports: 3000 for web, 514 for TCP and UDP syslog
EXPOSE 3000 514
EXPOSE 514/udp

CMD ["node", "backend/index.js"]
