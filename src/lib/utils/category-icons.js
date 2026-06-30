/**
 * Centralized category icon mapping for expenses
 */

export const CATEGORY_ICONS = {
  'Grocery': '🛒',
  'Electricity': '⚡',
  'LPG/Gas': '🔥',
  'Rent': '🏠',
  'Household Essentials': '🧴',
  'Transport': '🚗',
  'Others': '📝'
};

/**
 * Get the icon for a given category
 * @param {string} category - The expense category
 * @returns {string} The emoji icon for the category
 */
export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Others'];
}

/**
 * Get all available categories with their icons
 * @returns {Array<{category: string, icon: string}>} Array of category objects
 */
export function getAllCategoriesWithIcons() {
  return Object.entries(CATEGORY_ICONS).map(([category, icon]) => ({
    category,
    icon
  }));
}