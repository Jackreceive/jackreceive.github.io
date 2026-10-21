FROM node:24-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web ./web
COPY data ./data
RUN npm run build

FROM golang:1.27-alpine AS backend
WORKDIR /app
COPY go.mod ./
COPY cmd ./cmd
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.23
WORKDIR /app
RUN addgroup -S website && adduser -S website -G website
COPY --from=backend /server ./server
COPY --from=frontend /app/web/dist ./web/dist
COPY data ./data
USER website
ENV ADDR=0.0.0.0:8080
EXPOSE 8080
CMD ["./server"]
