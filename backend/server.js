const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const gameRoute = require("./routes/gameRoute");
const ws = require("ws");
const wss = new ws.Server({ port: 8080 });
const { default: ollama } = require("ollama");
const jwt = require('jsonwebtoken');

const Game = require('./models/Game');
const Message = require('./models/Message');
const Player = require('./models/Player');

const games = []; // randomId, wsUserOne, wsUserTwo or null of against bot, messages
let waitingPlayer = null;

const randomIdGenerator = () => Math.random().toString(36).substring(2, 15 + 2);

// Decode token to get user ID
const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        console.error('Token decoding failed:', error);
        return null;
    }
};

// Connexion de l'utilisateur au Websocket
wss.on("connection", (ws, req) => {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const token = params.get('token');
    const userId = decodeToken(token);

    if (!userId) {
        ws.close();
        return;
    }

    // Si un joueur est déjà en attente, créer une partie
    if (waitingPlayer) {
        // Initialiser la partie
        let gameId = randomIdGenerator();

        games[gameId] = {
            wsUserOne: {
                id: userId,
                ws: ws,
            },
            wsUserTwo: {
                id: waitingPlayer.userId,
                ws: waitingPlayer.ws,
            },
            messages: []
        };

        // Envoyer le message de début de partie aux deux joueurs
        ws.send(JSON.stringify({
            type: "start_game",
            isFirst: true,
            gameId: gameId,
			userId: userId
        }));

        waitingPlayer.ws.send(JSON.stringify({
            type: "start_game",
            isFirst: false,
            gameId: gameId,
            userId: waitingPlayer.userId
        }));

        // Enlever le joueur en attente
        waitingPlayer = null;
    } else {

        // Mettre en attente le joueur si aucun joueur n'est en attente
        waitingPlayer = {
			ws,
			id: userId
		};
        ws.send(JSON.stringify({
            type: "waiting"
        }));
    }

    // Si aucun joueur ne s'est connecté en 5 secondes, créer une partie avec un bot
    setTimeout(() => {
        // Si le joueur est encore en attente, créer une partie
        if (waitingPlayer.ws === ws) {
            // Initialisation de la partie
            let gameId = randomIdGenerator();
            games[gameId] = {
                wsUserOne: waitingPlayer,
                wsUserTwo: null,
                messages: [],
                userId: userId
            };

            // Envoyer le message de début de partie au joueur
            ws.send(JSON.stringify({
                type: "start_game",
                gameId: gameId,
                userId: userId,
                againstBot: true
            }));
            waitingPlayer = null;
        }
    }, 5000);

    // Ecoute sur les messages
    ws.on("message", async (message) => {
        // Formatage du message
        message = JSON.parse(message);

        // Vérifier si la partie existe, si non, quitter
        let game = games[message.gameId];
        if (!game) return;

        // Ajout du message dans la partie
        game.messages.push(message);

        // Vérifier si la partie est terminée
        let isGameOver = game.messages.length === 3 ? true : false;

        // Si le message provient d'un être humain
        if (message.type === "message_human") {

            // Envoyer le message aux joueurs
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
				setTimeout(async () => {

					// Générer le message avec Ollama
					let response = await ollama.chat({
						model: "deepseek-r1",
						messages: [
							...game.messages,
							{
								role: "user",
								content: message.content
							}
						]
					})

					// Formatage du message de Ollama
					let res = response.message.content;
					res = res.replace(/<think>.*?<\/think>/gs, "");

					// Vérifier si la partie est terminée
					const isGameOver = game.messages.length === 3 ? true : false;

					// Envoyer le message aux joueurs
					game.wsUserOne.ws.send(JSON.stringify({
						type: "message_bot",
						content: {
							content: res,
							gameId: message.gameId,
							type: "message_bot",
							userId: "bot",
						},
						isOver: isGameOver
					}));
				}, 100)
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        }

        // At the end of the game, save messages and the game
        if (isGameOver) {
			
			const prepareMessages = game.messages.map((msg) => {
				return {
					content: msg.content,
					bot: msg.userId === "bot" ? true : false,
					user: msg.userId ? msg.userId : null,
				}
			})

			const messagesS = await Message.insertMany(prepareMessages);

			let gameInfo = games[message.gameId];
			const gameS = await Game.create({
				gameId: message.gameId,
				players: [{
					id: gameInfo.userId,
					vote: null
				}, gameInfo.wsUserTwo ? {
					id: gameInfo.wsUserTwo.id,
					vote: null
				} : null],
				messages: messagesS,
				hadBot: gameInfo.wsUserTwo ? false : true
			})

			gameS.save();
			delete games[message.gameId];
        }
    })
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", userRoute);
app.use("/game", gameRoute);

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