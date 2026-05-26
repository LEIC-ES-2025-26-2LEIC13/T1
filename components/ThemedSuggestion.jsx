import { useState } from "react";
import AnimatedPressable from "./AnimatedPressable";
import SuggestionModal from "./SuggestionModal";
import ThemedCard from "./ThemedCard";
import ThemedText from "./ThemedText";

export default function ThemedSuggestion({ suggestion, onPress }) {
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