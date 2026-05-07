import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import AppModal from './AppModal';
import ThemedIcon from './ThemedIcon';
import ThemedButton from './ThemedButton';
import Spacer from './Spacer';


export const ALERT_TYPES = {
    ERROR: 'alert-circle',
    WARNING: 'alert',
    INFO: 'information',
    SUCCESS: 'check-circle',
}

const ThemedAlert = ({ visible, alert, onConfirm, onCancel }) => {

    const validTypes = Object.values(ALERT_TYPES);
    const iconName = validTypes.includes(alert.type) ? alert.type : ALERT_TYPES.ERROR

    return (
        <AppModal visible={visible}>
            <View style={styles.alertContainer}>
        
                <View style={styles.alertHeader}>
                    <ThemedIcon name={iconName} size={40} />
                    <ThemedText bold title style={{ fontSize: 18 }}>
                        {alert.title}
                    </ThemedText>
                </View>

                <Spacer height={15}/>
                
                <ThemedText style={styles.alertMessage}>
                    {alert.message}
                </ThemedText>
                
                <Spacer height={25}/>

                <View style={styles.alertActions}>
                    { onCancel && (
                        <ThemedButton onPress={onCancel} style={{ width: '30%', backgroundColor: 'transparent', borderWidth: 1, borderColor: 'gray'}}>
                            <ThemedText bold>Cancel</ThemedText>
                        </ThemedButton>
                    )}

                    <ThemedButton onPress={onConfirm} style={{ width: '30%'}}>
                        <ThemedText onPrimary bold>OK</ThemedText>
                    </ThemedButton>
                </View>
            </View>
        </AppModal>
    );
};

const styles = StyleSheet.create({
    alertContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },

    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },

    alertMessage: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 25
    },

    alertActions: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        justifyContent: 'center'
    }
});

export default ThemedAlert;
