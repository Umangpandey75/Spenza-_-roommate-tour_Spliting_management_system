/**
 * App-wide Color Scheme
 * Centralized color definitions for consistent theming across all app components
 */

export const appTheme = {
  // Primary card backgrounds for different sections
  cards: {
    // Settle tab cards
    settlementSummary: {
      background: "#d9ed92",
      gradient:
        "linear-gradient(135deg, #d9ed92 0%, rgba(217, 237, 146, 0.8) 100%)",
      text: "#2d5016",
      textSecondary: "#2d5016",
    },
    settlementTools: {
      background: "#ee6c4d",
      gradient:
        "linear-gradient(135deg, #ee6c4d 0%, rgba(238, 108, 77, 0.8) 100%)",
      text: "rgba(255, 255, 255, 0.9)",
      textSecondary: "#7c2d12",
    },
    settlementEditor: {
      background: "#ee6c4d",
      text: "rgba(255, 255, 255, 0.9)",
      textSecondary: "#7c2d12",
    },
    balanceCards: {
      background: "#e9c46a",
      text: "#92400e",
      textSecondary: "#92400e",
    },
    paymentInstructions: {
      background: "#ffd6cc",
      gradient:
        "linear-gradient(135deg, #ffd6cc 0%, rgba(255, 214, 204, 0.8) 100%)",
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },
    settlementHistory: {
      background: "#f4a261",
      gradient:
        "linear-gradient(135deg, #f4a261 0%, rgba(244, 162, 97, 0.8) 100%)",
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },

    // Participants tab cards - using warm color scheme
    participantsList: {
      background: "#e9c46a",
      text: "#92400e",
      textSecondary: "#92400e",
    },
    addParticipant: {
      background: "#d9ed92",
      gradient:
        "linear-gradient(135deg, #d9ed92 0%, rgba(217, 237, 146, 0.8) 100%)",
      text: "#2d5016",
      textSecondary: "#2d5016",
    },
    participantCard: {
      background: "#ffd6cc",
      gradient:
        "linear-gradient(135deg, #ffd6cc 0%, rgba(255, 214, 204, 0.8) 100%)",
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },

    // Multiple participant card color variations
    participantCard1: {
      background: "#ffd6cc", // Light coral
      gradient:
        "linear-gradient(135deg, #ffd6cc 0%, rgba(255, 214, 204, 0.8) 100%)",
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },
    participantCard2: {
      background: "#e9c46a", // Golden yellow
      gradient:
        "linear-gradient(135deg, #e9c46a 0%, rgba(233, 196, 106, 0.8) 100%)",
      text: "#92400e",
      textSecondary: "#92400e",
    },
    participantCard3: {
      background: "#d9ed92", // Light green
      gradient:
        "linear-gradient(135deg, #d9ed92 0%, rgba(217, 237, 146, 0.8) 100%)",
      text: "#2d5016",
      textSecondary: "#2d5016",
    },
    participantCard4: {
      background: "#f4a261", // Warm orange
      gradient:
        "linear-gradient(135deg, #f4a261 0%, rgba(244, 162, 97, 0.8) 100%)",
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },
    participantCard5: {
      background: "#ee6c4d", // Warm red
      gradient:
        "linear-gradient(135deg, #ee6c4d 0%, rgba(238, 108, 77, 0.8) 100%)",
      text: "rgba(255, 255, 255, 0.9)",
      textSecondary: "#7c2d12",
    },
    participantCard6: {
      background: "#c7ceea", // Light lavender
      gradient:
        "linear-gradient(135deg, #c7ceea 0%, rgba(199, 206, 234, 0.8) 100%)",
      text: "#4c1d95",
      textSecondary: "#4c1d95",
    },

    // Overview tab cards
    overview: {
      background: "#e0f2fe",
      gradient:
        "linear-gradient(135deg, #e0f2fe 0%, rgba(224, 242, 254, 0.8) 100%)",
      text: "#0c4a6e",
      textSecondary: "#0c4a6e",
    },

    // Expenses tab cards
    expenses: {
      background: "#dcfce7",
      gradient:
        "linear-gradient(135deg, #dcfce7 0%, rgba(220, 252, 231, 0.8) 100%)",
      text: "#14532d",
      textSecondary: "#14532d",
    },

    // What-If tab cards - diverse warm color scheme
    whatIfMain: {
      background: "#e9c46a", // Golden yellow - main exploration card
      text: "#92400e",
      textSecondary: "#92400e",
    },
    whatIfControls: {
      background: "#f4a261", // Warm orange - simulation controls
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },
    whatIfResults: {
      background: "#d9ed92", // Light green - results summary
      text: "#2d5016",
      textSecondary: "#2d5016",
    },
    whatIfComparison: {
      background: "#ffd6cc", // Light coral - before/after comparison
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },
    whatIfParticipant: {
      background: "#e76f51", // Terracotta - participant control cards
      text: "rgba(255, 255, 255, 0.9)",
      textSecondary: "#7c2d12",
    },

    // Settings tab cards - professional warm color scheme
    settingsBasic: {
      background: "#e9c46a", // Golden yellow - basic settings
      text: "#92400e",
      textSecondary: "#92400e",
    },
    settingsInfo: {
      background: "#f4a261", // Warm orange - group information
      text: "#7c2d12",
      textSecondary: "#7c2d12",
    },
    settingsDanger: {
      background: "#ee6c4d", // Warm red - danger zone
      text: "rgba(255, 255, 255, 0.9)",
      textSecondary: "#7c2d12",
    },
  },

  // Common elements used across all components
  common: {
    // Icon containers
    iconContainer: {
      background: "rgba(255, 255, 255, 0.8)",
      backgroundAlt: "rgba(255, 255, 255, 0.9)",
      border: "rgba(255, 255, 255, 0.4)",
    },

    // Content areas
    contentCard: {
      background: "rgba(255, 255, 255, 0.8)",
      backgroundLight: "rgba(255, 255, 255, 0.6)",
      backgroundStrong: "rgba(255, 255, 255, 0.9)",
      border: "rgba(255, 255, 255, 0.4)",
    },

    // Borders and effects
    border: {
      primary: "rgba(255, 255, 255, 0.3)",
      secondary: "rgba(255, 255, 255, 0.4)",
      accent: "rgba(146, 64, 14, 0.2)",
      light: "rgba(0, 0, 0, 0.1)",
    },

    // Primary text color used across components
    primaryText: "#7c2d12",

    // Button styles
    button: {
      background: "rgba(255, 255, 255, 0.8)",
      text: "#7c2d12",
      border: "rgba(255, 255, 255, 0.4)",
    },
  },

  // Status colors
  status: {
    positive: {
      background: "#16a34a",
      text: "#16a34a",
      light: "#22c55e",
    },
    negative: {
      background: "#dc2626",
      text: "#dc2626",
      light: "#ef4444",
    },
    neutral: {
      background: "#6b7280",
      text: "#6b7280",
      light: "#9ca3af",
    },
    warning: {
      background: "#f59e0b",
      text: "#f59e0b",
    },
    success: {
      background: "#16a34a",
      text: "#16a34a",
    },
    info: {
      background: "#3b82f6",
      text: "#3b82f6",
    },
  },

  // Avatar gradients
  avatars: {
    payer: "linear-gradient(to bottom right, #ef4444, #dc2626)",
    receiver: "linear-gradient(to bottom right, #22c55e, #16a34a)",
    participant: "linear-gradient(to bottom right, #f59e0b, #d97706)",
    default: "linear-gradient(to bottom right, #6366f1, #4f46e5)",
  },

  // Graph colors
  graph: {
    background: {
      primary: "#f8fafc",
      secondary: "#f1f5f9",
    },
    nodes: {
      creditor: "linear-gradient(to bottom right, #34d399, #10b981)",
      debtor: "linear-gradient(to bottom right, #f87171, #ef4444)",
      settled: "linear-gradient(to bottom right, #9ca3af, #6b7280)",
    },
    transfers: "linear-gradient(to right, #60a5fa, #3b82f6)",
  },
};

