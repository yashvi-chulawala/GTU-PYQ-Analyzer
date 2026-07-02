// Base URL for the FastAPI backend.
// Override by setting VITE_API_BASE_URL in a .env file at the project root.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Thrown when the backend responds with a non-OK status or malformed data.
 * Lets UI code distinguish "network failed" from "server said no".
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Fetch the list of available subjects dynamically from the backend.
 * Returns an array of subject objects: [{ code, name, short, blurb }]
 */
export async function fetchSubjects() {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/subjects`);
  } catch {
    throw new ApiError(
      "Couldn't reach the analysis server. Check your connection and that the backend is running.",
      0
    );
  }
  if (!response.ok) {
    throw new ApiError(`Failed to load subjects (${response.status}).`, response.status);
  }
  try {
    const data = await response.json();
    // subjects_meta contains full objects { code, name, short, blurb }
    if (data.subjects_meta) return data.subjects_meta;
    // fallback: just codes
    return data.subjects.map((code) => ({
      code,
      name: code.toUpperCase(),
      short: code.toUpperCase(),
      blurb: "",
    }));
  } catch {
    throw new ApiError("Received an unreadable response from the server.", response.status);
  }
}

/**
 * Fetch the full PYQ analysis for a subject.
 *
 * @param {string} subjectCode - e.g. "os", "coa", "cn", "mi", "pds", "ss"
 * @returns {Promise<Object>} unit map keyed by unit number
 */
export async function fetchSubjectData(subjectCode) {
  const url = `${API_BASE_URL}/subject/${subjectCode}`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError(
      "Couldn't reach the analysis server. Check your connection and that the backend is running.",
      0
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(`No analysis data found for "${subjectCode}" yet.`, 404);
    }
    throw new ApiError(
      `The server returned an error (${response.status}). Please try again shortly.`,
      response.status
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("Received an unreadable response from the server.", response.status);
  }
}

/**
 * Fetch the list of available papers for a subject.
 *
 * @param {string} subjectCode - e.g. "os"
 * @returns {Promise<Array>} array of paper objects
 */
export async function fetchPapers(subjectCode) {
  const url = `${API_BASE_URL}/subject/${subjectCode}/papers`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError("Couldn't reach the server to load papers.", 0);
  }

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new ApiError(`Failed to load papers (${response.status}).`, response.status);
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Build the direct URL to download a paper PDF.
 *
 * @param {string} subjectCode - e.g. "os"
 * @param {string} filename - e.g. "S2024.pdf"
 * @returns {string} URL
 */
export function getPaperUrl(subjectCode, filename) {
  return `${API_BASE_URL}/subject/${subjectCode}/paper/${filename}`;
}
