import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Box, 
  ChevronRight,
  Brain,
  Sparkles
} from 'lucide-react';

const boxInfo = [
  { level: 1, name: 'New', description: 'Cards you just started learning', interval: 'Daily review' },
  { level: 2, name: 'Learning', description: 'Cards you\'re actively learning', interval: 'Every 3 days' },
  { level: 3, name: 'Reviewing', description: 'Cards in regular review', interval: 'Weekly' },
  { level: 4, name: 'Familiar', description: 'Cards you know well', interval: 'Every 2 weeks' },
  { level: 5, name: 'Mastered', description: 'Cards you\'ve mastered', interval: 'Monthly' },
];

export function BoxesPage() {
  const { cards, getCardsInBox, decks } = useStore();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-foreground">Card Boxes</h1>
        <p className="text-muted-foreground mt-2">
          The Leitner system organizes cards by how well you know them
        </p>
      </div>

      {/* Explanation Card */}
      <Card className="glass border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                How the Box System Works
              </h3>
              <p className="text-muted-foreground">
                When you answer a card correctly, it moves up to the next box and is reviewed less frequently. 
                If you answer incorrectly, it moves back down. This ensures you spend more time on cards you 
                find difficult while maintaining your knowledge of easier ones.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boxes Grid */}
      <div className="space-y-4">
        {boxInfo.map((box, index) => {
          const boxCards = getCardsInBox(box.level);
          const cardsByDeck: Record<string, number> = {};
          boxCards.forEach(card => {
            cardsByDeck[card.deckId] = (cardsByDeck[card.deckId] || 0) + 1;
          });

          return (
            <Card 
              key={box.level} 
              className="glass border-border/50 overflow-hidden group hover:shadow-glow-sm transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="h-1"
                style={{ backgroundColor: `hsl(var(--box-${box.level}))` }}
              />
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Box Icon */}
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      backgroundColor: `hsl(var(--box-${box.level}) / 0.2)`,
                      boxShadow: `0 0 30px hsl(var(--box-${box.level}) / 0.2)`
                    }}
                  >
                    <Box 
                      className="w-8 h-8" 
                      style={{ color: `hsl(var(--box-${box.level}))` }}
                    />
                  </div>

                  {/* Box Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        Box {box.level}: {box.name}
                      </h3>
                      <Badge 
                        variant="outline"
                        className="border-border"
                      >
                        {box.interval}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{box.description}</p>

                    {/* Cards in this box */}
                    {Object.keys(cardsByDeck).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(cardsByDeck).map(([deckId, count]) => {
                          const deck = decks.find(d => d.id === deckId);
                          if (!deck) return null;
                          return (
                            <Badge 
                              key={deckId}
                              variant="secondary"
                              className="gap-1"
                            >
                              <span 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: deck.color }}
                              />
                              {deck.name}: {count}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No cards in this box yet</p>
                    )}
                  </div>

                  {/* Card Count & Action */}
                  <div className="text-right shrink-0">
                    <p 
                      className="text-4xl font-display font-bold"
                      style={{ color: `hsl(var(--box-${box.level}))` }}
                    >
                      {boxCards.length}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">cards</p>
                    {boxCards.length > 0 && (
                      <Link to={`/study?box=${box.level}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Brain className="w-4 h-4" />
                          Study
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Stats */}
      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Total Cards</h3>
              <p className="text-muted-foreground">Across all boxes and decks</p>
            </div>
            <p className="text-5xl font-display font-bold text-gradient">{cards.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
