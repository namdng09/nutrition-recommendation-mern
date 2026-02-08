import { BODYFAT } from '~/constants/bodyfat';

/**
 * Calculates BMI based on height (cm) and weight (kg)
 * @param {number} height - Height in cm
 * @param {number} weight - Weight in kg
 * @returns {number|null} BMI value or null if inputs are invalid
 */
export const calculateBMI = (height, weight) => {
  if (!height || !weight || height <= 0 || weight <= 0) return null;
  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

/**
 * Returns a Set of disabled BODYFAT options based on BMI
 * @param {number} bmi - Calculated BMI
 * @returns {Set<string>} Set of disabled BODYFAT values
 */
export const getDisabledBodyFatOptions = bmi => {
  const disabledOptions = new Set();

  if (!bmi) return disabledOptions;

  // Underweight (BMI < 18.5) -> Disable High Body Fat
  if (bmi < 18.5) {
    disabledOptions.add(BODYFAT.HIGH);
  }

  // Obesity Class III (BMI >= 40) -> Disable Low Body Fat
  if (bmi >= 40) {
    disabledOptions.add(BODYFAT.LOW);
  }

  return disabledOptions;
};
