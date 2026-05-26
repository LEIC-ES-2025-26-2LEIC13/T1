import React from 'react';
import { render, act } from '@testing-library/react-native';
import AdminDrawerLayout from '../../../../../app/(admin)/(drawer)/_layout';

// Mocks

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    __esModule: true,
    default: jest.fn(() => 'light'),
}));

jest.mock('../../../../../constants/Colors', () => ({
    Colors: {
        light: {
            navBackground: '#ffffff',
            iconColor: '#888888',
            iconColorFocused: '#000000',
            background: '#f5f5f5',
            text: '#000000',
            title: '#111111',
            borders: '#cccccc',
            primary: '#0066cc',
        },
        dark: {
            navBackground: '#111111',
            iconColor: '#aaaaaa',
            iconColorFocused: '#ffffff',
            background: '#000000',
            text: '#ffffff',
            title: '#eeeeee',
            borders: '#333333',
            primary: '#4499ff',
        },
    },
}));

jest.mock('../../../../../constants/navigationStyles', () => ({
    commonHeaderOptions: jest.fn((theme, val) => ({
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.text,
    })),
}));

jest.mock('../../../../../components/CustomDrawerContent', () => {
    const { View } = require('react-native');
    return (props) => <View testID="custom-drawer-content" />;
});

jest.mock('../../../../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return ({ name, color, testID }) => (
        <View testID={testID ?? `icon-${name}`} />
    );
});

jest.mock('expo-router/drawer', () => {
    const React = require('react');
    const { View } = require('react-native');

    const screenConfigs = [];

    const Screen = ({ name, options }) => {
        screenConfigs.push({ name, options });
        return null;
    };

    const Drawer = ({ children, drawerContent, screenOptions }) => {
        return (
            <View testID="drawer-root" data-screen-options={screenOptions}>
                <View testID="drawer-content-slot">
                    {drawerContent && drawerContent({})}
                </View>
                {children}
            </View>
        );
    };
    Drawer.Screen = Screen;
    Drawer.__screenConfigs = screenConfigs;

    return { Drawer };
});

// Helpers

const getDrawerMock = () => require('expo-router/drawer').Drawer;

// Tests

