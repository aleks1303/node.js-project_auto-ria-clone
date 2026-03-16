FROM node:20-alpine

LABEL maintainer="Olexandr Bulda"

WORKDIR /app

# Встановлення залежностей (використовуємо кеш Docker)
COPY ./backend/package*.json ./

RUN npm install

# Копіювання вихідного коду проекту
COPY ./backend .

# Порт, який слухає додаток всередині контейнера
EXPOSE 7000

CMD ["npm", "start"]