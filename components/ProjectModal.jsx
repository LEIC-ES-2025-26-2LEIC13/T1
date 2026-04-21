import { Text, StyleSheet } from 'react-native';
import AppModal from './AppModal';
import ThemedText from './ThemedText';
import Spacer from './Spacer';
import ThemedButton from './ThemedButton';
import ThemedView from './ThemedView';
import ThemedTextInput from './ThemedTextInput';

export default function ProjectModal({
	visible,
	onClose,
	onCreate,
	titleValue,
	onTitleChangeText,
	descriptionValue,
	onDescriptionChangeText,
}) {
	return (
		<AppModal visible={visible}>
			<ThemedText title={true} style={styles.title}>
				Create Project
			</ThemedText>

			<ThemedText title={true}>Project Title</ThemedText>
			<Spacer height={10} />

			<ThemedTextInput
				style={{ width: '100%', marginBottom: 15 }}
				placeholder="Enter project title"
				value={titleValue}
				onChangeText={onTitleChangeText}
			/>

			<ThemedText title={true}>Description</ThemedText>
			<Spacer height={10} />

			<ThemedTextInput
				style={{ width: '100%', marginBottom: 15, height: 100, textAlignVertical: 'top' }}
				placeholder="Enter project description"
				multiline={true}
				value={descriptionValue}
				onChangeText={onDescriptionChangeText}
			/>

			<ThemedView style={styles.actions}>
				<ThemedButton style={[styles.button, styles.cancel]} onPress={onClose}>
					<Text style={styles.buttonTextCancel}>Cancel</Text>
				</ThemedButton>

				<ThemedButton
					style={styles.button}
					onPress={() => onCreate({
						title: titleValue,
						description: descriptionValue,
					})}
				>
					<Text style={styles.buttonTextCreate}>Create Project</Text>
				</ThemedButton>
			</ThemedView>
		</AppModal>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
	},

	actions: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginTop: 20,
	},

	button: {
		flex: 1,
		paddingVertical: 14,
		paddingHorizontal: 10,
		borderRadius: 8,
		minWidth: 100,
		alignItems: 'center',
		marginHorizontal: 5,
	},

	cancel: {
		backgroundColor: 'white',
		borderWidth: 0.5,
		borderColor: 'grey',
	},

	buttonTextCancel: {
		color: 'black',
		fontWeight: 'bold',
	},

	buttonTextCreate: {
		color: 'white',
		fontWeight: 'bold',
	},
});
