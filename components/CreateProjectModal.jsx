import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import FormField from './FormField';
import ModalBody from './modal/ModalBody';
import ModalActions from './modal/ModalActions';
import ThemedIcon from './ThemedIcon';
import ThemedText from './ThemedText';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';
import AnimatedPressable from './AnimatedPressable';
import { useEffect, useState } from 'react';
import ThemedAlert, { ALERT_TYPES } from './ThemedAlert';
import { FlatList } from 'react-native-gesture-handler';
import ThemedProject from './ThemedProject';
import EmptyState from './EmptyState';

export default function CreateProjectModal({
    visible,
    onClose,
    onCustomCreate,
    onTemplateCreate,
    project,
    onChange,
    getTemplateProjects
}) {
    
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [step, setStep] = useState(1); // 1: Choose type, 2: Template, 3: Custom
    const [templates, setTemplates] = useState([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(null)

    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

    // Alert
    const [alertVisible, setAlertVisible] = useState(false)
    const [alert, setAlert] = useState({ type: '', title: '', message: '' })

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message })
        setAlertVisible(true)
    };

    useEffect(() => {
        if (visible) {
            setStep(1)
        }
    }, [visible])

    const optionTemplate = "Template Project"
    const optionCustom = "Custom Project"

    const handleChooseType = async (optionName) => {
        if (optionName === optionTemplate) {
            setStep(2);
            setIsLoadingTemplates(true)
            try {
                const templateProjects =  await getTemplateProjects()
                setTemplates(templateProjects)
                setIsLoadingTemplates(false)
            } catch (error) {
                showAlert(ALERT_TYPES.ERROR, "Failed to Load Templates", error.message)
                setIsLoadingTemplates(false)
            }

        } else if (optionName === optionCustom) {
            setStep(3);
        }
    }

    const choice = (testID, title, description, iconName) => (
        <AnimatedPressable testID={testID} onPress={() => handleChooseType(title)}>
            <View style={[styles.choiceContainer, { borderColor: theme.borders }]}>
                <ThemedIcon name={iconName}/>
                <ThemedText title bold style={{ marginTop: 10 }}>{title}</ThemedText>
                <ThemedText style={styles.description}>{description}</ThemedText>
            </View>
        </AnimatedPressable>
    )

    const choiceModal = (
        <>
            <ModalHeader
                heading="Create Project"
                iconName="folder-open-outline"
                onClose={onClose}
            />

            <ModalBody>
                {choice("choice-template-project", optionTemplate, "Start with a pre-defined template for a L.EIC project", "lightning-bolt")}
                {choice("choice-custom-project", optionCustom, "Create a new project from scratch", "folder-plus")}
            </ModalBody>

        </>
    )

    const handleSelectTemplate = (template) => {
        if (template === selectedTemplate) {
            setSelectedTemplate(null)
            onChange('title', '')
            onChange('description', '')
        } else {
            setSelectedTemplate(template)
            onChange('title', template.title)
            onChange('description', template.description)
        }
    }

    const handleGoBackToChoice = () => {
        setStep(1)
        setSelectedTemplate(null)
        onChange('title', '')
        onChange('description', '')
    }

    const CustomActivityIndicator = (text) => (
        <>
            <ActivityIndicator size='large' color={ Colors.primary } />
            <ThemedText style={{ marginTop: 10 }}>{text}</ThemedText>
        </>
    )

    const templateProject = (
        <>
            <ModalHeader
                heading="Choose Template"
                iconName="lightning-bolt"
                onClose={onClose}
            />

            <ModalBody>
                <View style={styles.templateContainer}>

                    {isLoadingTemplates ? CustomActivityIndicator("Loading templates...") : 
                    isCreatingTemplate ? CustomActivityIndicator("Creating project from template...") :

                    <FlatList
                        data={templates}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ flex: 1 }}

                        ListEmptyComponent={<EmptyState
                            title="No template projects available"
                            subtitle="When a template project is available, it will appear here"
                            iconName="lightning-bolt"
                        />}

                        renderItem={({ item }) => (
                            <ThemedProject
                                name={item.title}
                                description={item.description}
                                borderColor={Colors.primary}
                                onPress={() => handleSelectTemplate(item)}
                                selected={selectedTemplate?.id === item.id}
                            />
                        )}
                    />
                    }

                </View>
            </ModalBody>

            <ModalActions
                testID="template-project-modal-actions"
                onCancel={handleGoBackToChoice}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryActionPress={async () => { setIsCreatingTemplate(true); await onTemplateCreate(selectedTemplate); setIsCreatingTemplate(false)}}
                primaryActionDisabled={!selectedTemplate}
            />
        </>
    )

    const customProject = (
        <>
            <ModalHeader
                heading="New Project"
                iconName="folder-open-outline"
                onClose={onClose}
            />

            <ModalBody>

                <FormField
                    labelName="PROJECT TITLE"
                    placeholder="Enter project title"
                    value={project.title}
                    onChangeText={(value) => onChange('title', value)}
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="Enter project description (optional)"
                    value={project.description}
                    onChangeText={(value) => onChange('description', value)}
                    multiline
                />
                
            </ModalBody>


            <ModalActions
                testID="create-project-modal-actions"
                onCancel={handleGoBackToChoice}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryActionPress={async () => await onCustomCreate(project) }
                primaryActionDisabled={!project.title.trim()} // .trim() to ignore whitespace
            />
        </>
    )

    return (
        <>
            <AppModal visible={visible} onClose={onClose}>
                
                {step === 1 ? choiceModal : (step === 2 ? templateProject : customProject)}

            </AppModal>

            <ThemedAlert
                visible={alertVisible}
                alert={alert}
                onConfirm={() => setAlertVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    choiceContainer: {
        alignItems: 'center',
        padding: 20,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15
    },

    description: {
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 5
    },

    templateContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    }
})