export interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  boxLevel: number;
  difficulty: 'new' | 'hard' | 'medium' | 'easy' | 'mastered';
  nextReviewAt: Date;
  createdAt: Date;
  reviewCount: number;
  correctCount: number;
  hints?: string[];
  tags?: string[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  cardCount: number;
  createdAt: Date;
  lastStudied?: Date;
}

export interface Box {
  id: string;
  name: string;
  level: number;
  description: string;
  cardCount: number;
  color: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  startedAt: Date;
  endedAt?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  hintsUsed: number;
}

export interface ReviewResult {
  cardId: string;
  correct: boolean;
  timeSpent: number;
  hintsUsed: number;
  newBoxLevel: number;
  newDifficulty: Card['difficulty'];
}

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface DailyStats {
  date: string;
  cardsReviewed: number;
  correctRate: number;
  timeSpent: number;
  streak: number;
}
