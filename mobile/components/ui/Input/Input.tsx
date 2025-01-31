import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';

interface InputProps extends TextInputProps {
    label: string;
}

export default function Input({ label, ...props }: InputProps) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                {...props}
            />
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        gap: 4,
        width: '100%',
    },
    input: {
        width: '100%',
        padding: 8,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: Colors.primary,
        color: '#FFFFFF',
        borderRadius: 4,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 12,
    },
});