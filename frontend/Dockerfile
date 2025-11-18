FROM node:25-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# The CMD is special:
# 1. Build the app
# 2. Copy the result ('dist') to the mounted volume ('/shared')
CMD ["sh", "-c", "npm run build && cp -r dist/* /shared/"]