import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, Deck, Box, StudySession, DailyStats } from '@/types';

interface AppState {
  // Data
  cards: Card[];
  decks: Deck[];
  boxes: Box[];
  sessions: StudySession[];
  dailyStats: DailyStats[];
  
  // UI State
  currentDeckId: string | null;
  currentStudySession: StudySession | null;
  
  // Actions
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'reviewCount' | 'correctCount'>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'cardCount'>) => void;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  
  moveCardToBox: (cardId: string, boxLevel: number) => void;
  
  startStudySession: (deckId: string) => void;
  endStudySession: () => void;
  recordReview: (cardId: string, correct: boolean, timeSpent: number, hintsUsed: number) => void;
  
  getCardsDueToday: () => Card[];
  getCardsInBox: (boxLevel: number) => Card[];
  getCardsByDeck: (deckId: string) => Card[];
}

const defaultBoxes: Box[] = [
  { id: 'box-1', name: 'New', level: 1, description: 'Cards you just started learning', cardCount: 0, color: 'box-1' },
  { id: 'box-2', name: 'Learning', level: 2, description: 'Cards you\'re actively learning', cardCount: 0, color: 'box-2' },
  { id: 'box-3', name: 'Reviewing', level: 3, description: 'Cards in regular review', cardCount: 0, color: 'box-3' },
  { id: 'box-4', name: 'Familiar', level: 4, description: 'Cards you know well', cardCount: 0, color: 'box-4' },
  { id: 'box-5', name: 'Mastered', level: 5, description: 'Cards you\'ve mastered', cardCount: 0, color: 'box-5' },
];

const sampleDecks: Deck[] = [
  { id: 'deck-1', name: 'Spanish Basics', description: 'Essential Spanish vocabulary', color: '#F59E0B', cardCount: 5, createdAt: new Date() },
  { id: 'deck-2', name: 'JavaScript Fundamentals', description: 'Core JS concepts', color: '#3B82F6', cardCount: 4, createdAt: new Date() },
];

