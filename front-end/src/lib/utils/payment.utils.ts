/**
 * Validates a credit card number using the Luhn algorithm
 * @param cardNumber The card number to validate
 * @returns True if the card number is valid, false otherwise
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove any spaces or dashes
  const cleanCardNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
  
  // Check if the card number is numeric and has a valid length
  if (!/^\d+$/.test(cleanCardNumber) || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  // Loop through values starting from the rightmost side
  for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCardNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validates a card expiry date in MM/YY format
 * @param expiryDate The expiry date to validate
 * @returns True if the expiry date is valid, false otherwise
 */
export const validateExpiryDate = (expiryDate: string): boolean => {
  // Check if the format is MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }
  
  const [month, year] = expiryDate.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Check if the month is valid (1-12)
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last 2 digits of current year
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  
  // Check if the card is expired
  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return false;
  }
  
  return true;
};

/**
 * Validates a CVC code
 * @param cvc The CVC code to validate
 * @returns True if the CVC code is valid, false otherwise
 */
export const validateCVC = (cvc: string): boolean => {
  // Check if the CVC is numeric and has a valid length (3 or 4 digits)
  return /^\d{3,4}$/.test(cvc);
};

/**
 * Validates all card details
 * @param cardNumber The card number to validate
 * @param expiryDate The expiry date to validate
 * @param cvc The CVC code to validate
 * @returns An object with validation results and error messages
 */
export const validateCardDetails = (
  cardNumber: string,
  expiryDate: string,
  cvc: string
): { isValid: boolean; errors: { cardNumber?: string; expiryDate?: string; cvc?: string } } => {
  const errors: { cardNumber?: string; expiryDate?: string; cvc?: string } = {};
  let isValid = true;
  
  if (!validateCardNumber(cardNumber)) {
    errors.cardNumber = 'Invalid card number';
    isValid = false;
  }
  
  if (!validateExpiryDate(expiryDate)) {
    errors.expiryDate = 'Invalid expiry date';
    isValid = false;
  }
  
  if (!validateCVC(cvc)) {
    errors.cvc = 'Invalid CVC';
    isValid = false;
  }
  
  return { isValid, errors };
}; 