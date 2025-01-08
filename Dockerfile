ARG GO_VERSION=1.23.4
# alpine son distribuciones muy peque;as para hacer costrucciones de aplicaciones.
FROM golang:${GO_VERSION}-alpine AS builder

RUN go env -w GOPROXY=direct
RUN apk add --no-cache git 
# certificados de seguridad para correr el servidor
RUN apk --no-cache add ca-certificates && update-ca-certificates



WORKDIR /src

COPY ./go.mod ./go.sum ./
RUN go mod download

# copio todos mis directorios dentro del contenedor
COPY ./ ./

RUN CGO_ENABLED=0 go build \
    -installsuffix 'static' \
    -o /store-rest-ws 

# scratch encargada de ejecutar la aplicacion.
FROM scratch AS runner

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY .env ./

COPY --from=builder /store-rest-ws /store-rest-ws

EXPOSE 5050
ENTRYPOINT [ "/store-rest-ws" ]


