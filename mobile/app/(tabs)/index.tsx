import { View, StyleSheet, Text, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';

import { useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { login } from '@/redux/slices/userSlices';

import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { useAppSelector } from '@/hooks/useAppSelector';
import { RootState } from '@/redux/store';
import { useAppDispatch } from '@/hooks/useAppDispatch';

export default function HomeScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { isAuth, error, status } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    dispatch(login({
      email, password
    }))
  }

  return (
    <ParallaxScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.form}>
          <Input
            value={email}
            label="Email"
            onChangeText={(e) => { setEmail(e) }}

          />
          <Input
            value={password}
            label="Password"
            onChangeText={(e) => { setPassword(e) }}
          />
          <Button
            label="Se connecter"
            onClick={handleLogin}
          />
        </View>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: Dimensions.get('window').height,
    gap: 10
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: 800
  },
  form: {
    flex: 1,
    flexDirection:"column",
    gap: 3,
    width: 300
  }
});
