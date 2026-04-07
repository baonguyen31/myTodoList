// Text formatting utilities
export const truncateText = (text, maxLength = 22) => {
  if (!text) return null;

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
};

// Format description for table display
export const formatDescription = (description, maxLength = 19) => truncateText(description, maxLength);
