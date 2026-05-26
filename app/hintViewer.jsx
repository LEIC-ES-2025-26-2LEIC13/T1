import { ScrollView, StyleSheet, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import SafeAreaPage from '../components/SafeAreaPage'
import ThemedIcon from '../components/ThemedIcon'
import ThemedText from '../components/ThemedText'
import Markdown from 'react-native-markdown-display'
import { Colors } from '../constants/Colors'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import PillsContainer from '../components/PillsContainer'
import Pill from '../components/Pill'
import AnimatedPressable from '../components/AnimatedPressable'
import EmptyState from '../components/EmptyState'
import { columnService } from '../api/columnService'

const HintViewer = () => {
	const params = useLocalSearchParams()
	const projectId = params.projectId
	const columnId = params.columnId
	const taskId = params.taskId

	const colorScheme = useColorScheme()
	const theme = Colors[colorScheme] ?? Colors.light

	const router = useRouter()

	const [content, setContent] = useState('')

	useEffect(() => {
		const fetchHint = async () => {
			const task = await columnService.getTask(projectId, columnId, taskId)
			setContent(task?.hints ?? '')
		}

		fetchHint()
	}, [projectId, columnId, taskId])

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
	}, [router])

	const preview = () => (
		<ScrollView
			style={{ flex: 1, marginBottom: 20 }}
			contentContainerStyle={!content?.trim() && { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
		>
			{content?.trim() ? (
				<Markdown
					style={{
						body: { color: theme.text, fontSize: 16 },
						heading1: { color: theme.title },
						heading2: { color: theme.title },
						heading3: { color: theme.title },
						heading4: { color: theme.title },
						heading5: { color: theme.title },
						heading6: { color: theme.title },
					}}
				>
					{content}
				</Markdown>
			) : (
				<EmptyState
					title="No Hint Content"
					subtitle="This task does not have hints yet."
					iconName="lightbulb-on-outline"
				/>
			)}
		</ScrollView>
	)

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: () => (
						<ThemedText title bold style={{ fontSize: 20 }}>
							View Hints
						</ThemedText>
					),
					headerLeft: () => (
						<AnimatedPressable onPress={handleGoBack} style={{ paddingLeft: 5, paddingRight: 10 }}>
							<ThemedIcon testID="hint-viewer-arrow-back" name="arrow-left" />
						</AnimatedPressable>
					),
				}}
			/>

			<SafeAreaPage style={styles.container}>
				<PillsContainer style={{ marginBottom: 20 }}>
					<Pill projectName={params.projectName} />
					<Pill columnName={params.columnName} />
					<Pill taskName={params.taskName} />
				</PillsContainer>

				{preview()}
			</SafeAreaPage>
		</>
	)
}

export default HintViewer

const styles = StyleSheet.create({
	container: {
		justifyContent: 'space-between',
		padding: 20,
	},
})
