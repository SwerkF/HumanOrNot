import { View, StyleSheet, Text, Dimensions, Pressable } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { register } from "@/redux/slices/userSlices";

import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Colors } from "@/constants/Colors";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuth } = useAppSelector((state: RootState) => state.auth);
  const { error } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const router = useRouter();

  useEffect(() => {
    if (isAuth) {
      router.navigate("/");
    }
  }, [isAuth]);

  const handleRegister = () => {
    dispatch(
      register({
        username,
        email,
        password,
      })
    );
  };
  return (
    <ParallaxScrollView>
      <View className="flex flex-col justify-center items-center gap-2 min-h-[calc(100vh-200px)]">
        <Text className="text-6xl font-bold text-white">Register</Text>
        <Text className="text-white text-md mb-5">
          Créez un compte pour continuer.
        </Text>
        <View className="flex flex-col justify-center gap-2 items-center w-[400px]">
          <Input
            value={username}
            label="Username"
            onChangeText={(e) => {
              setUsername(e);
            }}
          />
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
          <Button label="Créer un compte" onClick={handleRegister} />
        </View>
        <View className="flex flex-row gap-2">
          <Text className="text-white text-md mb-5">
            Vous avez déjà un compte?
          </Text>
          <Pressable
            onPress={() => {
              router.navigate("/login");
            }}
          >
            <Text style={{ color: Colors.primary }}>Se connecter</Text>
          </Pressable>
        </View>
        {error && <Text className="text-red-500">{error}</Text>}
      </View>
    </ParallaxScrollView>
  );
}

// Remove unused styles
const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: Dimensions.get("window").height,
    gap: 10,
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: 800,
  },
  form: {
    flex: 1,
    flexDirection: "column",
    gap: 3,
    width: 300,
  },
});
