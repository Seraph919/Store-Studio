FROM node:lts-slim

RUN addgroup --gid 10001 appgroup && \
    adduser --uid 10001 --gid 10001 --disabled-password --gecos "" appuser


WORKDIR /app

RUN chown appuser:appgroup /app

USER appuser

COPY --chown=appuser:appgroup package*.json ./

RUN npm install

COPY --chown=appuser:appgroup . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]