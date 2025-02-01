import { Colors } from "@/constants/Colors";
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  style?: ViewStyle;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = "button",
  style,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onClick}
      style={[
        styles.button,
        style,
        disabled && { backgroundColor: Colors.disabled },
      ]}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && { color: Colors.disabledText }]}>
        {label || "Null"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  } as ViewStyle,
  text: {
    color: "#000000",
    fontSize: 16,
    fontWeight: 600,
  } as TextStyle,
});

export default Button;
