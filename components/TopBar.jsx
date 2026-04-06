import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

// By default the name will be Project
export default function TopBar({ title = 'Project', leftAction, rightAction }) {
	const scheme = useColorScheme();
	const palette = Colors[scheme] ?? Colors.light;

	return (
		<View style={styles.container}>
			<View style={styles.sideAction}>{leftAction}</View>

			<Text style={[styles.title, { color: palette.title }]} numberOfLines={1}>
				{title}
			</Text>

			<View style={styles.sideAction}>{rightAction}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 18,
		paddingHorizontal: 16,
	},
	sideAction: {
		width: 40,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		flex: 1,
		fontSize: 20,
		fontWeight: '700',
		textAlign: 'center',
	},
});
