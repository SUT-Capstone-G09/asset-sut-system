FROM golang:1.25-alpine AS builder

WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/serve
RUN CGO_ENABLED=0 GOOS=linux go build -o init-db ./cmd/init-db

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/init-db .
COPY --from=builder /app/cmd/init-db/seed_data ./cmd/init-db/seed_data

EXPOSE 8081

CMD ["./server"]