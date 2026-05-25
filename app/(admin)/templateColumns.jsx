import { FlatList, useWindowDimensions, View } from 'react-native'
import React from 'react'
import ThemedButton from '../../components/ThemedButton';
import ThemedIcon from '../../components/ThemedIcon';
import ThemedText from '../../components/ThemedText';
import EmptyState from '../../components/EmptyState';
import TemplateColumn from './templateColumn';


const TemplateColumns = ({ columns, templateId, currentTemplateName, openCreateColumnModal }) => {
    const { width } = useWindowDimensions()
    
    return (
        <>
            <FlatList
                data={columns}
                keyExtractor={(item) => item.id}

                contentContainerStyle={[
                    {padding: 16},
                    (columns.length === 0) && { flex: 1, marginTop: 50 }
                ]}

                horizontal
                showsHorizontalScrollIndicator={false}

                snapToOffsets={
                    columns.length > 1 
                    ? columns.map((_, i) => {
                        const colWidth = width * 0.87;
                        const spacing = 12; // matching the marginRight in renderItem
                        
                        // 1. First column: aligned to the left
                        if (i === 0) return 0;
                        
                        // 2. Last column: aligned to the right
                        if (i === columns.length - 1) {
                            // total content width: left padding + items + margins + right padding
                            const totalWidth = 32 + (columns.length * colWidth) + ((columns.length - 1) * spacing);
                            return totalWidth - width;
                        }
                        
                        // 3. Middle columns: centered
                        const itemLeft = 16 + i * (colWidth + spacing);
                        const centerOffset = itemLeft - (width - colWidth) / 2;
                        return centerOffset;
                        })
                    : undefined
                }

                decelerationRate="fast"

                ListEmptyComponent={<EmptyState
                    title="No columns yet"
                    subtitle="Create the first column of the template using the button below"
                    iconName="view-column-outline"
                />}
                
                renderItem={({ item, index }) => {
                    const columnWidth = columns.length === 1 ? width - 32 : width * 0.87;
                    const marginRight = index === columns.length - 1 ? 0 : 12;
                    
                    return (
                        <View style={{ width: columnWidth, marginRight }}>
                            <TemplateColumn
                                templateId={templateId}
                                templateName={currentTemplateName}
                                columnData={item}
                                columns={columns}
                            />
                        </View>
                    );
                }}
            />

            {columns.length === 0 && (
                <ThemedButton
                    testID="open-create-column-modal-button"
                    style={{ margin: 20 }}
                    onPress={openCreateColumnModal}>
                    <ThemedIcon name="plus" onPrimary style={{ marginRight: 6 }} /> 
                    <ThemedText bold onPrimary>Create Column</ThemedText>
                </ThemedButton>
            )}
        </>
    )
}

export default TemplateColumns
