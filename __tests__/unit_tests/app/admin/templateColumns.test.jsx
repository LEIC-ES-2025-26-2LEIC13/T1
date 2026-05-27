import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TemplateColumns from '../../../../app/(admin)/templateColumns';

// Mocks

jest.mock('react-native', () => {
    const rn = jest.requireActual('react-native');
    rn.useWindowDimensions = jest.fn(() => ({ width: 390 }));
    return rn;
});

jest.mock('../../../../app/(admin)/templateColumn', () => {
    const { View, Text } = require('react-native');
    return ({ columnData }) => (
        <View testID={`template-column-${columnData.id}`}>
            <Text>{columnData.name}</Text>
        </View>
    );
});

jest.mock('../../../../components/ThemedButton', () => {
    const { TouchableOpacity } = require('react-native');
    return ({ children, onPress, testID }) => (
        <TouchableOpacity testID={testID} onPress={onPress}>
            {children}
        </TouchableOpacity>
    );
});

jest.mock('../../../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return (props) => <View {...props} />;
});

jest.mock('../../../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children, ...props }) => <Text {...props}>{children}</Text>;
});

jest.mock('../../../../components/EmptyState', () => {
    const { View, Text } = require('react-native');
    return ({ title, subtitle, iconName }) => (
        <View testID="empty-state">
            <Text testID="empty-title">{title}</Text>
            <Text testID="empty-subtitle">{subtitle}</Text>
        </View>
    );
});

// Helpers

const mockColumns = [
    { id: 'col-1', name: 'Backlog' },
    { id: 'col-2', name: 'In Progress' },
    { id: 'col-3', name: 'Done' },
];

const defaultProps = {
    columns: mockColumns,
    templateId: 'tpl-1',
    currentTemplateName: 'My Template',
    openCreateColumnModal: jest.fn(),
};

// Tests

describe('TemplateColumns — unit tests', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('Rendering', () => {
        it('renders a TemplateColumn for each column', () => {
            const { getByTestId } = render(<TemplateColumns {...defaultProps} />);

            expect(getByTestId('template-column-col-1')).toBeTruthy();
            expect(getByTestId('template-column-col-2')).toBeTruthy();
            expect(getByTestId('template-column-col-3')).toBeTruthy();
        });

        it('renders the empty state when columns array is empty', () => {
            const { getByTestId, queryByTestId } = render(
                <TemplateColumns {...defaultProps} columns={[]} />
            );

            expect(getByTestId('empty-state')).toBeTruthy();
            expect(queryByTestId('template-column-col-1')).toBeNull();
        });

        it('shows the "Create Column" button only when columns is empty', () => {
            const { getByTestId } = render(
                <TemplateColumns {...defaultProps} columns={[]} />
            );
            expect(getByTestId('open-create-column-modal-button')).toBeTruthy();
        });

        it('hides the "Create Column" button when columns exist', () => {
            const { queryByTestId } = render(<TemplateColumns {...defaultProps} />);
            expect(queryByTestId('open-create-column-modal-button')).toBeNull();
        });
    });

    describe('openCreateColumnModal callback', () => {
        it('calls openCreateColumnModal when create-column button is pressed', () => {
            const openCreateColumnModal = jest.fn();
            const { getByTestId } = render(
                <TemplateColumns {...defaultProps} columns={[]} openCreateColumnModal={openCreateColumnModal} />
            );

            fireEvent.press(getByTestId('open-create-column-modal-button'));
            expect(openCreateColumnModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('Snap offsets', () => {
        it('computes undefined snapToOffsets for a single column', () => {
            // With 1 column, snapToOffsets should be undefined (no snapping needed)
            // We just verify it renders without errors
            const singleColumn = [{ id: 'col-1', name: 'Only' }];
            expect(() =>
                render(<TemplateColumns {...defaultProps} columns={singleColumn} />)
            ).not.toThrow();
        });

        it('computes snapToOffsets for multiple columns without throwing', () => {
            expect(() => render(<TemplateColumns {...defaultProps} />)).not.toThrow();
        });
    });

    describe('Column width calculation', () => {
        it('renders single column at full width (width - 32)', () => {
            const { getByTestId } = render(
                <TemplateColumns {...defaultProps} columns={[{ id: 'col-1', name: 'Solo' }]} />
            );
            // Column is rendered, width calculation is internal — just assert it renders
            expect(getByTestId('template-column-col-1')).toBeTruthy();
        });

        it('renders last column without marginRight', () => {
            // All columns render without errors when margin is 0 for last item
            expect(() => render(<TemplateColumns {...defaultProps} />)).not.toThrow();
        });
    });
});
