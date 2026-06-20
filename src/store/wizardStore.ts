"use client";

import { create } from "zustand";

import { ADMIN_EMAIL, isAdmin } from "@/lib/admin";
import { hasPublicSupabaseEnv } from "@/lib/env";
import type { NearbyLabelSelection, WizardFormData } from "@/types";

type WizardState = {
  currentStep: number;
  adminSessionBypass: boolean;
  data: WizardFormData;
  setStep: (step: number) => void;
  patchData: (data: Partial<WizardFormData>) => void;
  setNearbyLabels: (labels: NearbyLabelSelection[]) => void;
  toggleNearbyLabel: (label: NearbyLabelSelection) => void;
  addCustomLabel: (label: string) => void;
  removeNearbyLabel: (id: string) => void;
  reset: () => void;
};

const initialData: WizardFormData = {
  adaNo: "",
  parselNo: "",
  il: "",
  ilce: "",
  coordinates: undefined,
  neighborhoodSummary: "",
  validatedLocation: false,
  uploadedGeojson: undefined,
  geojsonFileName: "",
  geojsonFeatureCount: 0,
  nearbyPlaces: [],
  valueScore: undefined,
  shootType: "DRONE",
  estimatedCredits: 1,
  logoUrl: "",
  logoName: "",
  phoneNumber: "",
  brandColor: "#1E3A8A",
  voiceoverText: "",
  nearbyLabels: [],
  customLabels: [],
  cardNumber: "",
  expiry: "",
  cvv: "",
  needsPayment: false,
  orderAmount: 399
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  adminSessionBypass: !hasPublicSupabaseEnv() && isAdmin(ADMIN_EMAIL),
  data: initialData,
  setStep: (currentStep) => set({ currentStep }),
  patchData: (data) =>
    set((state) => ({
      data: {
        ...state.data,
        ...data
      }
    })),
  setNearbyLabels: (labels) =>
    set((state) => ({
      data: {
        ...state.data,
        nearbyLabels: labels
      }
    })),
  toggleNearbyLabel: (label) =>
    set((state) => {
      const exists = state.data.nearbyLabels.some((item) => item.id === label.id);
      const next = exists
        ? state.data.nearbyLabels.filter((item) => item.id !== label.id)
        : state.data.nearbyLabels.length >= 10
          ? state.data.nearbyLabels
          : [...state.data.nearbyLabels, label];

      return {
        data: {
          ...state.data,
          nearbyLabels: next
        }
      };
    }),
  addCustomLabel: (label) =>
    set((state) => {
      const normalized = label.trim();
      if (!normalized) return state;

      const customLabel: NearbyLabelSelection = {
        id: `custom-${normalized.toLocaleLowerCase("tr-TR")}`,
        name: normalized,
        distanceMeters: 0,
        category: "Alışveriş",
        typeLabel: "Özel Etiket",
        custom: true
      };

      const exists = state.data.nearbyLabels.some((item) => item.id === customLabel.id);
      if (exists || state.data.nearbyLabels.length >= 10) {
        return state;
      }

      return {
        data: {
          ...state.data,
          customLabels: Array.from(new Set([...state.data.customLabels, normalized])),
          nearbyLabels: [...state.data.nearbyLabels, customLabel]
        }
      };
    }),
  removeNearbyLabel: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        nearbyLabels: state.data.nearbyLabels.filter((item) => item.id !== id)
      }
    })),
  reset: () =>
    set({
      currentStep: 1,
      adminSessionBypass: !hasPublicSupabaseEnv() && isAdmin(ADMIN_EMAIL),
      data: initialData
    })
}));
