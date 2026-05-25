import { useState } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import AnimatedPressable from "./AnimatedPressable";
import SuggestionModal from "./SuggestionModal";
import ThemedCard from "./ThemedCard";
import ThemedText from "./ThemedText";

export default function ThemedSuggestion({ suggestion, onPress }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = () => {
        setModalVisible(true);
        onPress?.();
    };

    return (
        <>
            <AnimatedPressable onPress={handlePress}>
                <ThemedCard>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                        {suggestion?.description || 'Suggestion'}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                        {suggestion?.userEmail || 'Unknown'}
                    </ThemedText>
                </ThemedCard>
            </AnimatedPressable>

            <SuggestionModal
                visible={modalVisible}
                suggestion={suggestion}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}