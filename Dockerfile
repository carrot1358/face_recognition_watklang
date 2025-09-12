FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY .env.example ./.env

EXPOSE 8080
CMD ["npm", "start"]
