import { create } from 'zustand';

export type SectionId = 'projects' | 'experience' | 'skills' | 'contact';

interface SiteState {
  /** Which overlay panel is open (null = none) */
  activeSection: SectionId | null;
  /** Opened by clicking a garage wall panel in the 3D scene */
  openSection: (id: SectionId) => void;
  closeSection: () => void;
}

// Works on both sides of the R3F renderer boundary: React components
// subscribe via the hook; useFrame code reads useSiteStore.getState().
export const useSiteStore = create<SiteState>((set) => ({
  activeSection: null,
  openSection: (id) => set({ activeSection: id }),
  closeSection: () => set({ activeSection: null }),
}));

// Dev-only handle for smoke tests / console debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__siteStore = useSiteStore;
}
