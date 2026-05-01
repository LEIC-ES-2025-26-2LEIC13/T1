import { createContext, useEffect, useMemo, useState } from 'react';
import { inviteService } from '../api/inviteService';
import { useAuth } from '../hooks/useAuth';

export const InviteContext = createContext(null);

export function InviteProvider({ children }) {
	const { user } = useAuth()
	const [ invites, setInvites ] = useState([])
	const [ hasNewInvites, setHasNewInvites ] = useState(false)

	// The use effect creates a listener on the background that updates upon invites query changes
	// Upon component (InviteProvider) deletion or user? change, for example logout, the listener is unsubscribed
	useEffect(() => {
		if (!user?.uid) { // TODO: sometimes user is null when the app opens with cached login session open
			setInvites([]);
			return undefined;
		}
		
		const unsubscribe = inviteService.subscribeToUserInvites(user.uid, (fetchedInvites) => {
			setHasNewInvites(fetchedInvites.length > invites.length);
			setInvites(fetchedInvites);
    	});

		return unsubscribe; // unsubscribe returned by onSnapshot
	}, [user?.uid]); // cannot add invites.length as a dependency, otherwise the callback will be triggered twice


	async function sendInvite(inviteData) {
		await inviteService.sendInvite(inviteData)
  	}

	// id <=> inviteId
	async function acceptInvite(inviteData) {
		await inviteService.acceptInvite(user.uid, user.email, inviteData)
  	}


  	async function ignoreInvite({ id }) {
		await inviteService.ignoreInvite(user.uid, id)
 	}

	const value = useMemo(() => ({
		invites,
		hasNewInvites,
		setHasNewInvites,
		sendInvite,
		acceptInvite,
		ignoreInvite
	}), [invites, hasNewInvites]);

	return (
		<InviteContext.Provider value={value}>
		{children}
		</InviteContext.Provider>
	);
}
