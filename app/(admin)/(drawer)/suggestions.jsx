import {FlatList, StyleSheet} from "react-native";
import {useEffect, useState} from "react";
import {suggestionService} from "../../../api/suggestionService";
import SafeAreaPage from "../../../components/SafeAreaPage";
import EmptyState from "../../../components/EmptyState";
import ThemedSuggestion from "../../../components/ThemedSuggestion";
import SuggestionModal from "../../../components/SuggestionModal";
import ThemedAlert from "../../../components/ThemedAlert";
import LoadingScreen from "../../../components/LoadingScreen";

export default function Suggestions() {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    // Subscribe to all suggestions
    useEffect(() => {
        const unsub = suggestionService.subscribeToAllSuggestions((suggestionsToDisplay) => {
            setSuggestions(suggestionsToDisplay);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const openSuggestion = (suggestion) => {
        setSelectedSuggestion(suggestion);
        setSuggestionModalVisible(true);
    };

    const closeSuggestionModal = () => {
        setSuggestionModalVisible(false);
        setSelectedSuggestion(null);
    };

    const handleDeleteSuggestion = async (suggestionId) => {
        try {
            await suggestionService.deleteSuggestion(suggestionId);
            showAlert('success', 'Success', 'Suggestion deleted successfully');
            closeSuggestionModal();
        } catch (error) {
            console.error('Error deleting suggestion:', error);
            showAlert('error', 'Error', error.message || 'Failed to delete suggestion');
        }
    };

    return (
        <SafeAreaPage style={styles.container}>
            {isLoading ? (
                <LoadingScreen loadingText="Loading suggestions..." />
            ) : (
                <>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showScrollIndicator={false}
                        scrollEnabled={!suggestionModalVisible}
                        listEmptyComponent={
                            <EmptyState
                                title="No suggestions yet"
                                description="Users can submit suggestions for new templates here. Check back later!"
                                iconName="beach"
                            />
                        }
                        renderItem={({ item }) => (
                            <ThemedSuggestion
                                suggestion={item}
                                onPress={() => openSuggestion(item)}
                            />
                        )}
                    />

                    <SuggestionModal
                        visible={suggestionModalVisible}
                        suggestion={selectedSuggestion}
                        onClose={closeSuggestionModal}
                        deleteSuggestion={handleDeleteSuggestion}
                    />

                    <ThemedAlert
                        visible={alertVisible}
                        alert={alert}
                        onConfirm={() => setAlertVisible(false)}
                    />
                </>
            )}
        </SafeAreaPage>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16 },
    listContent: {
        paddingVertical: 12,
    },
});
