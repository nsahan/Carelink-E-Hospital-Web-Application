import * as tf from "@tensorflow/tfjs";
import axios from "axios";

// Intent classification labels
const INTENTS = {
  APPOINTMENT: "appointment",
  MEDICINE: "medicine",
  EMERGENCY: "emergency",
  GENERAL: "general",
  DOCTOR_INFO: "doctor_info",
};

// Preprocess text for ML model
const preprocessText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((word) => word.length > 0);
};

// Data fetching functions
const fetchDoctorsData = async () => {
  try {
    const response = await axios.get("http://localhost:9000/api/doctor/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
};

const fetchMedicinesData = async () => {
  try {
    const response = await axios.get(
      "http://localhost:9000/v1/api/medicines/all"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return [];
  }
};

const enhanceKeywordsWithData = async () => {
  const [doctors, medicines] = await Promise.all([
    fetchDoctorsData(),
    fetchMedicinesData(),
  ]);

  return {
    [INTENTS.APPOINTMENT]: [
      "appointment",
      "book",
      "schedule",
      "visit",
      "consultation",
      ...doctors.map((d) => d.name.toLowerCase()),
      ...doctors.map((d) => d.specialty.toLowerCase()),
    ],
    [INTENTS.MEDICINE]: [
      "medicine",
      "drug",
      "pharmacy",
      "prescription",
      "medication",
      ...medicines.map((m) => m.name.toLowerCase()),
      ...medicines.map((m) => m.category.toLowerCase()),
    ],
    [INTENTS.DOCTOR_INFO]: [
      "doctor",
      "specialist",
      "physician",
      "surgeon",
      "qualification",
      ...doctors.map((d) => d.name.toLowerCase()),
      ...doctors.map((d) => d.specialty.toLowerCase()),
      ...doctors.map((d) => d.degree?.toLowerCase()).filter(Boolean),
    ],
    [INTENTS.EMERGENCY]: ["emergency", "urgent", "immediate", "critical"],
  };
};

const classifyIntent = async (text) => {
  const words = preprocessText(text);
  const dynamicKeywords = await enhanceKeywordsWithData();

  const scores = Object.entries(dynamicKeywords).map(
    ([intent, keywordList]) => {
      const score = words.reduce((acc, word) => {
        const keywordMatch = keywordList.includes(word) ? 1 : 0;
        const partialMatch = keywordList.some(
          (keyword) => keyword.includes(word) || word.includes(keyword)
        )
          ? 0.5
          : 0;
        return acc + keywordMatch + partialMatch;
      }, 0);
      return { intent, score };
    }
  );

  return scores.reduce(
    (max, current) => (current.score > max.score ? current : max),
    { intent: INTENTS.GENERAL, score: 0 }
  ).intent;
};

// Context-aware entity extraction
const extractEntities = async (text, intent) => {
  const [doctors, medicines] = await Promise.all([
    fetchDoctorsData(),
    fetchMedicinesData(),
  ]);

  const words = preprocessText(text);
  const entities = {
    doctors: doctors.filter((d) =>
      words.some(
        (w) =>
          d.name.toLowerCase().includes(w) ||
          d.specialty.toLowerCase().includes(w)
      )
    ),
    medicines: medicines.filter((m) =>
      words.some(
        (w) =>
          m.name.toLowerCase().includes(w) ||
          m.category.toLowerCase().includes(w)
      )
    ),
  };

  return entities;
};

export {
  INTENTS,
  classifyIntent,
  extractEntities,
  fetchDoctorsData,
  fetchMedicinesData,
};
