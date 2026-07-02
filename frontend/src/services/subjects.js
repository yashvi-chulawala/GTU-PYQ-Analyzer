// Subjects are loaded dynamically from the backend /subjects endpoint.
// No hardcoded list needed — just add a subject folder to backend/subjects/,
// run your pipeline, and it appears automatically on the home page.

/**
 * In-memory cache populated at app startup by Home.jsx.
 * Subject.jsx calls getSubjectByCode() synchronously so we keep a map here.
 */
let _cache = {};

export function setSubjectsCache(subjects) {
  _cache = {};
  subjects.forEach((s) => { _cache[s.code] = s; });
}

export function getSubjectByCode(code) {
  return _cache[code] || { code, name: code.toUpperCase(), short: code.toUpperCase(), blurb: "" };
}
