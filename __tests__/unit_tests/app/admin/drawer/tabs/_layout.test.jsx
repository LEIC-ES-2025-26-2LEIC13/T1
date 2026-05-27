import React from 'react';
import { render } from '@testing-library/react-native';
import AdminTabsLayout from '../../../../../../app/(admin)/(drawer)/(tabs)/_layout';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    __esModule: true,
    default: jest.fn(() => 'light'),
}));

jest.mock('../../../../../../constants/Colors', () => ({
    Colors: {
        light: {
            navBackground: '#ffffff',
            iconColor: '#888888',
            iconColorFocused: '#000000',
            text: '#000000',
            title: '#111111',
            borders: '#cccccc',
        },
        dark: {
            navBackground: '#111111',
            iconColor: '#aaaaaa',
            iconColorFocused: '#ffffff',
            text: '#ffffff',
            title: '#eeeeee',
            borders: '#333333',
        },
    },
}));

jest.mock('../../../../../../constants/navigationStyles', () => ({
    commonHeaderOptions: jest.fn((theme) => ({
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.text,
    })),
}));

jest.mock('../../../../../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return ({ name, color, size, testID }) => (
        <View testID={testID ?? `icon-${name}`} />
    );
});

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(() => ({ bottom: 0, top: 0, left: 0, right: 0 })),
}));

jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');

    const screenConfigs = [];

    const Screen = ({ name, options }) => {
        screenConfigs.push({ name, options });
        return null;
    };

    const Tabs = ({ children, screenOptions }) => {
        Tabs.__lastScreenOptions = screenOptions;
        return (
            <View testID="tabs-root">
                {children}
            </View>
        );
    };
    Tabs.Screen = Screen;
    Tabs.__screenConfigs = screenConfigs;
    Tabs.__lastScreenOptions = null;

    return { Tabs };
});

// ── Helpers ────────────────────────────────────────────────────────────────

const getTabsMock = () => require('expo-router').Tabs;

