// Replace any with your actual CrimChartUserModel type when available.
export interface CrimChartUserModel {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface MessageModel {
  user: CrimChartUserModel;
  isTyping: boolean;
  
  // These properties aren't in the barebones Dart MassageModel yet, 
  // but they are typical for full chat systems. Adding them as optional.
  id?: string;
  text?: string;
  timestamp?: Date;
  media?: any[]; // Array of MediaModel items
}
