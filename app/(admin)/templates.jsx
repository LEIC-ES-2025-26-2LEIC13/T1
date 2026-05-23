import React, { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ThemedText from '../../components/ThemedText';
import ThemedProject from '../../components/ThemedProject';
import ThemedButton from '../../components/ThemedButton';
import CreateProjectModal from '../../components/CreateProjectModal';
import EmptyState from '../../components/EmptyState';
import ThemedAlert, { ALERT_TYPES } from '../../components/ThemedAlert';
import ThemedView from '../../components/ThemedView';
import ThemedIcon from '../../components/ThemedIcon';

const Templates = () => {
  const [templates, setTemplates] = useState([])

  const [modalVisible, setModalVisible] = useState(false)
  const [template, setTemplate] = useState({ title: '', description: '' })

  // Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alert, setAlert] = useState({ type: '', title: '', message: '' });

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message })
    setAlertVisible(true)
  }

  const openModal = () => setModalVisible(true)
  const closeModal = () => {
    setModalVisible(false)
    setTemplate({ title: '', description: '' })
  }

  const handleChange = (field, value) => setTemplate(prev => ({ ...prev, [field]: value }))

  const handleCreate = async (data) => {
    try {
      const newTemplate = {
        id: `${Date.now()}`,
        title: (data.title ?? '').trim(),
        description: (data.description ?? '').trim(),
        createdAt: new Date(),
      }

      setTemplates(prev => [newTemplate, ...prev])
      closeModal()
    } catch (e) {
      showAlert(ALERT_TYPES.ERROR, 'Create Template Failed', e.message)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <>
          <FlatList
            data={templates}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, (templates.length === 0) && styles.listEmpty]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState title="No templates" subtitle="Create templates here" iconName="file-document" />}
            renderItem={({ item, index }) => (
              <ThemedProject name={item.title} description={item.description} borderColor={'#888'} />
            )}
          />

          <ThemedButton style={{ marginBottom: 16 }} onPress={openModal}>
            <ThemedIcon name="plus" onPrimary style={{ marginRight: 6 }} />
            <ThemedText bold onPrimary>Create Template</ThemedText>
          </ThemedButton>

          <CreateProjectModal
            visible={modalVisible}
            onClose={closeModal}
            onCreate={handleCreate}
            project={template}
            onChange={handleChange}
            // repurpose modal for templates; labels remain generic
          />

          <ThemedAlert visible={alertVisible} alert={alert} onConfirm={() => setAlertVisible(false)} />
        </>
    </ThemedView>
  )
}

export default Templates

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  list: { paddingVertical: 16 },
  listEmpty: { flex: 1, marginTop: 50 }
})
