import { StyleSheet, useColorScheme, ScrollView } from "react-native";
import { Colors } from "../../../../constants/Colors";
import SafeAreaPage from "../../../../components/SafeAreaPage";
import ThemedView from "../../../../components/ThemedView";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedIcon from "../../../../components/ThemedIcon";
import ThemedText from "../../../../components/ThemedText";
import Spacer from "../../../../components/Spacer";
import Divider from "../../../../components/Divider";
import { useAuth } from "../../../../hooks/useAuth";

const Profile = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const { user } = useAuth();

    return (
        <SafeAreaPage>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <ThemedView style={styles.headerSection}>
                    <ThemedView style={[styles.avatarContainer, { borderColor: theme.borders }]}>
                        {/* This should be a picture if the app wil have imgs*/}
                        <ThemedIcon
                            name="account-circle"
                            size={80}
                            style={styles.avatar}
                        />
                    </ThemedView>
                    <Spacer height={15} />
                    <ThemedText bold style={styles.userName}>
                        {user?.email?.split('@')[0] || 'User'}
                    </ThemedText>
                    <ThemedText style={[styles.userEmail]}>
                        {user?.email}
                    </ThemedText>
                </ThemedView>

                <Spacer height={25} />
                <Divider />

                {/* Account Information Section */}
                <Spacer height={20} />
                <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
                <Spacer height={10} />

                <ThemedCard style={styles.card}>
                    <ThemedView style={styles.infoRow}>
                        <ThemedIcon name="email-outline" size={24} />
                        <ThemedView style={styles.infoContent}>
                            <ThemedText style={styles.infoLabel}>Email Address</ThemedText>
                            <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <Spacer height={15} />
                </ThemedCard>
            </ScrollView>
        </SafeAreaPage>
    );
};

export default Profile;

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        borderWidth: 2,
        borderRadius: 50,
        padding: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    avatar: {
        margin: 10,
    },
    userName: {
        fontSize: 22,
        textTransform: 'capitalize',
    },
    userEmail: {
        fontSize: 14,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    card: {
        marginVertical: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.7,
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
    },
});
