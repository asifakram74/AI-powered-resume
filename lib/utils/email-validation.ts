import axios from "axios";

/**
 * Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email format is valid
 */
export const isValidEmailFormat = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates email using the backend API
 * @param {string} email - Email to validate
 * @returns {Promise<Object>} - Validation result object
 */
export const validateEmailAPI = async (email: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    // First check email format
    if (!email) {
      return {
        success: false,
        error: "Please enter an email address"
      };
    }

    if (!isValidEmailFormat(email)) {
      return {
        success: false,
        error: "Invalid email format"
      };
    }

    // Call the backend API for validation
    const response = await axios.post(
      'https://backend.onlinetoolpot.com/api/validate',
      { email },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
     
    // Check if email is valid based on API response
    const isValid = data.success && data.data.final_conclusion === "likely_valid";
     
    return {
      success: isValid,
      data: data.data,
      error: isValid ? undefined : "Email validation failed"
    };
  } catch (error) {
    console.error("Error validating email:", error);
    return {
      success: false,
      error: "Error checking the email. Please try again."
    };
  }
};