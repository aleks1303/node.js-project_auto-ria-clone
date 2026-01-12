#FROM node:20-alpine
#
#MAINTAINER Some Dev
#
#RUN mkdir /app
#WORKDIR /app
#
#COPY ./backend/package.json .
#
#RUN npm i



#FROM node:20-alpine
#
## Створюємо папку додатка
#WORKDIR /app
#
## Копіюємо package.json та lock файл
#COPY ./backend/package*.json ./
#
## Встановлюємо залежності
#RUN npm install
#
## Копіюємо весь інший код з папки backend у контейнер
#COPY ./backend .
#
## Експонуємо порт (як у твоєму .env)
#EXPOSE 7000
#
## Команда для запуску
#CMD ["npm", "run", "watch:server"]


# для docker --build
FROM node:20-alpine

# LABEL замість MAINTAINER (як просив термінал у WARN)
LABEL maintainer="Some Dev"

WORKDIR /app

# 1. Копіюємо тільки файли залежностей
COPY ./backend/package*.json ./

# 2. Встановлюємо їх
RUN npm install

# 3. КОПІЮЄМО ВЕСЬ КОД (це те, чого не вистачало)
COPY ./backend .

# 4. Команда запуску
CMD ["npm", "start"]