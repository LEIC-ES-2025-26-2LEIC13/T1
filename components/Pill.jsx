import { StyleSheet, useColorScheme, View } from 'react-native'
import React from 'react'
import ThemedIcon from './ThemedIcon'
import ThemedText from './ThemedText'
import { Colors } from '../constants/Colors'
import AnimatedPressable from './AnimatedPressable'

const Pill = ({ projectName, columnName, taskName, iconName, name, pressable, onPress, isSelected, customStyle }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const Content = ({ isSelected }) => {
        return (
            <>
                {(projectName || columnName || taskName || iconName) ? (
                    <ThemedIcon onPrimary={isSelected}
                    name={projectName ? "folder-open-outline" : (columnName ? "table-column" : (taskName ? "checkbox-marked-outline" : iconName))}  
                    size={13}
                    style={{ marginRight: 5 }}
                    />
                ) : null}

                <ThemedText style={styles.name} onPrimary={isSelected} >
                    {projectName ?? columnName ?? taskName ?? name}
                </ThemedText>
            </>
        )
    }
    

    return (
        pressable ?
            <AnimatedPressable style={[styles.pill, { backgroundColor: (isSelected ? Colors.primary : theme.borders) }, customStyle]} 
                    onPress={onPress}>
                <Content isSelected={isSelected}/>
            </AnimatedPressable>

        :
            <View style={[styles.pill, { backgroundColor: (isSelected ? Colors.primary : theme.borders) }, customStyle]}>
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
        borderRadius: 20,
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
    }
})