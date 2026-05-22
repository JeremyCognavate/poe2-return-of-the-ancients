export interface PressKitImage {
  filename: string;
  displayName: string;
  category: 'boss' | 'class' | 'mechanic' | 'ui' | 'environment' | 'item' | 'other';
  note?: string;
}

// 55 images in press kit (brief incorrectly said 57)
// Filenames use underscores — spaces → underscores, no special chars
export const pressKitImages: PressKitImage[] = [
  { filename: 'Uhtred_the_Stardrinker.png', displayName: 'Uhtred, the Stardrinker', category: 'boss', note: 'Original file had wrong spelling — rename from Uthred' },
  { filename: 'Build_Planner.png', displayName: 'Build Planner', category: 'ui', note: 'Original had space in filename' },
  { filename: 'Immortal_Son_2.png', displayName: 'Immortal Son (2)', category: 'other', note: 'Original had underscore-space — unidentified in transcripts' },
];

export const logoPath = 'Blood of Mages Logo.png';
