import { View, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';

import { useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { register } from '@/redux/slices/userSlices';

import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { useAppSelector } from '@/hooks/useAppSelector';
import { RootState } from '@/redux/store';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { Colors } from '@/constants/Colors';

export default function RegisterScreen() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { isAuth, error, status } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const handleRegister = () => {
        dispatch(register({
            username, email, password
        }))
    }

    return (
        <ParallaxScrollView>
            <View style={styles.container}>
                <Text style={styles.title}>Register</Text>
                <View style={styles.form}>
                    <Input
                        value={username}
                        label="Username"
                        onChangeText={(e) => { setUsername(e) }}
                    />
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
                        label="Register"
                        onClick={handleRegister}
                    />
                </View>
                {error && <Text>{error}</Text>}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Text>Vous avez déjà un compte ?</Text>
                    <Pressable
                        onPress={() => navigation.navigate('login')}
                    >
                        <Text style={{ color: Colors.primary }}>Se connecter</Text>
                    </Pressable>
            </View>
        </ParallaxScrollView>
    );
};

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
  