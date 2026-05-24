import React, { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { ProjectColors } from '../../constants/Colors';
import { useTemplate } from "../../hooks/useTemplate";
import ThemedText from '../../components/ThemedText';
import ThemedProject from '../../components/ThemedProject';
import ThemedButton from '../../components/ThemedButton';
import CreateTemplateModal from "../../components/CreateTemplateModal";
import EmptyState from '../../components/EmptyState';
import ThemedAlert, { ALERT_TYPES } from '../../components/ThemedAlert';
import ThemedView from '../../components/ThemedView';
import ThemedIcon from '../../components/ThemedIcon';
import LoadingScreen from "../../components/LoadingScreen";

const Templates = () => {

    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const { templates, createTemplate, isLoadingTemplates } = useTemplate();

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    const [template, setTemplate] = React.useState({
        title: '',
        description: '',
    });

    const handleTemplateChange = (field, value) => {
        setTemplate((prev) => ({ ...prev, [field]: value }))
    };

    // Template modal
    const openTemplateModal = () => setTemplateModalVisible(true);

    const closeTemplateModal = () => {
        setTemplateModalVisible(false)
        setTemplate({
            title: '',
            description: '',
        });
    };

    const handleCreateTemplate = async (template) => {
        try {
            await createTemplate(template)
            closeTemplateModal()
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, 'Create Template Failed', error.message)
        }
    };


    return (
        <ThemedView style={styles.container}>
            {
                isLoadingTemplates ?

                <LoadingScreen loadingText="Loading Templates..."/>

                :
                <>
                    <FlatList
                        data={templates}
                        keyExtractor={(item, index) => `${item.title}-${index}`}

                        contentContainerStyle={[
                            styles.list,
                            (templates.length === 0) && styles.listEmpty
                        ]}

                        showsVerticalScrollIndicator={false}

                        ListEmptyComponent={<EmptyState
                            title="No templates"
                            subtitle="When you create a template it will appear here"
                            iconName="folder-open"
                        />}

                        renderItem={({ item, index }) => (
                            <ThemedProject
                                name={item.title}
                                description={item.description}
                                borderColor={ProjectColors[index % ProjectColors.length]}
                            />
                        )}
                    />


                    <ThemedButton
                        testID="open-create-template-modal-button"
                        style={{ marginBottom: 16 }}
                        disabled={isLoadingTemplates}
                        onPress={openTemplateModal}>
                        <ThemedIcon name="plus" onPrimary style={{ marginRight: 6 }} />
                        <ThemedText bold onPrimary>Create Template</ThemedText>
                    </ThemedButton>

                    <CreateTemplateModal
                        visible={templateModalVisible}
                        onClose={closeTemplateModal}
                        onCreate={handleCreateTemplate}
                        project={template}
                        onChange={handleTemplateChange}
                    />

                    <ThemedAlert
                        visible={alertVisible}
                        alert={alert}
                        onConfirm={() => setAlertVisible(false)}
                    />
                </>
            }

        </ThemedView>
    );
}

export default Templates;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },

    list: {
        paddingVertical: 16,
    },

    listEmpty: {
        flex: 1,
        marginTop: 50
    }
})