/**
 * Helper function to get card theme by name
 */
export const getCardTheme = (cardName) => {
  return appTheme.cards[cardName] || appTheme.cards.settlementSummary;
};

/**
 * Helper function to create inline styles for card backgrounds
 */
export const getCardStyles = (cardName) => {
  const theme = getCardTheme(cardName);
  return {
    backgroundColor: theme.background,
    background: theme.gradient || theme.background,
  };
};

/**
 * Helper function to get text color styles
 */
export const getTextStyles = (cardName, secondary = false) => {
  const theme = getCardTheme(cardName);
  return {
    color: secondary ? theme.textSecondary : theme.text,
  };
};

/**
 * Helper function to get common button styles
 */
export const getButtonStyles = () => {
  return {
    backgroundColor: appTheme.common.button.background,
    color: appTheme.common.button.text,
    borderColor: appTheme.common.button.border,
  };
};

/**
 * Helper function to get icon container styles
 */
export const getIconContainerStyles = (alt = false) => {
  return {
    backgroundColor: alt
      ? appTheme.common.iconContainer.backgroundAlt
      : appTheme.common.iconContainer.background,
    borderColor: appTheme.common.iconContainer.border,
  };
};

/**
 * Helper function to get content card styles
 */
export const getContentCardStyles = (variant = "default") => {
  const backgrounds = {
    default: appTheme.common.contentCard.background,
    light: appTheme.common.contentCard.backgroundLight,
    strong: appTheme.common.contentCard.backgroundStrong,
  };

  return {
    backgroundColor: backgrounds[variant] || backgrounds.default,
    borderColor: appTheme.common.contentCard.border,
  };
};

/**
 * Helper function to get participant card color by index
 */
export const getParticipantCardTheme = (index) => {
  const cardVariants = [
    'participantCard1',
    'participantCard2', 
    'participantCard3',
    'participantCard4',
    'participantCard5',
    'participantCard6'
  ];
  
  const cardName = cardVariants[index % cardVariants.length];
  return appTheme.cards[cardName];
};

/**
 * Helper function to get participant card styles by index
 */
export const getParticipantCardStyles = (index) => {
  const theme = getParticipantCardTheme(index);
  return {
    backgroundColor: theme.background,
    background: theme.gradient || theme.background,
  };
};

/**
 * Helper function to get participant text styles by index
 */
export const getParticipantTextStyles = (index, secondary = false) => {
  const theme = getParticipantCardTheme(index);
  return {
    color: secondary ? theme.textSecondary : theme.text,
  };
};

// Legacy export for backward compatibility
export const settleTheme = appTheme;