const sampleCards: Card[] = [
  { id: 'card-1', front: 'Hola', back: 'Hello', deckId: 'deck-1', boxLevel: 1, difficulty: 'new', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 0, correctCount: 0, hints: ['Common greeting', 'Used any time of day'], tags: ['greetings'] },
  { id: 'card-2', front: 'Gracias', back: 'Thank you', deckId: 'deck-1', boxLevel: 1, difficulty: 'new', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 0, correctCount: 0, hints: ['Express gratitude', 'Very common word'], tags: ['polite'] },
  { id: 'card-3', front: 'Buenos días', back: 'Good morning', deckId: 'deck-1', boxLevel: 2, difficulty: 'hard', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 3, correctCount: 1, hints: ['Morning greeting', 'Used until noon'], tags: ['greetings', 'time'] },
  { id: 'card-4', front: 'Por favor', back: 'Please', deckId: 'deck-1', boxLevel: 3, difficulty: 'medium', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 5, correctCount: 4, hints: ['Polite request'], tags: ['polite'] },
  { id: 'card-5', front: 'Adiós', back: 'Goodbye', deckId: 'deck-1', boxLevel: 4, difficulty: 'easy', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 8, correctCount: 7, hints: ['Farewell expression'], tags: ['greetings'] },
  { id: 'card-6', front: 'What is a closure?', back: 'A function that has access to variables from its outer scope', deckId: 'deck-2', boxLevel: 1, difficulty: 'new', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 0, correctCount: 0, hints: ['Think about scope', 'Functions remember their environment'], tags: ['functions', 'scope'] },
  { id: 'card-7', front: 'What does === mean?', back: 'Strict equality (checks both value and type)', deckId: 'deck-2', boxLevel: 2, difficulty: 'hard', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 2, correctCount: 1, hints: ['Compare with ==', 'Type coercion'], tags: ['operators'] },
  { id: 'card-8', front: 'What is hoisting?', back: 'JavaScript\'s behavior of moving declarations to the top of their scope', deckId: 'deck-2', boxLevel: 3, difficulty: 'medium', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 4, correctCount: 3, hints: ['var vs let/const', 'Declaration vs initialization'], tags: ['scope', 'variables'] },
  { id: 'card-9', front: 'What is the event loop?', back: 'Mechanism that handles async operations by checking the call stack and task queue', deckId: 'deck-2', boxLevel: 1, difficulty: 'new', nextReviewAt: new Date(), createdAt: new Date(), reviewCount: 0, correctCount: 0, hints: ['Async JavaScript', 'Single-threaded'], tags: ['async'] },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cards: sampleCards,
      decks: sampleDecks,
      boxes: defaultBoxes,
      sessions: [],
      dailyStats: [],
      currentDeckId: null,
      currentStudySession: null,

      addCard: (cardData) => {
        const newCard: Card = {
          ...cardData,
          id: `card-${Date.now()}`,
          createdAt: new Date(),
          reviewCount: 0,
          correctCount: 0,
        };
        set((state) => ({
          cards: [...state.cards, newCard],
          decks: state.decks.map(d => 
            d.id === cardData.deckId ? { ...d, cardCount: d.cardCount + 1 } : d
          ),
        }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map(c => c.id === id ? { ...c, ...updates } : c),
        }));
      },

      deleteCard: (id) => {
        const card = get().cards.find(c => c.id === id);
        set((state) => ({
          cards: state.cards.filter(c => c.id !== id),
          decks: card ? state.decks.map(d => 
            d.id === card.deckId ? { ...d, cardCount: d.cardCount - 1 } : d
          ) : state.decks,
        }));
      },

      addDeck: (deckData) => {
        const newDeck: Deck = {
          ...deckData,
          id: `deck-${Date.now()}`,
          createdAt: new Date(),
          cardCount: 0,
        };
        set((state) => ({ decks: [...state.decks, newDeck] }));
      },

      updateDeck: (id, updates) => {
        set((state) => ({
          decks: state.decks.map(d => d.id === id ? { ...d, ...updates } : d),
        }));
      },

      deleteDeck: (id) => {
        set((state) => ({
          decks: state.decks.filter(d => d.id !== id),
          cards: state.cards.filter(c => c.deckId !== id),
        }));
      },

      moveCardToBox: (cardId, boxLevel) => {
        set((state) => ({
          cards: state.cards.map(c => c.id === cardId ? { ...c, boxLevel } : c),
        }));
      },

      startStudySession: (deckId) => {
        const session: StudySession = {
          id: `session-${Date.now()}`,
          deckId,
          startedAt: new Date(),
          cardsReviewed: 0,
          correctAnswers: 0,
          hintsUsed: 0,
        };
        set({ currentStudySession: session, currentDeckId: deckId });
      },

      endStudySession: () => {
        const session = get().currentStudySession;
        if (session) {
          const endedSession = { ...session, endedAt: new Date() };
          set((state) => ({
            sessions: [...state.sessions, endedSession],
            currentStudySession: null,
          }));
        }
      },

      recordReview: (cardId, correct, timeSpent, hintsUsed) => {
        const card = get().cards.find(c => c.id === cardId);
        if (!card) return;

        let newBoxLevel = card.boxLevel;
        let newDifficulty = card.difficulty;

        if (correct) {
          newBoxLevel = Math.min(card.boxLevel + 1, 5);
          if (newBoxLevel >= 4) newDifficulty = 'easy';
          else if (newBoxLevel >= 3) newDifficulty = 'medium';
        } else {
          newBoxLevel = Math.max(card.boxLevel - 1, 1);
          newDifficulty = 'hard';
        }

        // Calculate next review time based on box level
        const intervals = [0, 1, 3, 7, 14, 30]; // days
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + intervals[newBoxLevel]);

        set((state) => ({
          cards: state.cards.map(c => c.id === cardId ? {
            ...c,
            boxLevel: newBoxLevel,
            difficulty: newDifficulty,
            nextReviewAt: nextReview,
            reviewCount: c.reviewCount + 1,
            correctCount: correct ? c.correctCount + 1 : c.correctCount,
          } : c),
          currentStudySession: state.currentStudySession ? {
            ...state.currentStudySession,
            cardsReviewed: state.currentStudySession.cardsReviewed + 1,
            correctAnswers: correct ? state.currentStudySession.correctAnswers + 1 : state.currentStudySession.correctAnswers,
            hintsUsed: state.currentStudySession.hintsUsed + hintsUsed,
          } : null,
        }));
      },

      getCardsDueToday: () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return get().cards.filter(c => new Date(c.nextReviewAt) <= today);
      },

      getCardsInBox: (boxLevel) => {
        return get().cards.filter(c => c.boxLevel === boxLevel);
      },

      getCardsByDeck: (deckId) => {
        return get().cards.filter(c => c.deckId === deckId);
      },
    }),
    {
      name: 'colonymind-storage',
    }
  )
);
