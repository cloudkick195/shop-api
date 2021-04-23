FROM node:12.13.0

WORKDIR /app

COPY . .
ADD start.sh /start.sh
RUN chmod 755 /start.sh

EXPOSE 3500
CMD ["sh", "/start.sh"]