import { Card, Deck } from '@/types';
import { Clue, ClueType } from '@/components/study/ClueBalloon';

interface ClueGeneratorContext {
  card: Card;
  deck?: Deck;
  allCards: Card[];
  allDecks: Deck[];
}

// Simulated clue generators - in production, these would call AI services
const clueGenerators: Record<ClueType, (ctx: ClueGeneratorContext) => Clue | null> = {
  graph: (ctx) => {
    // Find related cards in the same deck
    const relatedCards = ctx.allCards
      .filter(c => c.deckId === ctx.card.deckId && c.id !== ctx.card.id)
      .slice(0, 3);
    
    if (relatedCards.length === 0) return null;
    
    const relatedTerms = relatedCards.map(c => c.front).join(', ');
    
    return {
      id: `graph-${ctx.card.id}`,
      text: `Related to: ${relatedTerms}`,
      type: 'graph',
      weight: 0.7,
      expanded: 'These concepts share connections in your knowledge graph.',
    };
  },

  semantic: (ctx) => {
    // Generate semantic hints based on card content
    const hints: Record<string, string[]> = {
      // Language learning hints
      default: [
        "Think about the context where you'd use this.",
        "Consider similar words or concepts you already know.",
        "Try to visualize what this represents.",
        "Connect this to a real-world example.",
        "Break it down into smaller parts.",
      ],
    };

    const hintList = hints.default;
    const randomHint = hintList[Math.floor(Math.random() * hintList.length)];

    return {
      id: `semantic-${ctx.card.id}`,
      text: randomHint,
      type: 'semantic',
      weight: 0.6,
    };
  },

  rag: (ctx) => {
    // Simulated RAG context - would normally fetch from knowledge base
    const contexts: Record<string, string> = {
      'Japanese Basics': 'Japanese vocabulary often connects to cultural concepts.',
      'Spanish Verbs': 'Spanish verb conjugations follow predictable patterns.',
      'default': 'This concept appears in foundational learning materials.',
    };

    const deckName = ctx.deck?.name || 'default';
    const contextText = contexts[deckName] || contexts.default;

    return {
      id: `rag-${ctx.card.id}`,
      text: contextText,
      type: 'rag',
      weight: 0.5,
      expanded: 'Generated from your learning materials and related sources.',
    };
  },

  difficulty: (ctx) => {
    const { difficulty, reviewCount, correctCount } = ctx.card;
    const accuracy = reviewCount > 0 ? (correctCount / reviewCount) * 100 : 0;

    const difficultyMessages: Record<string, string> = {
      new: "This is new material. Take your time to understand it.",
      hard: `You've found this challenging (${accuracy.toFixed(0)}% accuracy). Focus on building connections.`,
      medium: "You're making progress. Keep reinforcing this concept.",
      easy: "You're doing well with this! Quick review should suffice.",
      mastered: "Almost mastered! Just a quick refresher.",
    };

    return {
      id: `difficulty-${ctx.card.id}`,
      text: difficultyMessages[difficulty],
      type: 'difficulty',
      weight: 0.4,
    };
  },

  box: (ctx) => {
    const boxMessages: Record<number, string> = {
      1: "New card - First encounter. Build initial memory.",
      2: "Learning stage - Short-term memory forming.",
      3: "Familiar - Transitioning to long-term memory.",
      4: "Well-known - Strong memory trace established.",
      5: "Mastered - Deep learning achieved.",
    };

    return {
      id: `box-${ctx.card.id}`,
      text: boxMessages[ctx.card.boxLevel] || "Review in progress.",
      type: 'box',
      weight: 0.3,
    };
  },

  cluster: (ctx) => {
    // Analyze performance in the same deck/cluster
    const deckCards = ctx.allCards.filter(c => c.deckId === ctx.card.deckId);
    const recentMisses = deckCards.filter(c => {
      const accuracy = c.reviewCount > 0 ? c.correctCount / c.reviewCount : 1;
      return accuracy < 0.5;
    }).length;

    if (recentMisses < 2) return null;

    return {
      id: `cluster-${ctx.card.id}`,
      text: `This belongs to a cluster where you missed ${recentMisses} cards. Pay extra attention.`,
      type: 'cluster',
      weight: 0.65,
      expanded: 'Focusing on weak clusters accelerates overall learning.',
    };
  },
};

// RL-style ranking simulation - ranks clues by relevance
function rankClues(clues: Clue[], card: Card): Clue[] {
  // Adjust weights based on card state
  const adjustedClues = clues.map(clue => {
    let adjustedWeight = clue.weight;

    // Boost graph clues for hard cards
    if (clue.type === 'graph' && card.difficulty === 'hard') {
      adjustedWeight += 0.2;
    }

    // Boost difficulty clues for new cards
    if (clue.type === 'difficulty' && card.difficulty === 'new') {
      adjustedWeight += 0.15;
    }

    // Boost cluster clues for low accuracy
    if (clue.type === 'cluster' && card.reviewCount > 0) {
      const accuracy = card.correctCount / card.reviewCount;
      if (accuracy < 0.5) {
        adjustedWeight += 0.25;
      }
    }

    return { ...clue, weight: Math.min(adjustedWeight, 1) };
  });

  // Sort by weight descending
  return adjustedClues.sort((a, b) => b.weight - a.weight);
}

export function generateClues(context: ClueGeneratorContext): Clue[] {
  const clues: Clue[] = [];

  // Generate clues from each generator
  for (const [type, generator] of Object.entries(clueGenerators)) {
    const clue = generator(context);
    if (clue) {
      clues.push(clue);
    }
  }

  // Rank and return top clues
  return rankClues(clues, context.card);
}

// Clue feedback logging - would normally send to backend for RL training
export function logClueFeedback(
  cardId: string, 
  clueId: string, 
  helpful: boolean
): void {
  console.log('Clue feedback logged:', { cardId, clueId, helpful });
  // In production: POST to /api/clue-feedback for RL model training
}
