import Clarity from "@microsoft/clarity";

const projectId = import.meta.env.VITE_CLARITY_ID;

export const initializeClarity = () => {
  if (!projectId || projectId === "YOUR_CLARITY_PROJECT_ID") {
    console.warn("Clarity Project ID missing");
    return;
  }

  Clarity.init(projectId);
  Clarity.consentV2();

  console.log("Microsoft Clarity initialized");
};

export const trackClarityEvent = (eventName: string) => {
  if (!projectId || projectId === "YOUR_CLARITY_PROJECT_ID") {
    return;
  }

  Clarity.event(eventName);
};