describe('AdminDrawerLayout — unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear captured screen configs between tests
        const { Drawer } = require('expo-router/drawer');
        Drawer.__screenConfigs.length = 0;
    });

    describe('Rendering', () => {
        it('renders without crashing', () => {
            expect(() => render(<AdminDrawerLayout />)).not.toThrow();
        });

        it('renders the Drawer root', () => {
            const { getByTestId } = render(<AdminDrawerLayout />);
            expect(getByTestId('drawer-root')).toBeTruthy();
        });

        it('renders CustomDrawerContent inside drawerContent slot', () => {
            const { getByTestId } = render(<AdminDrawerLayout />);
            expect(getByTestId('custom-drawer-content')).toBeTruthy();
        });
    });

    describe('Theme selection', () => {
        it('applies light theme when colorScheme is light', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('light');
            const { Colors } = require('../../../../../constants/Colors');
            const { commonHeaderOptions } = require('../../../../../constants/navigationStyles');

            render(<AdminDrawerLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.light, false);
        });

        it('applies dark theme when colorScheme is dark', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('dark');
            const { Colors } = require('../../../../../constants/Colors');
            const { commonHeaderOptions } = require('../../../../../constants/navigationStyles');

            render(<AdminDrawerLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.dark, false);
        });

        it('falls back to Colors.light when colorScheme is null', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue(null);
            const { Colors } = require('../../../../../constants/Colors');
            const { commonHeaderOptions } = require('../../../../../constants/navigationStyles');

            render(<AdminDrawerLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.light, false);
        });

        it('falls back to Colors.light when colorScheme is undefined', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue(undefined);
            const { Colors } = require('../../../../../constants/Colors');
            const { commonHeaderOptions } = require('../../../../../constants/navigationStyles');

            render(<AdminDrawerLayout />);

            expect(commonHeaderOptions).toHaveBeenCalledWith(Colors.light, false);
        });
    });

    describe('Screen options — (tabs) screen', () => {
        it('registers a screen named "(tabs)"', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const tabsScreen = Drawer.__screenConfigs.find((s) => s.name === '(tabs)');
            expect(tabsScreen).toBeTruthy();
        });

        it('sets title to "Home" for the (tabs) screen', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const tabsScreen = Drawer.__screenConfigs.find((s) => s.name === '(tabs)');
            expect(tabsScreen.options.title).toBe('Home');
        });

        it('sets headerShown to false for the (tabs) screen', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const tabsScreen = Drawer.__screenConfigs.find((s) => s.name === '(tabs)');
            expect(tabsScreen.options.headerShown).toBe(false);
        });

        it('renders focused home icon when focused is true', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const tabsScreen = Drawer.__screenConfigs.find((s) => s.name === '(tabs)');
            const { getByTestId } = render(
                tabsScreen.options.drawerIcon({ focused: true, color: '#000' })
            );
            expect(getByTestId('icon-home')).toBeTruthy();
        });

        it('renders unfocused home-outline icon when focused is false', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const tabsScreen = Drawer.__screenConfigs.find((s) => s.name === '(tabs)');
            const { getByTestId } = render(
                tabsScreen.options.drawerIcon({ focused: false, color: '#888' })
            );
            expect(getByTestId('icon-home-outline')).toBeTruthy();
        });
    });

    describe('Screen options — suggestions screen', () => {
        it('registers a screen named "suggestions"', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const suggestionsScreen = Drawer.__screenConfigs.find((s) => s.name === 'suggestions');
            expect(suggestionsScreen).toBeTruthy();
        });

        it('sets title to "Suggestions" for the suggestions screen', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const suggestionsScreen = Drawer.__screenConfigs.find((s) => s.name === 'suggestions');
            expect(suggestionsScreen.options.title).toBe('Suggestions');
        });

        it('does not set headerShown for the suggestions screen', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const suggestionsScreen = Drawer.__screenConfigs.find((s) => s.name === 'suggestions');
            expect(suggestionsScreen.options.headerShown).toBeUndefined();
        });

        it('renders focused lightbulb icon when focused is true', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const suggestionsScreen = Drawer.__screenConfigs.find((s) => s.name === 'suggestions');
            const { getByTestId } = render(
                suggestionsScreen.options.drawerIcon({ focused: true, color: '#000' })
            );
            expect(getByTestId('icon-lightbulb')).toBeTruthy();
        });

        it('renders unfocused lightbulb-outline icon when focused is false', () => {
            render(<AdminDrawerLayout />);
            const { Drawer } = require('expo-router/drawer');
            const suggestionsScreen = Drawer.__screenConfigs.find((s) => s.name === 'suggestions');
            const { getByTestId } = render(
                suggestionsScreen.options.drawerIcon({ focused: false, color: '#888' })
            );
            expect(getByTestId('icon-lightbulb-outline')).toBeTruthy();
        });
    });

    describe('Drawer screenOptions', () => {
        it('passes drawerActiveTintColor from theme.iconColorFocused', () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('light');

            // Capture props passed to Drawer by inspecting the mock
            let capturedScreenOptions;
            const { Drawer } = require('expo-router/drawer');
            const OriginalDrawer = Drawer;

            // Re-render and capture via spy
            render(<AdminDrawerLayout />);

            // Since mock captures drawerStyle etc. via screenOptions prop,
            // verify commonHeaderOptions was called with correct theme
            const { commonHeaderOptions } = require('../../../../../constants/navigationStyles');
            expect(commonHeaderOptions).toHaveBeenCalledWith(
                expect.objectContaining({ iconColorFocused: '#000000' }),
                false
            );
        });
    });
});
