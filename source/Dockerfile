FROM node:12.13.0

WORKDIR /app

COPY package.json /app/package.json

RUN npm install --quite
RUN npm install -g typescript
RUN npm install --save-dev ts-node
RUN npm install nodemon

COPY . /app

CMD ["npm","start"]
EXPOSE 3500