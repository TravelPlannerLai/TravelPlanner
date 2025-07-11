export function calculateDays(start, end) {
  if (!start || !end) return 0;
  const startDateObj = new Date(start);
  const endDateObj = new Date(end);
  const diffTime = endDateObj - startDateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}
