import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import SafeAreaPage from '../../components/SafeAreaPage'
import ThemedButton from '../../components/ThemedButton'
import ThemedIcon from '../../components/ThemedIcon'
import ThemedText from '../../components/ThemedText'
import Markdown from 'react-native-markdown-display';
import ThemedTextInput from '../../components/ThemedTextInput'
import { Colors } from '../../constants/Colors'

const HintEditor = () => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [isEditing, setIsEditing] = useState(false)
    const [isPreviewing, setIsPreviewing] = useState(false)

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSave = () => {
        setIsEditing(false)
    }

    const [content, setContent] = useState('')

    const editor = () => (
        <View style={{ flex: 1, marginBottom: 20 }}>
            <ThemedTextInput
                multiline
                placeholder="Enter hint content in Markdown format..."
                onChangeText={setContent}
                containerStyle={{ flex: 1 }}
                style={{ flex: 1, textAlignVertical: 'top', fontSize: 16 }}
            >
                {content}
            </ThemedTextInput>
        </View>
    )

    const preview = () => (
         <ScrollView style={{ flex: 1, marginBottom: 20 }}>
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
        </ScrollView>
    )

    console.log("Is Editing:", isEditing)
    console.log("Is Previewing:", isPreviewing)
    return (
        <SafeAreaPage style={styles.container}>

            {isEditing && !isPreviewing ? editor() : preview()}
            
            <View style={styles.buttonContrainer}>
                
                {!isPreviewing && 
                <ThemedButton style={{flex: 1}} onPress={isEditing ? handleSave : handleEdit}>
                    <ThemedIcon onPrimary name={isEditing ? "content-save" : "pencil"} style={{ marginRight: 6 }}/>
                    <ThemedText onPrimary bold>{isEditing ? "Save Hint" : "Edit Hint"}</ThemedText>
                </ThemedButton>
                }

                {isEditing &&
                <ThemedButton style={{flex: 1}} onPress={() => setIsPreviewing(!isPreviewing)}>
                    <ThemedIcon onPrimary name={isPreviewing ? "eye-off" : "eye"} style={{ marginRight: 6 }}/>
                    <ThemedText onPrimary bold>{isPreviewing ? "Hide Preview" : "Show Preview"}</ThemedText>
                </ThemedButton>
                }   
            </View>
            
        </SafeAreaPage>
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
    }
})