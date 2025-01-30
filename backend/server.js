const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const ws = require("ws");
const wss = new ws.Server({ port: 8080 });
const { default: ollama } = require("ollama");

const games = []; // randomId, wsUserOne, wsUserTwo or null of against bot, messages
const users = []; // randomId, inQueue

let waitingPlayer = null;

wss.on("connection", (ws) => {
    console.log("Client connected");

    if (waitingPlayer) {
        // Connect two players
		let gameId = Math.random().toString(36).substring(2, 15 + 2);
		let firstUserId = Math.random().toString(36).substring(2, 15 + 2);
		let secondUserId = Math.random().toString(36).substring(2, 15 + 2);
		games[gameId] = {
			wsUserOne: {
				id: firstUserId,
				ws: ws
			},
			wsUserTwo: {
				id: secondUserId,
				ws: waitingPlayer
			},
			messages: []
		};
        ws.send(JSON.stringify({
			type: "start_game",
			isFirst: true,
			gameId: gameId,
			userId: firstUserId
		}));
		waitingPlayer.send(JSON.stringify({
			type: "start_game",
			isFirst: false,
			gameId: gameId,
			userId: secondUserId
		}));
        waitingPlayer = null;
    } else {
        waitingPlayer = ws;
        ws.send(JSON.stringify({
			type: "waiting"
		}));
    }

    setTimeout(() => {
        if (waitingPlayer === ws) {
			let gameId = Math.random().toString(36).substring(2, 15 + 2);
			let userId = Math.random().toString(36).substring(2, 15 + 2);
			games[gameId] = {
				wsUserOne: ws,
				wsUserTwo: null,
				messages: [],
				userId: userId
			};
			ws.send(JSON.stringify({
				type: "start_game",
				gameId: gameId,
				userId: userId,
				againstBot: true
			}));
			waitingPlayer = null;
        }
    }, 5000);

	ws.on("message", (message) => {
		// buffer decode the message
		message = JSON.parse(message);
		console.log("Received message:", message);
		if (message.type === "message_human") {
			let game = games[message.gameId];
			if(!game) return;
			game.messages.push(message);
			let isGameOver = game.messages.length === 2 ? true : false;
			game.wsUserOne.ws.send(JSON.stringify({
				type: "message_human",
				content: message,
				userId: game.userId,
				isOver: isGameOver
			}));
			game.wsUserTwo.ws.send(JSON.stringify({
				type: "message_human",
				content: message,
				userId: game.userId,
				isOver: isGameOver
			}));
		} else if (message.type === "message_bot") {
			try {
				let parsedMessage = message;
				let game = games[parsedMessage.gameId];
				let oldGameMessages = game.messages;
				game.messages.push(parsedMessage);
				setTimeout(async() => {
					let res = await ollama.chat({
						model: "deepseek-r1",
						messages: [
							...oldGameMessages,
							{
								role: "user",
								content: parsedMessage.content
							}
						]
					})

					let response = res.message.content
					response = response.replace(/<think>.*?<\/think>/gs, "");
					const isGameOver = game.messages.length === 4 ? true : false;
					game.wsUserOne.send(JSON.stringify({
						type: "message_bot",
						content: response,
						isOver: isGameOver
					}));

				}, 5000);
			} catch (error) {
				console.error("Error parsing message:", error);
			}
		}
	})
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", userRoute);

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connecté"))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Serveur lance sur le port " + PORT);
});