const resetMocks = () => {
    const { Tabs } = require('expo-router');
    Tabs.__screenConfigs.length = 0;
    Tabs.__lastScreenOptions = null;
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AdminTabsLayout — unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMocks();
        const { useSafeAreaInsets } = require('react-native-safe-area-context');
        useSafeAreaInsets.mockReturnValue({ bottom: 0, top: 0, left: 0, right: 0 });
        const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
        useColorScheme.mockReturnValue('light');
    });

    describe('Rendering', () => {
        it('renders without crashing', () => {
            expect(() => render(<AdminTabsLayout />)).not.toThrow();
        });

        it('renders the Tabs root', () => {
            const { getByTestId } = render(<AdminTabsLayout />);
            expect(getByTestId('tabs-root')).toBeTruthy();
        });
    });

    describe('Theme selection', () => {
        it('applies light theme when colorScheme is light', () => {
            const { commonHeaderOptions } = require('../../../../../../constants/navigationStyles');
            const { Colors } = require('../../../../../../constants/Colors');

            render(<AdminTabsLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.light, false);
        });

        it('applies dark theme when colorScheme is dark', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('dark');
            const { commonHeaderOptions } = require('../../../../../../constants/navigationStyles');
            const { Colors } = require('../../../../../../constants/Colors');

            render(<AdminTabsLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.dark, false);
        });

        it('falls back to Colors.light when colorScheme is null', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue(null);
            const { commonHeaderOptions } = require('../../../../../../constants/navigationStyles');
            const { Colors } = require('../../../../../../constants/Colors');

            render(<AdminTabsLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.light, false);
        });

        it('falls back to Colors.light when colorScheme is undefined', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue(undefined);
            const { commonHeaderOptions } = require('../../../../../../constants/navigationStyles');
            const { Colors } = require('../../../../../../constants/Colors');

            render(<AdminTabsLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.light, false);
        });
    });

    describe('tabBarStyle — insets and padding', () => {
        it('uses Math.max(0, 10) = 10 for paddingBottom when insets.bottom is 0', () => {
            const { useSafeAreaInsets } = require('react-native-safe-area-context');
            useSafeAreaInsets.mockReturnValue({ bottom: 0 });
            render(<AdminTabsLayout />);

            const { Tabs } = require('expo-router');
            expect(Tabs.__lastScreenOptions.tabBarStyle.paddingBottom).toBe(10);
            expect(Tabs.__lastScreenOptions.tabBarStyle.height).toBe(80);
        });

        it('uses insets.bottom when it exceeds 10', () => {
            const { useSafeAreaInsets } = require('react-native-safe-area-context');
            useSafeAreaInsets.mockReturnValue({ bottom: 34 });
            render(<AdminTabsLayout />);

            const { Tabs } = require('expo-router');
            expect(Tabs.__lastScreenOptions.tabBarStyle.paddingBottom).toBe(34);
            expect(Tabs.__lastScreenOptions.tabBarStyle.height).toBe(104);
        });

        it('uses exactly 10 when insets.bottom equals 10', () => {
            const { useSafeAreaInsets } = require('react-native-safe-area-context');
            useSafeAreaInsets.mockReturnValue({ bottom: 10 });
            render(<AdminTabsLayout />);

            const { Tabs } = require('expo-router');
            expect(Tabs.__lastScreenOptions.tabBarStyle.paddingBottom).toBe(10);
            expect(Tabs.__lastScreenOptions.tabBarStyle.height).toBe(80);
        });

        it('sets paddingTop to 10', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            expect(Tabs.__lastScreenOptions.tabBarStyle.paddingTop).toBe(10);
        });

        it('sets tabBarStyle backgroundColor from theme.navBackground', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const { Colors } = require('../../../../../../constants/Colors');
            expect(Tabs.__lastScreenOptions.tabBarStyle.backgroundColor).toBe(Colors.light.navBackground);
        });
    });

    describe('tabBar tint colors', () => {
        it('sets tabBarActiveTintColor from theme.iconColorFocused (light)', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const { Colors } = require('../../../../../../constants/Colors');
            expect(Tabs.__lastScreenOptions.tabBarActiveTintColor).toBe(Colors.light.iconColorFocused);
        });

        it('sets tabBarInactiveTintColor from theme.iconColor (light)', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const { Colors } = require('../../../../../../constants/Colors');
            expect(Tabs.__lastScreenOptions.tabBarInactiveTintColor).toBe(Colors.light.iconColor);
        });

        it('sets tabBarActiveTintColor from theme.iconColorFocused (dark)', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('dark');
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const { Colors } = require('../../../../../../constants/Colors');
            expect(Tabs.__lastScreenOptions.tabBarActiveTintColor).toBe(Colors.dark.iconColorFocused);
        });
    });

    describe('Screen options — admin screen', () => {
        it('registers a screen named "admin"', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');
            expect(adminScreen).toBeTruthy();
        });

        it('sets title to "Admin"', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');
            expect(adminScreen.options.title).toBe('Admin');
        });

        it('renders focused shield-account icon when focused is true', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');
            const { getByTestId } = render(
                adminScreen.options.tabBarIcon({ focused: true })
            );
            expect(getByTestId('icon-shield-account')).toBeTruthy();
        });

        it('renders unfocused shield-account-outline icon when focused is false', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');
            const { getByTestId } = render(
                adminScreen.options.tabBarIcon({ focused: false })
            );
            expect(getByTestId('icon-shield-account-outline')).toBeTruthy();
        });

        it('passes iconColorFocused color when focused is true', () => {
            const { Colors } = require('../../../../../../constants/Colors');
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');

            // Render icon and check the rendered node receives focused color
            // We verify by re-rendering the icon JSX — the mock stores name as testID
            const iconEl = adminScreen.options.tabBarIcon({ focused: true });
            expect(iconEl.props.color).toBe(Colors.light.iconColorFocused);
        });

        it('passes iconColor when focused is false', () => {
            const { Colors } = require('../../../../../../constants/Colors');
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');

            const iconEl = adminScreen.options.tabBarIcon({ focused: false });
            expect(iconEl.props.color).toBe(Colors.light.iconColor);
        });

        it('passes size 25 to the tab icon', () => {
            render(<AdminTabsLayout />);
            const { Tabs } = require('expo-router');
            const adminScreen = Tabs.__screenConfigs.find((s) => s.name === 'admin');

            const iconEl = adminScreen.options.tabBarIcon({ focused: true });
            expect(iconEl.props.size).toBe(25);
        });
    });
});
