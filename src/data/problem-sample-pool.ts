import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_PROBLEM_SAMPLES } from "@/data/mock-session";

const isBrowser = () => typeof window !== "undefined";

export const getProblemSamplePool = (): string[] => {
  if (!isBrowser()) {
    return DEFAULT_PROBLEM_SAMPLES;
  }

  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS.problemSamplePool);
  if (!raw) {
    return DEFAULT_PROBLEM_SAMPLES;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }
  } catch {
    return DEFAULT_PROBLEM_SAMPLES;
  }

  return DEFAULT_PROBLEM_SAMPLES;
};

export const setProblemSamplePool = (samples: string[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.problemSamplePool,
    JSON.stringify(samples),
  );
};
