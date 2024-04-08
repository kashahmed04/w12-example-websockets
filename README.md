# w12-example-websockets

This repo has two projects inside it:

`/client` which is a web application that runs on the client side. Each "player" is a client.

`/server` which is a node application that runs on the server side. There is only one "server", which all clients connect to.

## To run this project:

Open the terminal within the `/server` folder and run `npm i && npm start`.

Then, open the terminal with in the `/client` folder and run `npm i && npm host` - and open the browser to `localhost:5173` one or many times. (To have other users on the same network connect, they can use the ip-address-based URL shown in the terminal).
