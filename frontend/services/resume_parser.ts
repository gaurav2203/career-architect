import { ResumeData } from "../types";


const sanitizeResumeData = (data: any): ResumeData => {
  return {
    personalInfo: {
      name: data.personalInfo?.name || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      linkedin: data.personalInfo?.linkedin || "",
      github: data.personalInfo?.github || "",
      website: data.personalInfo?.website || "",
    },
    summary: data.summary || "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    experience: Array.isArray(data.experience) ? data.experience.map((e: any) => ({
      role: e.role || "",
      company: e.company || "",
      startMonth: e.startMonth || "",
      startYear: e.startYear || "",
      endMonth: e.endMonth || "",
      endYear: e.endYear || "",
      details: Array.isArray(e.details) ? e.details : (typeof e.details === 'string' ? [e.details] : []),
    })) : [],
    education: Array.isArray(data.education) ? data.education.map((e: any) => ({
      degree: e.degree || "",
      school: e.school || "",
      startMonth: e.startMonth || "",
      startYear: e.startYear || "",
      endMonth: e.endMonth || "",
      endYear: e.endYear || "",
    })) : [],
    projects: Array.isArray(data.projects) ? data.projects.map((p: any) => ({
      name: p.name || "",
      description: p.description || "",
      tech: Array.isArray(p.tech) ? p.tech : [],
      link: p.link || "",
    })) : [],
    certificates: Array.isArray(data.certificates) ? data.certificates.map((c: any) => ({
      name: c.name || "",
      description: c.description || "",
      issuer: c.issuer || "",
      validTill: c.validTill || "",
      link: c.link || "",
    })) : [],
  };
};

export const parseResumeAI = async (base64Data: string, mimeType: string): Promise<ResumeData> => {
  const baseUrl = process.env.RESUME_PARSER_URL;
  const endpoint = `${baseUrl}/parse-resume`;

  // Helper: convert base64 string (with or without data: prefix) to Uint8Array
  const base64ToUint8Array = (b64: string) => {
    const cleaned = b64.indexOf(",") ? b64.split(",")[1] : b64;
    const binaryString = atob(cleaned);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  try {
    // Convert base64 to File so we can send multipart/form-data
    // const bytes = base64ToUint8Array(base64Data);
    const bytes = base64Data;
    const file = new File([bytes], "resume.pdf", { type: mimeType });

    const formData = new FormData();
    formData.append("file", file, file.name);

    const fetchResp = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!fetchResp.ok) {
      const bodyText = await fetchResp.text();
      console.error("Backend error response:", fetchResp.status, bodyText);
      throw new Error(`Upload failed: ${fetchResp.status} ${bodyText}`);
    }

    const backendJson = await fetchResp.json();

    // Expecting backend to return structure like:
    // { success: true, method: "inline_bytes", response_text: "...", ... }
    if (!backendJson || backendJson.success === false) {
      const errMsg = backendJson?.error || "Backend returned an error or empty response";
      console.error("Backend extraction failed:", backendJson);
      throw new Error(errMsg);
    }

    const modelText = backendJson.response_text ?? backendJson.text ?? backendJson.response_text_preview ?? null;

    if (!modelText) {
      console.error("No response_text from backend:", backendJson);
      throw new Error("No data returned from AI");
    }

    // Try to parse modelText as JSON (expected shape from your original prompt)
    try {
      const rawData = typeof modelText === "string" ? JSON.parse(modelText) : modelText;
      return sanitizeResumeData(rawData);
    } catch (parseErr) {
      console.error("Failed to parse JSON response from backend:", modelText, parseErr);
      throw new Error("AI returned invalid JSON.");
    }
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

