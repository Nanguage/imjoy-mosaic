import { create } from 'zustand'

interface State {
  title: string,
  windowId2name: Record<number, string>,
  setWindowId2name: (id: number, name: string) => void,
}


export const useStore = create<State>()((set) => ({
  title: "Imjoy Mosic",
  windowId2name: {},
  setWindowId2name: (id, name) => set((state) => ({windowId2name: {...state.windowId2name, [id]: name}})),
}))
