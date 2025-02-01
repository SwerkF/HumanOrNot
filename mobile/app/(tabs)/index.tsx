import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Button from "@/components/ui/Button/Button";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootState } from "@/redux/store";

const Home = () => {
  const router = useRouter();

  return (
    <View className="min-h-screen bg-black w-full flex flex-col items-center justify-center">
      <Text
        className="text-3xl md:text-6xl font-bold"
        style={{ color: Colors.primary }}
      >
        Human or Bot ?
      </Text>
      <Text className="text-white text-xs md:text-md mb-5 w-1/2 text-center">
        Dans ce jeu, vous devez indiquer, en 10 messages, si la personne en face
        est un humain ou un robot.
      </Text>
      <View className="w-1/2 md:w-1/5 flex flex-col items-center gap-3">
        <Button
          label="Je suis CHAUD !"
          onClick={() => router.navigate("/game")}
        />
        <Button
          label="Voir mes stats"
          onClick={() => router.navigate("/stats")}
        />
      </View>
    </View>
  );
};

export default Home;
