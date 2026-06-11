import { create } from 'zustand';

export type SectionId = 'projects' | 'experience' | 'skills' | 'contact';

interface SiteState {
  /** Which overlay panel is open (null = none) */
  activeSection: SectionId | null;
  /** Currently engaged gear — mirrors the 3D knob ('N','1'–'6','R') */
  gear: string;
  openSection: (id: SectionId, gear: string) => void;
  /** Closes any open panel and returns the knob to Neutral */
  closeSection: () => void;
  setGear: (g: string) => void;
}

// Works on both sides of the R3F renderer boundary: React components
// subscribe via the hook; useFrame code reads useSiteStore.getState().
export const useSiteStore = create<SiteState>((set) => ({
  activeSection: null,
  gear: 'N',
  openSection: (id, gear) => set({ activeSection: id, gear }),
  closeSection: () => set({ activeSection: null, gear: 'N' }),
  setGear: (g) => set({ gear: g }),
}));

// Dev-only handle for smoke tests / console debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__siteStore = useSiteStore;
}
