import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/Colors';
import ThemedText from './ThemedText';

const ToastCard = ({ text1, text2 }) => {
    const scheme = useColorScheme();
    const theme = Colors[scheme] ?? Colors.light;
    return (
        <View
        style={[
            styles.card,
            {
            backgroundColor: theme.navBackground,
            borderColor: Colors.primary,
            shadowColor: theme.title,
            },
        ]}
        >
        <View style={[styles.accentBar, { backgroundColor: Colors.primary }]} />
        <View style={styles.textContainer}>
            {!!text1 && <ThemedText title bold style={styles.title}>{text1}</ThemedText>}
            {!!text2 && <ThemedText style={styles.subtitle}>{text2}</ThemedText>}
        </View>
        </View>
    );
};

const AppToast = () => {
    const toastConfig = {
        default: ({ text1, text2 }) => (
            <ToastCard
                text1={text1}
                text2={text2}
            />
        ),
    };

    return <Toast config={toastConfig} />;
};

const styles = StyleSheet.create({
    card: {
        width: '92%',
        minHeight: 62,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3
    },
    accentBar: {
        width: 6,
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    title: {
        fontSize: 15,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
    }
});

export default AppToast;
