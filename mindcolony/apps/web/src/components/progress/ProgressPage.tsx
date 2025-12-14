import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  Target,
  Calendar,
  Award,
  BarChart3,
  Flame
} from 'lucide-react';

export function ProgressPage() {
  const { cards, sessions, decks } = useStore();

  // Calculate stats
  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.boxLevel >= 4).length;
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const totalReviews = cards.reduce((acc, c) => acc + c.reviewCount, 0);
  const totalCorrect = cards.reduce((acc, c) => acc + c.correctCount, 0);
  const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Cards by difficulty
  const difficultyBreakdown = {
    new: cards.filter(c => c.difficulty === 'new').length,
    hard: cards.filter(c => c.difficulty === 'hard').length,
    medium: cards.filter(c => c.difficulty === 'medium').length,
    easy: cards.filter(c => c.difficulty === 'easy').length,
    mastered: cards.filter(c => c.difficulty === 'mastered').length,
  };

  // Deck progress
  const deckProgress = decks.map(deck => {
    const deckCards = cards.filter(c => c.deckId === deck.id);
    const mastered = deckCards.filter(c => c.boxLevel >= 4).length;
    return {
      ...deck,
      total: deckCards.length,
      mastered,
      progress: deckCards.length > 0 ? Math.round((mastered / deckCards.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary" />
          Your Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your learning journey
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Cards</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{totalCards}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Mastered</p>
                <p className="text-3xl font-display font-bold text-success mt-1">{masteredCards}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Reviews</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{totalReviews}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Accuracy</p>
                <p className="text-3xl font-display font-bold text-primary mt-1">{overallAccuracy}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mastery Progress */}
      <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Overall Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Progress to full mastery</span>
              <span className="text-2xl font-display font-bold text-gradient">{masteryRate}%</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-box-1 via-box-3 to-box-5"
                style={{ width: `${masteryRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {masteredCards} of {totalCards} cards mastered (Box 4+)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle className="font-display">Difficulty Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(difficultyBreakdown).map(([difficulty, count], index) => {
              const boxLevel = index + 1;
              const percentage = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
              return (
                <div key={difficulty} className="text-center">
                  <div 
                    className="h-32 rounded-lg flex items-end justify-center p-2 mb-2"
                    style={{ 
                      background: `linear-gradient(180deg, hsl(var(--box-${boxLevel}) / 0.2), hsl(var(--box-${boxLevel}) / 0.05))`,
                      border: `1px solid hsl(var(--box-${boxLevel}) / 0.3)`
                    }}
                  >
                    <div 
                      className="w-full rounded transition-all duration-500"
                      style={{ 
                        height: `${Math.max(10, percentage)}%`,
                        background: `hsl(var(--box-${boxLevel}))`,
                        boxShadow: `0 0 20px hsl(var(--box-${boxLevel}) / 0.3)`
                      }}
                    />
                  </div>
                  <p className="text-lg font-display font-bold" style={{ color: `hsl(var(--box-${boxLevel}))` }}>
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{difficulty}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Deck Progress */}
      <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="font-display">Progress by Deck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {deckProgress.map((deck) => (
            <div key={deck.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: deck.color }}
                  >
                    {deck.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{deck.name}</p>
                    <p className="text-xs text-muted-foreground">{deck.mastered} / {deck.total} mastered</p>
                  </div>
                </div>
                <span className="text-lg font-display font-bold" style={{ color: deck.color }}>
                  {deck.progress}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${deck.progress}%`,
                    backgroundColor: deck.color,
                    boxShadow: `0 0 10px ${deck.color}50`
                  }}
                />
              </div>
            </div>
          ))}

          {deckProgress.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No decks yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
