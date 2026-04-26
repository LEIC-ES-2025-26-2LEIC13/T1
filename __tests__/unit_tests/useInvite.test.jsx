import {renderHook} from '@testing-library/react-native';
import { InviteProvider } from '../../contexts/inviteContext';
import { useInvite } from '../../hooks/useInvite';
import { query, where } from 'firebase/firestore';


jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(() => 'invites'), // The name is irrelevant because the collection is itself mocked
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../../firebase/firebaseConfig', () => ({
  db: {},
}))

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }, // Mocked user with a uid
  }),
}))

describe('useInvite', () => {
  test('throws when used outside InviteProvider', () => {
    expect(() => renderHook(() => useInvite())).toThrow(
      'useInvite must be used within an InviteProvider'
    )
  })

  test('returns context value when used inside InviteProvider', () => {
    const wrapper = ({ children }) => (
      <InviteProvider>{children}</InviteProvider>
    );

    const { result } = renderHook(() => useInvite(), { wrapper });

    expect(Array.isArray(result.current.invites)).toBe(true)
    expect(typeof result.current.sendInvite).toBe('function')
    expect(typeof result.current.acceptInvite).toBe('function')
  });
});
