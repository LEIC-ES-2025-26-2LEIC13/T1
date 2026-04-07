import { render, screen, fireEvent } from '@testing-library/react-native';
import Project from '../../app/project';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    canGoBack: () => true,
    back: jest.fn(),
    replace: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

describe('project', () => {
  test('Create tasks', () => {
    render(<Project />);

    fireEvent.press(screen.getByText('Create Task'));
    fireEvent.changeText(screen.getByPlaceholderText('Enter task name'), 'My task');
    fireEvent.press(screen.getAllByText('Create Task')[1]);

    expect(screen.getByText('My task')).toBeTruthy();
  });
});