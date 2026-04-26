import { renderHook, waitFor} from "@testing-library/react-native";
import { getDocs, onSnapshot, query, where, addDoc, collection } from "firebase/firestore";
import { InviteProvider } from "../../../contexts/inviteContext";
import {useInvite} from "../../../hooks/useInvite";
import { db } from "../../../firebase/firebaseConfig";


// Mock functions and database
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(() => 'invites'), // The name is irrelevant because the collection is itself mocked
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../firebase/firebaseConfig', () => ({
  db: {},
}))

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'user1' }, // User must not be null, to bypass the first check
  }),
}));

describe('InviteContext', () => {
    // Clear mocks before each test
    beforeEach(() => {
        jest.resetAllMocks()
    })

    test('loads invites from Firestore', async () => {
        // Create a mock user that will be recieving the invite
        const mockUser = { uid: 'user1' };
        // The listener will only check the callback
        const mockInvites = [
            {
                id: 'invite1',
                data: () => ({ receiverId: 'user1', projectId: 'project1' }),
            },
        ];
        onSnapshot.mockImplementation((ref, callback) => {
            callback({ docs: mockInvites });
            return jest.fn();
        });

        const wrapper = ({ children }) => (
            <InviteProvider>
                {children}
            </InviteProvider>
        );

        const { result } = renderHook(() => useInvite(), { wrapper });

        // Check for length
        // waitFor is needed becaus the state update is itself async
        await waitFor(() => {
            expect(result.current.invites).toHaveLength(1);
        });

        // Check for content
        expect(result.current.invites[0]).toEqual({
            id: 'invite1',
            receiverId: 'user1',
            projectId: 'project1',
        });
    })

    test('does not load invites if user is not logged in', async () => {
        // Mock useAuth to return null user, to simulate a user that is not logged in 
        jest.mock('../../../hooks/useAuth', () => ({
            useAuth: () => ({
                user: { uid: null },
            }),
        }))

        const wrapper = ({ children }) => (
            <InviteProvider>
                {children}
            </InviteProvider>
        );

        const { result } = renderHook(() => useInvite(), { wrapper });

        
        // Check that invites is empty
        await waitFor(() => {
            expect(result.current.invites).toHaveLength(0);
        });

        // Its supposed to have been called once for cleanup of the listener
        expect(onSnapshot).toHaveBeenCalledTimes(1);
    })

    test('sendInvite throws error if invite already exists', async () => {
        // If getDocs contains something, the invite was already done
        // In this case simply consider that getDoc returns something after the query
        getDocs.mockResolvedValueOnce(
            { empty: false}
        )

        const wrapper = ({ children }) => (
            <InviteProvider>
                {children}
            </InviteProvider>
        );

        const { result } = renderHook(() => useInvite(), { wrapper });

        // sendingRandom data in this case is not relevant since getDoc was already mocked to return somehting

        expect(result.current.sendInvite({
            receiverId: 'user2',
            projectId: 'project1',
        })).rejects.toThrow('Invite already sent to this user for this project');
    })

    test('sendInvite calls addDoc with correct data', async () => {
        // If getDocs is empty, the invite can be sent
        getDocs.mockResolvedValueOnce(
            { empty: true}
        )

        const wrapper = ({ children }) => (
            <InviteProvider>
                {children}
            </InviteProvider>
        );

        const { result } = renderHook(() => useInvite(), { wrapper });

        const inviteData = {
            receiverId: 'user2',
            projectId: 'project1',
        }

        await result.current.sendInvite(inviteData);

        // Expecting that the database function was called with correct arguments
        expect(addDoc).toHaveBeenCalledWith(
            expect(collection).toHaveBeenCalledWith(db, 'invites'),
            expect.objectContaining({
                ...inviteData,
                createdAt: expect.any(Date),
            })
        )
    })
})