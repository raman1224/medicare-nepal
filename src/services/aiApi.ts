// src/services/aiApi.ts
import axios from "axios";

const AI_BACKEND_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:5001";

export type SymptomRequestPayload = {
  language: string;
  age: number;
  gender: string;
  height_cm?: number;
  weight_kg?: number;
  symptoms: string[];
  temperature?: { value: number; unit: "C" | "F" } | null;
  duration_days: number;
  allergies?: string[];
  medical_history?: string[];
  pregnancy_status?: string;
  location?: string;
  other_feelings?: string[];
  selected_medicines?: string[];
};

export const analyzeSymptoms = async (payload: SymptomRequestPayload, idToken?: string) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

    const res = await axios.post(`${AI_BACKEND_URL}/analyze-symptoms`, payload, {
      headers,
      timeout: 30000,
    });

    return res.data;
  } catch (err: any) {
    // normalize error
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message || "AI backend error";
    throw new Error(message);
  }
};
