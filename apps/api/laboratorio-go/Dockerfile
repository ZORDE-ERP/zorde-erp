# Stage 1: Build
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy dependency files first for layer caching
COPY go.mod ./
# go.sum is optional when there are no external dependencies
COPY go.sum* ./

RUN go mod download

# Copy source code
COPY . .

# Build a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o server ./cmd/server

# Stage 2: Run
FROM alpine:3.21

# ca-certificates: needed for HTTPS calls; tzdata: timezone support
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
