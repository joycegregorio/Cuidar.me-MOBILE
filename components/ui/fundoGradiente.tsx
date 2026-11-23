import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { GRADIENTE } from "@/constants/cores";

type Props = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
};

export default function FundoGradiente ({ children, style }: Props) {
    return (
        <LinearGradient
            colors={GRADIENTE}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}    
            style={[styles.fundo, style]}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1
    },
})