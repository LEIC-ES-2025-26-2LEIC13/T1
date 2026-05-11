import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react-native';
import { useContext } from 'react';
import { Text, Pressable } from 'react-native';
import { InviteContext, InviteProvider } from '../../../contexts/inviteContext';
import { inviteService } from '../../../api/inviteService';
import { useAuth } from '../../../hooks/useAuth';

jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/firestore', () => ({}));
jest.mock('../../../firebase/firebaseConfig', () => ({}));
jest.mock('../../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../../api/inviteService', () => ({
    inviteService: {
        subscribeToUserInvites: jest.fn(),
        sendInvite: jest.fn(),
        acceptInvite: jest.fn(),
        ignoreInvite: jest.fn(),
    },
}));

const MOCK_USER = { uid: 'user-123', email: 'user@example.com' };
const MOCK_INVITES = [
    { id: 'invite-1', projectId: 'proj-1', projectName: 'Alpha' },
    { id: 'invite-2', projectId: 'proj-2', projectName: 'Beta' },
];

function TestConsumer() {
    const ctx = useContext(InviteContext);
    return (
        <>
            <Text testID="invites-count">{ctx.invites.length}</Text>
            <Text testID="has-new-invites">{String(ctx.hasNewInvites)}</Text>
            <Pressable testID="send-invite"   onPress={() => ctx.sendInvite({ projectId: 'p1', receiverId: 'r1' })} />
            <Pressable testID="accept-invite" onPress={() => ctx.acceptInvite({ id: 'invite-1' })} />
            <Pressable testID="ignore-invite" onPress={() => ctx.ignoreInvite({ id: 'invite-1' })} />
            <Pressable testID="clear-new"     onPress={() => ctx.setHasNewInvites(false)} />
        </>
    );
}

const renderProvider = () => render(<InviteProvider><TestConsumer /></InviteProvider>);

// Calls the subscription callback immediately and returns the mock unsubscribe fn
function mockSubscription(invites = []) {
    const unsubscribe = jest.fn();
    inviteService.subscribeToUserInvites.mockImplementation((_uid, cb) => {
        cb(invites);
        return unsubscribe;
    });
    return unsubscribe;
}

beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: MOCK_USER });
});

// ── Subscription lifecycle ────────────────────────────────────────────────────
describe('subscription lifecycle', () => {
    it('subscribes with the correct uid on mount', async () => {
        mockSubscription();
        renderProvider();
        await waitFor(() => {
            expect(inviteService.subscribeToUserInvites).toHaveBeenCalledWith('user-123', expect.any(Function));
        });
    });

    it('skips subscription and shows empty list when user is null', async () => {
        useAuth.mockReturnValue({ user: null });
        renderProvider();
        await waitFor(() => {
            expect(inviteService.subscribeToUserInvites).not.toHaveBeenCalled();
            expect(screen.getByTestId('invites-count').props.children).toBe(0);
        });
    });

    it('calls unsubscribe on unmount', () => {
        const unsubscribe = mockSubscription();
        const { unmount } = renderProvider();
        unmount();
        expect(unsubscribe).toHaveBeenCalled();
    });

    it('re-subscribes with new uid when user changes, tearing down the old subscription', async () => {
        const unsubscribeFirst = mockSubscription();
        const { rerender } = renderProvider();

        useAuth.mockReturnValue({ user: { uid: 'user-456', email: 'other@example.com' } });
        await act(async () => rerender(<InviteProvider><TestConsumer /></InviteProvider>));

        await waitFor(() => {
            expect(unsubscribeFirst).toHaveBeenCalled();
            expect(inviteService.subscribeToUserInvites).toHaveBeenCalledWith('user-456', expect.any(Function));
        });
    });
});

// ── Invites state & hasNewInvites ─────────────────────────────────────────────
describe('invites state', () => {
    it('exposes fetched invites and starts empty when callback never fires', async () => {
        mockSubscription(MOCK_INVITES);
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('invites-count').props.children).toBe(2));
    });

    it('sets hasNewInvites to true when the incoming list is longer than before', async () => {
        let cb;
        inviteService.subscribeToUserInvites.mockImplementation((_uid, fn) => { cb = fn; fn([MOCK_INVITES[0]]); return jest.fn(); });
        renderProvider();

        await waitFor(() => expect(screen.getByTestId('invites-count').props.children).toBe(1));
        await act(async () => cb(MOCK_INVITES)); // grows: 1 → 2
        await waitFor(() => expect(screen.getByTestId('has-new-invites').props.children).toBe('true'));
    });

    it('setHasNewInvites lets consumers clear the flag', async () => {
        let cb;
        inviteService.subscribeToUserInvites.mockImplementation((_uid, fn) => { cb = fn; fn([MOCK_INVITES[0]]); return jest.fn(); });
        renderProvider();

        await act(async () => cb(MOCK_INVITES)); // trigger hasNewInvites = true
        await waitFor(() => expect(screen.getByTestId('has-new-invites').props.children).toBe('true'));

        fireEvent.press(screen.getByTestId('clear-new'));
        await waitFor(() => expect(screen.getByTestId('has-new-invites').props.children).toBe('false'));
    });
});

// ── Actions ───────────────────────────────────────────────────────────────────
describe('actions', () => {
    beforeEach(() => mockSubscription());

    it('sendInvite delegates to inviteService with correct data', async () => {
        inviteService.sendInvite.mockResolvedValueOnce();
        renderProvider();
        fireEvent.press(screen.getByTestId('send-invite'));
        expect(inviteService.sendInvite).toHaveBeenCalledWith({ projectId: 'p1', receiverId: 'r1' });
    });

    it('acceptInvite passes uid, email, and inviteData to inviteService', async () => {
        inviteService.acceptInvite.mockResolvedValueOnce();
        renderProvider();
        fireEvent.press(screen.getByTestId('accept-invite'));
        expect(inviteService.acceptInvite).toHaveBeenCalledWith('user-123', 'user@example.com', { id: 'invite-1' });
    });

    it('ignoreInvite passes uid and invite id to inviteService', async () => {
        inviteService.ignoreInvite.mockResolvedValueOnce();
        renderProvider();
        fireEvent.press(screen.getByTestId('ignore-invite'));
        expect(inviteService.ignoreInvite).toHaveBeenCalledWith('user-123', 'invite-1');
    });

    it('exposes all expected context keys', async () => {
        let ctx;
        function ContextCapture() { ctx = useContext(InviteContext); return null; }
        render(<InviteProvider><ContextCapture /></InviteProvider>);
        await waitFor(() => expect(ctx).toMatchObject({
            invites: expect.any(Array),
            hasNewInvites: expect.any(Boolean),
            setHasNewInvites: expect.any(Function),
            sendInvite: expect.any(Function),
            acceptInvite: expect.any(Function),
            ignoreInvite: expect.any(Function),
        }));
    });
});