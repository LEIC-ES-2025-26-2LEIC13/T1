import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedView from './ThemedView';

// A wrapper component that applies safe area insets to ensure content is not obscured by device notches, home indicators, or other screen features.
export default function SafeAreaPage({ style, children, ...props }) {
    const insets = useSafeAreaInsets();

    return (
        <ThemedView
            style={[
                {
                    flex: 1,
                    paddingBottom: Math.max(insets.bottom, 10),
                },
                style
            ]}
            {...props}
        >
            {children}
        </ThemedView>
    );
}
