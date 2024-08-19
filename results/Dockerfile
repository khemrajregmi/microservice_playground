FROM golang:1.20.3-alpine3.17 AS build

RUN apk add --no-cache git
RUN apk add build-base

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY ./src .
RUN go build -o app .

FROM alpine:3.17.3

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=build /app/app .

CMD ["./app"]
