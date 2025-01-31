import { Colors } from '@/constants/Colors';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'button', style }) => {
    return (
        <TouchableOpacity onPress={onClick} style={[styles.button, style]}>
            <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor:  Colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    text: {
        color: '#000000',
        fontSize: 16,
    } as TextStyle,
});

export default Button;
