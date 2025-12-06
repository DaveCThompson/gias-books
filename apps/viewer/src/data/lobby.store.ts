// src/data/stores/lobby.store.ts

import { create } from 'zustand';

interface LobbyState {
    activeBookSlug: string | null;
    openLobby: (slug: string) => void;
    closeLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
    activeBookSlug: null,
    openLobby: (slug) => set({ activeBookSlug: slug }),
    closeLobby: () => set({ activeBookSlug: null }),
}));
