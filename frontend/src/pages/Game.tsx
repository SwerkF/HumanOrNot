import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { voteGame } from "@/redux/slices/gameSlices";
import { Message } from "@/models/Message";

import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import { RootState } from "@/redux/store";
import { User } from "@/models/User";

export default function Game() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const [ws, setWs] = useState<WebSocket | null>();

  // Gestion partie
  const [gameState, setGameState] = useState("");
  const [gameId, setGameId] = useState("");
  const [userGameId, setUserGameId] = useState("");
  const [userTurn, setUserTurn] = useState(false);
  const [againstBot, setAgainstBot] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const navigate = useNavigate();

  // Ecouter pour savoir si l'utilisateur veut quitter la page
  useEffect(() => {
    if (gameId) {
      window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
        ws?.close();
        return false;
      });
    }
  }, [gameId]);

  // Connexion WebSocket
  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(
      `${import.meta.env.VITE_WEBSCOKET_BASE_URL}?token=${(user as User).token}`
    );
    ws.onopen = () => {
      setGameState("waiting");
    };
    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      // Début de partie
      if (data.type === "start_game") {
        // Mettre à jour les states
        setGameId(data.gameId);
        setUserGameId(data.userId);
        setMessages([]);

        if (data.isFirst) setUserTurn(true);
        if (data.againstBot) {
          setUserTurn(true);
          setAgainstBot(true);
        }

        setGameState("in_progress");
      } else if (data.type === "message_human" || data.type === "message_bot") {
        setMessages((prev) => [
          ...prev,
          {
            content: data.content.content,
            userId: data.content.userId,
          },
        ]);

        if (data.isOver === true) {
          setUserTurn(false);
          setGameState("game_over");
          setTimeout(() => {
            setGameState("game_vote");
          }, 5000);
        } else {
          againstBot ? setUserTurn(true) : setUserTurn((prevTurn) => !prevTurn);
        }
      }
    };
    setWs(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (againstBot) {
      ws?.send(
        JSON.stringify({
          type: "message_bot",
          content: message,
          gameId: gameId,
          userId: userGameId,
        })
      );
      setMessage("");
      setMessages((prev) => [
        ...prev,
        {
          content: message,
          userId: userGameId,
        },
      ]);
      setUserTurn((prevTurn) => !prevTurn);
    } else {
      ws?.send(
        JSON.stringify({
          type: "message_human",
          content: message,
          gameId: gameId,
          userId: userGameId,
        })
      );
    }
    setMessage("");
  };

  const handleVote = (isHuman: boolean) => {
    dispatch(voteGame({ gameId, vote: isHuman }));
    setGameState("game_end");
  };

  return (
    <div className="min-h-screen grid grid-cols-12">
      <div className="col-span-3"></div>
      <div className="col-span-6 relative flex flex-col min-h-full max-h-full border-x border-zinc-600 overflow-y-auto">
        <div className="h-[50px] border-b border-zinc-600 flex flex-row items-center">
          <h1 className="text-3xl font-bold text-white ml-2">Chat</h1>
        </div>
        {userTurn && (
          <div className="w-full p-2 bg-zinc-800 text-white">
            C'est à vous !
          </div>
        )}

        {gameState === "waiting" ? (
          <Loader />
        ) : gameState === "in_progress" || gameState === "game_over" ? (
          <Fragment>
            {messages.map((message, index) => (
              <div className="grid grid-cols-2" key={index}>
                {message.userId === userGameId && (
                  <Fragment>
                    <div className="col-span-1"></div>
                    <div className="col-span-1 bg-primary min-h-[100px]">
                      <div className="flex flex-col items-end w-full justify-start px-3">
                        <p className="font-bold">Vous.</p>
                        <p className="font-semibold text-sm">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </Fragment>
                )}

                {message.userId !== userGameId && (
                  <Fragment>
                    <div className="col-span-1 bg-secondary min-h-[100px]">
                      <div className="flex flex-col items-start px-3">
                        <p className="text-white font-bold">Inconnu.</p>
                        <p className="text-white font-semibold text-sm">
                          {message.content}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-1"></div>
                  </Fragment>
                )}
              </div>
            ))}

            {!userTurn &&
              gameState === "in_progress" && [
                <div className="w-full p-2 text-zinc-700 min-h-[100px] flex flex-row items-center">
                  En attente de l'utilisateur ...
                </div>,
              ]}

            {gameState === "game_over" && (
              <div className="w-full p-2 text-zinc-700 min-h-[100px] flex flex-row items-center">
                Fin de partie.
              </div>
            )}
          </Fragment>
        ) : gameState === "game_vote" ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full w-full bg-black bg-opacity-80 rounded-lg p-4">
            <div className="h-[80%] w-full bg-zinc-900 p-4 flex flex-col items-center justify-center">
              <p className="text-white text-3xl font-bold text-center">Vote</p>
              <p className="text-white text-center text-lg">
                Vous avez joué contre:
              </p>
              <div className="flex flex-col justify-center items-center">
                <Button
                  label="UN HUMAIN"
                  className="mt-4 w-full font-semibold"
                  onClick={() => handleVote(true)}
                />
                <Button
                  label="UN BOT"
                  className="mt-4 bg-secondary w-full text-white font-semibold"
                  onClick={() => handleVote(false)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 text-zinc-700 h-full w-full flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Merci d'avoir joué !
            </h1>
            <p className="text-white text-center">
              Vous avez joué contre {againstBot ? "un bot" : "un humain"} !
            </p>
            <button
              className="w-1/4 p-2 bg-primary hover:bg-secondary hover:text-white focus:border-primary focus:outline-none transition-all"
              onClick={() => navigate("/")}
            >
              Retour au menu
            </button>
          </div>
        )}

        <div className="fixed bottom-0 w-1/2">
          <form
            className={`flex flex-row border-t ${
              userTurn ? "border-secondary" : " border-zinc-600"
            }`}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              className="w-full p-2 bg-black border border-zicn-800 text-white rounded outline-none border-transparent"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!userTurn}
            />
            <button
              className="w-1/4 p-2 bg-primary hover:bg-secondary hover:text-white focus:border-primary focus:outline-none transition-all"
              type="submit"
              disabled={!userTurn}
            >
              Send
            </button>
          </form>
        </div>
      </div>
      <div className="relative col-span-3 min-h-screen">
        <div
          className={`absolute w-full bottom-0 bg-secondary transition-all]`}
        ></div>
      </div>
    </div>
  );
}
