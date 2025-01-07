package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	//checkorigin es una función opcional que se llama para verificar la solicitud de origen.
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
	clients    []*Client
	register   chan *Client
	unregister chan *Client
	mutex      *sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make([]*Client, 0),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		mutex:      &sync.Mutex{},
	}
}

// ruta de manejo para los diferentes eventos de websocket
func (hub *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		http.Error(w, "could not open websocket connection", http.StatusBadRequest)
		return
	}
	client := NewClient(hub, socket)
	//register es un canal que se utiliza para registrar un nuevo cliente en el hub.
	hub.register <- client
	go client.Write()

}

func (hub *Hub) Run() {
	for {
		select {
		case client := <-hub.register:
			hub.onConnect(client)
		case client := <-hub.unregister:
			hub.onDisconnect(client)
		}
	}
}

func (hub *Hub) onConnect(client *Client) {
	// client.socket.RemoteAddr() devuelve la dirección remota de la conexión del cliente.
	log.Println("Client Connected", client.socket.RemoteAddr())
	hub.mutex.Lock()
	defer hub.mutex.Unlock()

	client.id = client.socket.RemoteAddr().String()
	hub.clients = append(hub.clients, client)
}

func (hub *Hub) onDisconnect(client *Client) {
	log.Println("Client Disconnected", client.socket.RemoteAddr())
	client.socket.Close()
	hub.mutex.Lock()
	defer hub.mutex.Unlock()

	i := -1
	for index, c := range hub.clients {
		if c.id == client.id {
			i = index
		}
	}
	// i = 3 , [i:] == [3,4,5], [i+1:] == [4,5]
	// copy -> [1,2,4,5,5]
	copy(hub.clients[i:], hub.clients[i+1:]) // se sobreescribe el valor en la posición i con el valor en la posición i+1
	// [1,2,4,5,5]
	hub.clients[len(hub.clients)-1] = nil
	// [1,2,4,5,nil]
	hub.clients = hub.clients[:len(hub.clients)-1]
	// [1,2,4,5]

	close(client.outbound)
}

// ignore es utiliza evitar que el cliente que envió el mensaje lo reciba.
func (hub *Hub) Broadcast(message interface{}, ignore *Client) {
	// serializamos el mensaje a json
	data, _ := json.Marshal(message)
	for _, client := range hub.clients {
		if client != ignore {
			client.outbound <- data
		}
	}
}
