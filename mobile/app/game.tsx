import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { voteGame } from "@/redux/slices/gameSlices";
import { Message } from "@/models/Message";
import { RootState } from "@/redux/store";
import { User } from "@/models/User";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import Button from "@/components/ui/Button/Button";
import { VITE_WEBSCOKET_BASE_URL } from "@env";

export default function Game() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView | null>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState("");
  const [gameId, setGameId] = useState("");
  const [userGameId, setUserGameId] = useState("");
  const [userTurn, setUserTurn] = useState(false);
  const [againstBot, setAgainstBot] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setGameId("");
      setUserGameId("");
      setMessages([]);
      setUserTurn(false);
      setAgainstBot(false);

      const newWs = new WebSocket(
        `${VITE_WEBSCOKET_BASE_URL}?token=${(user as User).token}`
      );

      newWs.onopen = () => setGameState("waiting");

      newWs.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "start_game") {
          setGameId(data.gameId);
          setUserGameId(data.userId);
          setMessages([]);
          setUserTurn(data.isFirst || data.againstBot);
          setAgainstBot(data.againstBot);
          setGameState("in_progress");
        }

        if (["message_human", "message_bot"].includes(data.type)) {
          setMessages((prev) => [
            ...prev,
            { content: data.content.content, userId: data.content.userId },
          ]);

          if (data.isOver) {
            setUserTurn(false);
            setGameState("game_over");
            setTimeout(() => setGameState("game_vote"), 5000);
          } else {
            setUserTurn((prev) => (againstBot ? true : !prev));
          }
        }
      };

      setWs(newWs);

      return () => newWs.close();
    }, [user])
  );

  const handleSendMessage = () => {
    if (!message || !gameId || !userGameId) return;
    const messageType = againstBot ? "message_bot" : "message_human";
    ws?.send(
      JSON.stringify({
        type: messageType,
        content: message,
        gameId,
        userId: userGameId,
      })
    );
    setMessage("");
    if (againstBot) {
      setMessages((prev) => [
        ...prev,
        { content: message, userId: userGameId },
      ]);
      setUserTurn((prevTurn) => !prevTurn);
    }
  };

  const handleVote = (isHuman: boolean) => {
    dispatch(voteGame({ gameId, vote: isHuman }));
    setGameState("game_end");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 flex flex-row">
        <View className="flex-none w-1/12 md:w-3/12" />

        <View className="flex-1 flex flex-col border-x border-zinc-600">
          <View className="h-[50px] border-b border-zinc-600 flex flex-row items-center">
            <Text className="text-3xl font-bold text-white ml-2">Chat</Text>
          </View>

          {userTurn && gameId !== "" && (
            <View className="w-full p-2 bg-zinc-800">
              <Text className="text-white">C'est à vous !</Text>
            </View>
          )}

          {gameState === "waiting" ? (
            <View className="flex-1 flex items-center justify-center">
              <Text className="text-white text-lg">
                Recherche d'un adversaire...
              </Text>
            </View>
          ) : gameState === "in_progress" || gameState === "game_over" ? (
            <View className="flex-1">
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={true}
              >
                {messages.map((msg, index) => (
                  <View key={index} className="grid grid-cols-2">
                    {msg.userId === userGameId ? (
                      <Fragment>
                        <View className="col-span-1" />
                        <View
                          className="col-span-1 bg-primary min-h-[100px]"
                          style={{ backgroundColor: Colors.primary }}
                        >
                          <View className="flex flex-col items-end w-full justify-start px-3 h-full">
                            <Text className="font-bold">Vous</Text>
                            <Text className="font-semibold text-sm">
                              {msg.content}
                            </Text>
                          </View>
                        </View>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <View
                          className="col-span-1 bg-secondary min-h-[100px]"
                          style={{ backgroundColor: Colors.secondary }}
                        >
                          <View className="flex flex-col items-start px-3 h-full">
                            <Text className="text-white font-bold">
                              Inconnu
                            </Text>
                            <Text className="text-white font-semibold text-sm">
                              {msg.content}
                            </Text>
                          </View>
                        </View>
                        <View className="col-span-1" />
                      </Fragment>
                    )}
                  </View>
                ))}

                {!userTurn && gameState === "in_progress" && (
                  <View className="w-full p-2 text-zinc-700 min-h-[100px] flex flex-row items-center">
                    En attente de l'utilisateur ...
                  </View>
                )}

                {gameState === "game_over" && (
                  <View className="w-full p-2 text-zinc-700 min-h-[100px] flex flex-row items-center">
                    Fin de partie.
                  </View>
                )}
              </ScrollView>
            </View>
          ) : gameState === "game_vote" ? (
            <View className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <View className="w-full max-w-md bg-zinc-900 p-6 rounded-lg">
                <Text className="text-white text-3xl font-bold text-center mb-4">
                  Vote
                </Text>
                <Text className="text-white text-center text-lg mb-6">
                  Vous avez joué contre:
                </Text>
                <View className="space-y-4">
                  <Button label="UN HUMAIN" onClick={() => handleVote(true)} />
                  <Button label="UN BOT" onClick={() => handleVote(false)} />
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 flex items-center justify-center p-4">
              <Text className="text-white text-2xl font-bold mb-2">
                Merci d'avoir joué !
              </Text>
              <Text className="text-white text-lg mb-6">
                Vous avez joué contre {againstBot ? "un bot" : "un joueur"} !
              </Text>
              <Button
                label="Retour à l'accueil"
                onClick={() => router.navigate("/")}
              />
            </View>
          )}

          <View className="flex flex-row border-t border-zinc-600">
            <TextInput
              className="flex-1 px-4 py-2 text-white rounded-lg mr-2 focus:outline-none"
              value={message}
              onChangeText={setMessage}
              editable={userTurn}
              placeholder="Votre message..."
              placeholderTextColor="#888"
            />
            <View className="w-1/3">
              <Button
                label="Send"
                onClick={handleSendMessage}
                disabled={!userTurn}
              />
            </View>
          </View>
        </View>

        <View className="flex-none w-1/12 md:w-3/12" />
      </View>
    </KeyboardAvoidingView>
  );
}
