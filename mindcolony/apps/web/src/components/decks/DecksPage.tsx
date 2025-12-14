import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  BookOpen, 
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react';

const deckColors = [
  '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4'
];

export function DecksPage() {
  const { decks, addDeck, deleteDeck, getCardsByDeck } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(deckColors[0]);

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      addDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
        color: selectedColor,
      });
      setNewDeckName('');
      setNewDeckDescription('');
      setSelectedColor(deckColors[0]);
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground">Your Decks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flashcard collections
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="glow" className="gap-2">
              <Plus className="w-4 h-4" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground">Deck Name</label>
                <Input
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g., Spanish Vocabulary"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <Textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="What will you learn with this deck?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Color</label>
                <div className="flex gap-2 mt-2">
                  {deckColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateDeck} className="w-full" variant="glow">
                Create Deck
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search decks..."
          className="pl-10"
        />
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map((deck, index) => {
          const deckCards = getCardsByDeck(deck.id);
          const masteredCount = deckCards.filter(c => c.boxLevel >= 4).length;
          const masteryPercent = deckCards.length > 0 
            ? Math.round((masteredCount / deckCards.length) * 100) 
            : 0;

          return (
            <Card 
              key={deck.id} 
              className="glass border-border/50 group hover:shadow-glow-sm transition-all duration-300 animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="h-2"
                style={{ backgroundColor: deck.color }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg"
                      style={{ backgroundColor: deck.color }}
                    >
                      {deck.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="font-display text-lg">{deck.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{deck.cardCount} cards</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => deleteDeck(deck.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {deck.description || 'No description'}
                </p>
                
                {/* Mastery Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="text-primary font-medium">{masteryPercent}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${masteryPercent}%`,
                        backgroundColor: deck.color,
                        boxShadow: `0 0 10px ${deck.color}50`
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/decks/${deck.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <BookOpen className="w-4 h-4" />
                      View Cards
                    </Button>
                  </Link>
                  <Link to={`/study?deck=${deck.id}`}>
                    <Button variant="default" className="gap-2">
                      Study
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDecks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            {searchQuery ? 'No decks found' : 'No decks yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try a different search term' : 'Create your first deck to start learning'}
          </p>
          {!searchQuery && (
            <Button variant="glow" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deck
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
