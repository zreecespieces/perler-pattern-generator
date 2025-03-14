// Local storage keys
const SAVED_COLORS_KEY = 'instant-perler-saved-colors';

// Get saved colors from local storage
export const getSavedColors = (): string[] => {
  try {
    const savedColors = localStorage.getItem(SAVED_COLORS_KEY);
    return savedColors ? JSON.parse(savedColors) : [];
  } catch (error) {
    console.error('Error loading saved colors:', error);
    return [];
  }
};

// Save a color to local storage
export const saveColor = (color: string): string[] => {
  try {
    const currentColors = getSavedColors();
    
    // Only add if the color doesn't already exist
    if (!currentColors.includes(color)) {
      const updatedColors = [...currentColors, color];
      localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updatedColors));
      return updatedColors;
    }
    
    return currentColors;
  } catch (error) {
    console.error('Error saving color:', error);
    return [];
  }
};

// Remove a color from local storage
export const removeColor = (color: string): string[] => {
  try {
    const currentColors = getSavedColors();
    const updatedColors = currentColors.filter(c => c !== color);
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updatedColors));
    return updatedColors;
  } catch (error) {
    console.error('Error removing color:', error);
    return [];
  }
};
