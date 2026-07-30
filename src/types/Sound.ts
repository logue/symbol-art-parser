/** Sound Effects */
export const Sound: Record<string, number> = {
  None: 1,
  Normal: 2,
  Joy: 3,
  Anger: 4,
  Sorrow: 5,
  Anxiety: 6,
  Surprised: 7,
  Doubt: 8,
  Whistle: 9,
  Shy: 10,
  Success: 11,
} as const;

/** Sound Effect Type */
export type Sound = (typeof Sound)[keyof typeof Sound];
