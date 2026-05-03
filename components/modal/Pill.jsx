import { Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import React from 'react'
import ThemedIcon from '../ThemedIcon'
import ThemedText from '../ThemedText'
import { Colors } from '../../constants/Colors'

const Pill = ({ projectName, columnName, iconName, name, pressable, onPress, isSelected }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const Content = ({ isSelected }) => {
        return (
            <>
                <ThemedIcon onPrimary={isSelected}
                    name={projectName ? "folder-open-outline" : (columnName ? "table-column" : iconName)}  
                    size={13}
                    style={{ marginRight: 5 }}
                />
                <ThemedText style={styles.name} onPrimary={isSelected} >
                    {projectName ?? columnName ?? name}
                </ThemedText>
            </>
        )
    }

    return (
        pressable ?
            <Pressable style={[styles.pill, { backgroundColor: (isSelected ? Colors.primary : theme.borders) }]} 
                    onPress={onPress}>
                <Content isSelected={isSelected}/>
            </Pressable>

        :
            <View style={[styles.pill, { backgroundColor: (isSelected ? Colors.primary : theme.borders) }]}>
                <Content/>
            </View>
    )
}

export default Pill

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
        marginBottom: 18,
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
    }
})