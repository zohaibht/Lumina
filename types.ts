
export enum DesignStyle {
  MID_CENTURY_MODERN = 'Mid-Century Modern',
  SCANDINAVIAN = 'Scandinavian',
  INDUSTRIAL = 'Industrial',
  MINIMALIST = 'Minimalist',
  BOHEMIAN = 'Bohemian',
  JAPANDI = 'Japandi',
  CONTEMPORARY = 'Contemporary',
  RUSTIC = 'Rustic',
  ART_DECO = 'Art Deco',
  FARMHOUSE = 'Farmhouse'
}

export interface DesignVariant {
  id: string;
  style: DesignStyle;
  imageUrl: string;
  prompt: string;
}

export interface ChatLink {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  links?: ChatLink[];
}

export interface SavedDesign {
  id: string;
  originalImage: string;
  modifiedImage: string;
  style: DesignStyle;
  timestamp: number;
}
