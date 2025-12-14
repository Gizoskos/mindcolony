import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card as CardType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClueBalloonContainer, Clue } from './ClueBalloon';
import { generateClues, logClueFeedback } from '@/lib/clueGenerator';
import { 
  Brain, 
  Check, 
  X, 
  Lightbulb,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Home,
  Trophy,
  Eye,
  EyeOff
} from 'lucide-react';

export function StudyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    cards, 
    decks, 
    getCardsDueToday, 
    getCardsInBox, 
    getCardsByDeck,
    recordReview,
    startStudySession,
    endStudySession,
    currentStudySession
  } = useStore();

  const deckId = searchParams.get('deck');
  const boxLevel = searchParams.get('box');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showClues, setShowClues] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Get cards to study
  const studyCards = useMemo(() => {
    if (deckId) {
      return getCardsByDeck(deckId).filter(c => new Date(c.nextReviewAt) <= new Date());
    }
    if (boxLevel) {
      return getCardsInBox(parseInt(boxLevel));
    }
    return getCardsDueToday();
  }, [deckId, boxLevel, cards]);

  const currentCard = studyCards[currentIndex];
  const progress = studyCards.length > 0 ? ((currentIndex) / studyCards.length) * 100 : 0;
  const isComplete = currentIndex >= studyCards.length;

  // Generate clues for current card
  const currentClues = useMemo<Clue[]>(() => {
    if (!currentCard) return [];
    const deck = decks.find(d => d.id === currentCard.deckId);
    return generateClues({
      card: currentCard,
      deck,
      allCards: cards,
      allDecks: decks,
    });
  }, [currentCard, cards, decks]);

  const deck = deckId ? decks.find(d => d.id === deckId) : null;

  useEffect(() => {
    if (studyCards.length > 0 && !currentStudySession) {
      startStudySession(deckId || 'all');
    }
  }, [studyCards.length, deckId]);

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return;
    
    const timeSpent = Date.now() - startTime;
    // Count clues shown as hints used
    const cluesShown = showClues ? currentClues.length : 0;
    recordReview(currentCard.id, correct, timeSpent, hintsUsed + cluesShown);
    
    setSessionStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
    setIsFlipped(false);
    setShowClues(true);
    setHintsUsed(0);
    setStartTime(Date.now());
  };

  const handleClueFeedback = (clueId: string, helpful: boolean) => {
    if (currentCard) {
      logClueFeedback(currentCard.id, clueId, helpful);
      if (helpful) {
        setHintsUsed(prev => prev + 1);
      }
    }
  };

  const handleFinish = () => {
    endStudySession();
    navigate('/');
  };

  if (studyCards.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
        <Card className="glass border-border/50 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              All caught up!
            </h2>
            <p className="text-muted-foreground mb-6">
              {deckId 
                ? "No cards due in this deck right now." 
                : boxLevel 
                  ? `No cards in Box ${boxLevel} to review.`
                  : "You have no cards due for review today."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/decks">
                <Button variant="glow" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Browse Decks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = sessionStats.correct + sessionStats.incorrect > 0
      ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
      : 0;

    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
        <Card className="glass border-border/50 max-w-md w-full overflow-hidden">
          <div className="h-2 bg-success" />
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Session Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Great work! Here's how you did:
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-3xl font-display font-bold text-foreground">{studyCards.length}</p>
                <p className="text-xs text-muted-foreground">Cards</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-3xl font-display font-bold text-success">{sessionStats.correct}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-3xl font-display font-bold text-primary">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => {
                setCurrentIndex(0);
                setSessionStats({ correct: 0, incorrect: 0 });
              }} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Study Again
              </Button>
              <Button variant="glow" onClick={handleFinish} className="gap-2">
                <Home className="w-4 h-4" />
                Finish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Study Session
          </h1>
          {deck && (
            <p className="text-muted-foreground mt-1">Studying: {deck.name}</p>
          )}
        </div>
        <Button variant="ghost" onClick={handleFinish}>
          End Session
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{currentIndex + 1} / {studyCards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard with Clue Balloons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clue Balloons - Left side on desktop, above on mobile */}
        <div className={`lg:col-span-1 order-2 lg:order-1 ${isFlipped ? 'opacity-50' : ''}`}>
          {!isFlipped && showClues && currentClues.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Clue Balloons
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClues(false)}
                  className="h-8 px-2 text-xs"
                >
                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                  Hide
                </Button>
              </div>
              <ClueBalloonContainer 
                clues={currentClues} 
                onFeedback={handleClueFeedback}
                maxVisible={3}
              />
            </div>
          )}
          
          {!isFlipped && !showClues && (
            <Button
              variant="outline"
              onClick={() => setShowClues(true)}
              className="w-full gap-2"
            >
              <Eye className="w-4 h-4" />
              Show Clue Balloons
            </Button>
          )}
        </div>

        {/* Flashcard - Center/Right */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="perspective-1000">
            <Card 
              className={`glass border-border/50 min-h-[350px] cursor-pointer transition-all duration-500 ${
                isFlipped ? 'shadow-glow' : ''
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[350px] relative">
                {/* Card Level Badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: `hsl(var(--box-${currentCard.boxLevel}))`,
                      color: `hsl(var(--box-${currentCard.boxLevel}))`
                    }}
                  >
                    Box {currentCard.boxLevel}
                  </Badge>
                </div>

                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {currentCard.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {isFlipped ? 'Answer' : 'Click to flip'}
                  </span>
                </div>

                {/* Card Content */}
                <div className="text-center">
                  <p className="text-3xl font-display font-bold text-foreground">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                  
                  {/* Answer side hints (original card hints) */}
                  {isFlipped && currentCard.hints && currentCard.hints.length > 0 && (
                    <div className="mt-6 space-y-2 animate-fade-in">
                      {currentCard.hints.map((hint, i) => (
                        <div 
                          key={i}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                        >
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {!isFlipped ? (
              <Button variant="glow" onClick={() => setIsFlipped(true)} className="gap-2 px-8">
                Reveal Answer
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleAnswer(false)}
                  className="gap-2 px-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-5 h-5" />
                  Incorrect
                </Button>
                <Button 
                  variant="success"
                  onClick={() => handleAnswer(true)}
                  className="gap-2 px-8"
                >
                  <Check className="w-5 h-5" />
                  Correct
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Correct: {sessionStats.correct}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Incorrect: {sessionStats.incorrect}</span>
        </div>
      </div>
    </div>
  );
}
