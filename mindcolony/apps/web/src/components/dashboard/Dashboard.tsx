import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Flame, 
  ChevronRight,
  Sparkles,
  Box,
  TrendingUp
} from 'lucide-react';

export function Dashboard() {
  const { cards, decks, getCardsDueToday, sessions } = useStore();
  const cardsDue = getCardsDueToday();
  
  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.boxLevel >= 4).length;
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  
  const todayReviews = sessions.filter(s => {
    const today = new Date();
    const sessionDate = new Date(s.startedAt);
    return sessionDate.toDateString() === today.toDateString();
  });
  
  const todayCardsReviewed = todayReviews.reduce((acc, s) => acc + s.cardsReviewed, 0);
  const todayCorrect = todayReviews.reduce((acc, s) => acc + s.correctAnswers, 0);
  const accuracy = todayCardsReviewed > 0 ? Math.round((todayCorrect / todayCardsReviewed) * 100) : 0;

  const boxStats = [1, 2, 3, 4, 5].map(level => ({
    level,
    count: cards.filter(c => c.boxLevel === level).length,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2">
            You have <span className="text-primary font-semibold">{cardsDue.length} cards</span> due for review today
          </p>
        </div>
        {cardsDue.length > 0 && (
          <Link to="/study">
            <Button variant="glow" size="lg" className="gap-2">
              <Brain className="w-5 h-5" />
              Start Studying
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Cards Due Today</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{cardsDue.length}</p>
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
                <p className="text-muted-foreground text-sm">Total Cards</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{totalCards}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Mastery Rate</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{masteryRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Today's Accuracy</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{accuracy}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Box Distribution */}
      <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            Card Box Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {boxStats.map(({ level, count }) => (
              <div key={level} className="text-center">
                <div 
                  className={`h-24 rounded-lg flex items-end justify-center p-2 transition-all duration-300 hover:scale-105`}
                  style={{ 
                    background: `linear-gradient(180deg, hsl(var(--box-${level}) / 0.2), hsl(var(--box-${level}) / 0.1))`,
                    border: `1px solid hsl(var(--box-${level}) / 0.3)`
                  }}
                >
                  <div 
                    className="w-full rounded transition-all duration-500"
                    style={{ 
                      height: `${Math.max(20, (count / Math.max(...boxStats.map(b => b.count), 1)) * 100)}%`,
                      background: `hsl(var(--box-${level}))`,
                      boxShadow: `0 0 20px hsl(var(--box-${level}) / 0.3)`
                    }}
                  />
                </div>
                <p className="text-2xl font-display font-bold mt-2" style={{ color: `hsl(var(--box-${level}))` }}>
                  {count}
                </p>
                <p className="text-xs text-muted-foreground">Box {level}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Decks */}
        <Card className="glass border-border/50 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Decks
            </CardTitle>
            <Link to="/decks">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {decks.slice(0, 3).map((deck) => (
              <Link 
                key={deck.id} 
                to={`/decks/${deck.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: deck.color }}
                >
                  {deck.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {deck.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{deck.cardCount} cards</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
            {decks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No decks yet</p>
                <Link to="/decks">
                  <Button variant="outline" className="mt-4">Create Your First Deck</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Tip */}
        <Card className="glass border-border/50 animate-slide-up overflow-hidden relative" style={{ animationDelay: '600ms' }}>
          <div className="absolute inset-0 bg-gradient-glow" />
          <CardHeader className="relative">
            <CardTitle className="font-display flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Learning Tip
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-foreground leading-relaxed">
              <span className="text-primary font-semibold">Spaced repetition</span> works best when you review cards right before you're about to forget them. ColonyMind adapts to your learning patterns to show you cards at the optimal moment.
            </p>
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                💡 Cards in higher boxes are reviewed less frequently but remembered longer!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
