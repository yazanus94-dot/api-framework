FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src/ ./src/
COPY tests/ ./tests/

RUN npm run build

USER node
EXPOSE 3000
ENTRYPOINT ["node", "dist/index.js"]