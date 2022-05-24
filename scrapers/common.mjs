export const convertGrossToNet = grossAmount => {
  grossAmount = Number(grossAmount);

  const INSURANCE_THRESHOLD = 3400;
  const CONTRIBUTIONS_PERCENTAGE = 0.1378;
  const INCOME_TAX_PERCENTAGE = 0.1;

  const insuranceContributions =
    Math.min(INSURANCE_THRESHOLD, grossAmount) * CONTRIBUTIONS_PERCENTAGE;
  const incomeTax =
    (grossAmount - insuranceContributions) * INCOME_TAX_PERCENTAGE;

  return grossAmount - insuranceContributions - incomeTax;
};
