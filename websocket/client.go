package websocket

import (
	"log"

	"github.com/gorilla/websocket"
)

// hub se encarga de mantener un registro de los clientes y de enviar mensajes a todos los clientes conectados.

type Client struct {
	hub      *Hub
	id       string
	socket   *websocket.Conn
	outbound chan []byte // messages to send to the client
}

func NewClient(hub *Hub, socket *websocket.Conn) *Client {
	return &Client{
		hub:      hub,
		socket:   socket,
		outbound: make(chan []byte),
	}
}

// Write writes a message to the client
// func (c *Client) Write() {
// 	for {
// 		select {
// 		case message, ok := <-c.outbound: // message from hub
// 			if !ok {
// 				// The hub closed the channel
// 				c.socket.WriteMessage(websocket.CloseMessage, []byte{})
// 				return
// 			}
// 			// escribimos el mensaje que resivimos como parametro en el socket
// 			c.socket.WriteMessage(websocket.TextMessage, message)
// 		}
// 	}
// }

func (c *Client) Write() {
	// Usamos un for range para iterar sobre los mensajes en el canal outbound
	for message := range c.outbound {
		err := c.socket.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Error writing message:", err)
			break
		}
	}
	c.socket.WriteMessage(websocket.CloseMessage, []byte{})
}
