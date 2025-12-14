import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  ArrowLeft, 
  Brain, 
  Trash2,
  Edit,
  Box
} from 'lucide-react';

const difficultyColors = {
  new: 'bg-box-1/20 text-box-1 border-box-1/30',
  hard: 'bg-box-2/20 text-box-2 border-box-2/30',
  medium: 'bg-box-3/20 text-box-3 border-box-3/30',
  easy: 'bg-box-4/20 text-box-4 border-box-4/30',
  mastered: 'bg-box-5/20 text-box-5 border-box-5/30',
};

export function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { decks, cards, addCard, deleteCard, getCardsByDeck } = useStore();
  
  const deck = decks.find(d => d.id === deckId);
  const deckCards = deck ? getCardsByDeck(deck.id) : [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardHints, setNewCardHints] = useState('');

  if (!deck) {
    return (
      <div className="text-center py-16">
        <h2 className="font-display text-2xl font-bold text-foreground">Deck not found</h2>
        <Link to="/decks">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decks
          </Button>
        </Link>
      </div>
    );
  }

  const handleCreateCard = () => {
    if (newCardFront.trim() && newCardBack.trim()) {
      addCard({
        front: newCardFront.trim(),
        back: newCardBack.trim(),
        deckId: deck.id,
        boxLevel: 1,
        difficulty: 'new',
        nextReviewAt: new Date(),
        hints: newCardHints.split('\n').filter(h => h.trim()),
      });
      setNewCardFront('');
      setNewCardBack('');
      setNewCardHints('');
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/decks')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg"
          style={{ backgroundColor: deck.color }}
        >
          {deck.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-foreground">{deck.name}</h1>
          <p className="text-muted-foreground">{deck.description}</p>
        </div>
        <Link to={`/study?deck=${deck.id}`}>
          <Button variant="glow" className="gap-2">
            <Brain className="w-4 h-4" />
            Study This Deck
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((level) => {
          const count = deckCards.filter(c => c.boxLevel === level).length;
          return (
            <Card key={level} className="glass border-border/50">
              <CardContent className="p-4 text-center">
                <div 
                  className="w-10 h-10 rounded-lg mx-auto flex items-center justify-center mb-2"
                  style={{ backgroundColor: `hsl(var(--box-${level}) / 0.2)` }}
                >
                  <Box className="w-5 h-5" style={{ color: `hsl(var(--box-${level}))` }} />
                </div>
                <p className="text-2xl font-display font-bold" style={{ color: `hsl(var(--box-${level}))` }}>
                  {count}
                </p>
                <p className="text-xs text-muted-foreground">Box {level}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Card Button */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Cards ({deckCards.length})
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground">Front (Question)</label>
                <Textarea
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Enter the question or term..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Back (Answer)</label>
                <Textarea
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Enter the answer or definition..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Hints (one per line)</label>
                <Textarea
                  value={newCardHints}
                  onChange={(e) => setNewCardHints(e.target.value)}
                  placeholder="Add helpful hints..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateCard} className="w-full" variant="glow">
                Add Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {deckCards.map((card, index) => (
          <Card 
            key={card.id} 
            className="glass border-border/50 group hover:shadow-glow-sm transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `hsl(var(--box-${card.boxLevel}) / 0.2)` }}
                >
                  <span className="font-display font-bold" style={{ color: `hsl(var(--box-${card.boxLevel}))` }}>
                    {card.boxLevel}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{card.front}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{card.back}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge 
                        variant="outline" 
                        className={difficultyColors[card.difficulty]}
                      >
                        {card.difficulty}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => deleteCard(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {card.hints && card.hints.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {card.hints.map((hint, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          💡 {hint}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deckCards.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">No cards yet</h3>
          <p className="text-muted-foreground mb-6">Add your first card to start learning</p>
          <Button variant="glow" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Card
          </Button>
        </div>
      )}
    </div>
  );
}
