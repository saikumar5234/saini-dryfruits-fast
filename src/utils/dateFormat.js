/**
 * Format date for UI display - DD/MM/YYYY
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatDisplayDate(dateInput) {
  if (dateInput == null || dateInput === '') return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date and time for UI - DD/MM/YYYY, HH:mm
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatDisplayDateTime(dateInput) {
  if (dateInput == null || dateInput === '') return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

/**
 * Short date for charts/labels - dd/MM
 * @param {Date|string} dateInput
 * @returns {string}
 */
export function formatChartDate(dateInput) {
  if (dateInput == null || dateInput === '') return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
