import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import SafeAreaPage from '../../components/SafeAreaPage'
import ThemedButton from '../../components/ThemedButton'
import ThemedIcon from '../../components/ThemedIcon'
import ThemedText from '../../components/ThemedText'
import Markdown from 'react-native-markdown-display';
import ThemedTextInput from '../../components/ThemedTextInput'
import { Colors } from '../../constants/Colors'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { templateColumnService } from '../../api/templateColumnService'
import PillsContainer from '../../components/PillsContainer'
import Pill from '../../components/Pill'
import AnimatedPressable from '../../components/AnimatedPressable'
import ThemedAlert, { ALERT_TYPES } from '../../components/ThemedAlert'
import EmptyState from '../../components/EmptyState'

const HintEditor = () => {

    const params = useLocalSearchParams()
    const templateId = params.templateId
    const columnId = params.columnId
    const taskId = params.taskId

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [isEditing, setIsEditing] = useState(false)
    const [isPreviewing, setIsPreviewing] = useState(false)

    const router = useRouter()

    const handleEdit = () => {
        setIsEditing(true)
    }

    const [content, setContent] = useState('')

    useEffect(() => {
        const fetchHint = async () => {
            const hint = await templateColumnService.getHint(templateId, columnId, taskId)
            setContent(hint)
        }
        fetchHint()
    }, [templateId, columnId, taskId])

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    const handleSave = async () => {

        if (!content?.trim()) {
            // If content is empty, delete the hint
            try {
                await templateColumnService.deleteHint(templateId, columnId, taskId)
            }
            catch (error) {
                showAlert(ALERT_TYPES.ERROR, 'Delete Hint Failed', error.message)
            }
            setIsEditing(false)
            return
        }

        try {
            await templateColumnService.saveHint(templateId, columnId, taskId, content)
        }
        catch (error) {
            showAlert(ALERT_TYPES.ERROR, 'Save Hint Failed', error.message)
        }
        setIsEditing(false)
    }

    const handleGoBack = useCallback(() => {
        try {
            if (router.canGoBack()) {
            router.back()
            return
            }
            router.replace('/')
        } catch {
            router.replace('/')
        }
    }, [router]);

    const editor = () => (
        <View style={{ flex: 1, marginBottom: 20 }}>
            <ThemedTextInput
                multiline
                placeholder="Enter hint content in Markdown format..."
                onChangeText={setContent}
                containerStyle={{ flex: 1 }}
                style={styles.hintTextInput}
            >
                {content}
            </ThemedTextInput>
        </View>
    )

    const preview = () => (
         <ScrollView 
            style={{ flex: 1, marginBottom: 20 }}
            contentContainerStyle={!content?.trim() && { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
         >
            {content?.trim() ? 

            <Markdown style={{
                body: { color: theme.text, fontSize: 16 },
                heading1: { color: theme.title },
                heading2: { color: theme.title },
                heading3: { color: theme.title },
                heading4: { color: theme.title },
                heading5: { color: theme.title },
                heading6: { color: theme.title },
            }}>
                {content}
            </Markdown>

            :
            
            <EmptyState
                title="No Hint Content"
                subtitle="Add hint content clicking on the button below."
                iconName="lightbulb-on-outline"
            />

        }
        </ScrollView>
    )

    return (

        <>
            <Stack.Screen
                options={{

                    headerTitle: () => (
                        <ThemedText title bold style={{ fontSize: 20 }}>
                            Edit Hints
                        </ThemedText>
                    ),

                    headerLeft: () => (
						<AnimatedPressable onPress={handleGoBack} style={{ paddingLeft: 5, paddingRight: 10 }}>
							<ThemedIcon testID="hint-editor-arrow-back" name="arrow-left"/>
						</AnimatedPressable>
					),
                }}
            />
            <SafeAreaPage style={styles.container}>

                <PillsContainer style={{ marginBottom: 20 }}>
                    <Pill projectName={params.templateName}/>
                    <Pill columnName={params.columnName}/>
                    <Pill taskName={params.taskName}/>
                </PillsContainer>

                {isEditing && !isPreviewing ? editor() : preview()}
                
                <View style={styles.buttonContrainer}>
                    
                    {!isPreviewing && 
                    <ThemedButton testID="save-edit-hints-button" style={{flex: 1}} onPress={isEditing ? handleSave : handleEdit}>
                        <ThemedIcon onPrimary name={isEditing ? "content-save" : "pencil"} style={{ marginRight: 6 }}/>
                        <ThemedText onPrimary bold>{isEditing ? "Save Hints" : "Edit Hints"}</ThemedText>
                    </ThemedButton>
                    }

                    {isEditing &&
                    <ThemedButton testID="toggle-preview-button" style={{flex: 1}} onPress={() => setIsPreviewing(!isPreviewing)}>
                        <ThemedIcon onPrimary name={isPreviewing ? "eye-off" : "eye"} style={{ marginRight: 6 }}/>
                        <ThemedText onPrimary bold>{isPreviewing ? "Hide Preview" : "Show Preview"}</ThemedText>
                    </ThemedButton>
                    }   
                </View>

                 <ThemedAlert
                    visible={alertVisible}
                    alert={alert}
                    onConfirm={() => setAlertVisible(false)} 
                />
            </SafeAreaPage>
        </>
    )
}

export default HintEditor

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        padding: 20
    },
    buttonContrainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10
    },
    hintTextInput: {
        flex: 1,
        textAlignVertical: 'top',
        fontSize: 16,
        height: '100%'
    }
})