import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { jest, describe, it, expect, beforeEach } from '@jest/globals'; // ← mover para ANTES dos mocks
import SafeAreaPage from '../../../components/SafeAreaPage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Fix ESM errors
jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/firestore', () => ({}));
jest.mock('../../../firebase/firebaseConfig', () => ({}));

jest.mock('react-native-safe-area-context', () => {
    // Usar require dentro da factory para garantir acesso ao jest
    const { jest } = require('@jest/globals');
    return {
        useSafeAreaInsets: jest.fn(),
    };
});

jest.mock('../../../components/ThemedView', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        __esModule: true,
        default: ({ children, style, ...props }) => (
            <View testID="themed-view" style={style} {...props}>
                {children}
            </View>
        ),
    };
});

describe('SafeAreaPage — unit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 0, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage />);
        expect(screen.getByTestId('themed-view')).toBeTruthy();
    });

    it('renders children inside ThemedView', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 0, top: 0, left: 0, right: 0 });
        render(
            <SafeAreaPage>
                <Text testID="child">Hello</Text>
            </SafeAreaPage>
        );
        expect(screen.getByTestId('child')).toBeTruthy();
    });

    it('applies paddingBottom of 10 when insets.bottom is 0', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 0, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage />);
        const view = screen.getByTestId('themed-view');
        const flatStyle = Array.isArray(view.props.style)
            ? Object.assign({}, ...view.props.style)
            : view.props.style;
        expect(flatStyle.paddingBottom).toBe(10);
    });

    it('applies paddingBottom of 10 when insets.bottom is less than 10', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 5, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage />);
        const view = screen.getByTestId('themed-view');
        const flatStyle = Array.isArray(view.props.style)
            ? Object.assign({}, ...view.props.style)
            : view.props.style;
        expect(flatStyle.paddingBottom).toBe(10);
    });

    it('applies paddingBottom equal to insets.bottom when it exceeds 10', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 34, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage />);
        const view = screen.getByTestId('themed-view');
        const flatStyle = Array.isArray(view.props.style)
            ? Object.assign({}, ...view.props.style)
            : view.props.style;
        expect(flatStyle.paddingBottom).toBe(34);
    });

    it('applies paddingBottom of 10 when insets.bottom is exactly 10', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 10, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage />);
        const view = screen.getByTestId('themed-view');
        const flatStyle = Array.isArray(view.props.style)
            ? Object.assign({}, ...view.props.style)
            : view.props.style;
        expect(flatStyle.paddingBottom).toBe(10);
    });

    it('always applies flex: 1', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 20, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage />);
        const view = screen.getByTestId('themed-view');
        const flatStyle = Array.isArray(view.props.style)
            ? Object.assign({}, ...view.props.style)
            : view.props.style;
        expect(flatStyle.flex).toBe(1);
    });

    it('merges a custom style prop with the base styles', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 0, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage style={{ backgroundColor: 'red' }} />);
        const view = screen.getByTestId('themed-view');
        const flatStyle = Array.isArray(view.props.style)
            ? Object.assign({}, ...view.props.style)
            : view.props.style;
        expect(flatStyle.backgroundColor).toBe('red');
        expect(flatStyle.flex).toBe(1);
    });

    it('custom style prop does not override paddingBottom', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 34, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage style={{ paddingBottom: 0 }} />);
        const view = screen.getByTestId('themed-view');
        const styles = view.props.style;
        expect(styles[0].paddingBottom).toBe(34);
        expect(styles[1].paddingBottom).toBe(0);
    });

    it('passes extra props through to ThemedView', () => {
        useSafeAreaInsets.mockReturnValue({ bottom: 0, top: 0, left: 0, right: 0 });
        render(<SafeAreaPage accessibilityLabel="page-container" />);
        expect(screen.getByTestId('themed-view').props.accessibilityLabel).toBe('page-container');
    });
});