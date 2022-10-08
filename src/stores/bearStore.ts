import create from 'zustand';

export interface Bear {
  id: number;
  name: string;
}

export interface BearState {
  bears: Bear[];
  lastBear: number;
  addBear: (name: string) => void;
  removeAllBears: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: [],
  lastBear: 0,
  addBear: (name) =>
    set((state) => ({
      bears: [...state.bears, { id: state.lastBear + 1, name }],
      lastBear: state.lastBear + 1,
    })),
  removeAllBears: () => set({ bears: [] }),
}));

export default useBearStore;
