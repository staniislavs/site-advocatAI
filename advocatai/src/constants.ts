export const EXPERIENCE_START_YEAR = 2014;

export const getExperienceYears = () => {
  const currentYear = new Date().getFullYear();
  return currentYear - EXPERIENCE_START_YEAR;
};
