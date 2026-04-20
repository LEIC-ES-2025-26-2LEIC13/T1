import { useContext } from 'react';
import { InviteContext } from '../contexts/inviteContext';

export function useInvite() {
  const context = useContext(InviteContext);

  if (!context) {
    throw new Error('useInvite must be used within an InviteProvider');
  }

  return context;
}