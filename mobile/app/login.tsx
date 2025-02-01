import { View, Text, Pressable } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";

import { useEffect, useState } from "react";
import { login } from "@/redux/slices/userSlices";

import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/hooks/useAppDispatch";

import "@/style/global.css";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuth, error, status } = useAppSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (isAuth) {
      router.navigate("/");
    }
  }, [isAuth]);

  const handleLogin = () => {
    dispatch(
      login({
        email,
        password,
      })
    );
  };

  return (
    <ParallaxScrollView>
      <View className="flex flex-col justify-center items-center gap-2 min-h-[calc(100vh-200px)]">
        <Text className="text-6xl font-bold text-white">Login</Text>
        <Text className="text-white text-md mb-5">
          Connectez-vous pour continuer.
        </Text>
        <View className="flex flex-col justify-center gap-2 items-center w-[400px]">
          <Input
            value={email}
            label="Email"
            onChangeText={(e) => {
              setEmail(e);
            }}
          />
          <Input
            value={password}
            label="Password"
            secureTextEntry={true}
            onChangeText={(e) => {
              setPassword(e);
            }}
          />
          <Button label="Se connecter" onClick={handleLogin} />
        </View>
        <View className="flex flex-row gap-2">
          <Text className="text-white text-md mb-5">
            Vous n'avez pas de compte?
          </Text>
          <Pressable
            onPress={() => {
              router.navigate("./register");
            }}
          >
            <Text style={{ color: Colors.primary }}>S'inscrire</Text>
          </Pressable>
        </View>
        {status === "failed" && <Text className="text-red-500">{error}</Text>}
      </View>
    </ParallaxScrollView>
  );
}
