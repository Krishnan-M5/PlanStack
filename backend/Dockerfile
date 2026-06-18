FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
