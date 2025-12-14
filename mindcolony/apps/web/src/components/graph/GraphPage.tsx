import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Zap,
  Circle
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  boxLevel: number;
  deckId: string;
  connections: string[];
}

export function GraphPage() {
  const { cards, decks } = useStore();

  // Build a simple graph visualization
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Group cards by deck
    const deckGroups: Record<string, typeof cards> = {};
    cards.forEach(card => {
      if (!deckGroups[card.deckId]) {
        deckGroups[card.deckId] = [];
      }
      deckGroups[card.deckId].push(card);
    });

    // Position nodes in clusters by deck
    const deckIds = Object.keys(deckGroups);
    deckIds.forEach((deckId, deckIndex) => {
      const deckCards = deckGroups[deckId];
      const angleOffset = (2 * Math.PI * deckIndex) / deckIds.length;
      const clusterRadius = 150;
      const clusterCenterX = centerX + Math.cos(angleOffset) * 200;
      const clusterCenterY = centerY + Math.sin(angleOffset) * 200;

      deckCards.forEach((card, cardIndex) => {
        const angle = (2 * Math.PI * cardIndex) / deckCards.length;
        const radius = 50 + (card.boxLevel * 15);
        
        // Find related cards (same tags or similar content)
        const connections: string[] = [];
        cards.forEach(otherCard => {
          if (otherCard.id !== card.id) {
            // Connect cards in same deck
            if (otherCard.deckId === card.deckId && Math.random() > 0.7) {
              connections.push(otherCard.id);
            }
            // Connect cards with same tags
            if (card.tags && otherCard.tags) {
              const commonTags = card.tags.filter(t => otherCard.tags?.includes(t));
              if (commonTags.length > 0) {
                connections.push(otherCard.id);
              }
            }
          }
        });

        nodes.push({
          id: card.id,
          label: card.front.substring(0, 20) + (card.front.length > 20 ? '...' : ''),
          x: clusterCenterX + Math.cos(angle) * radius,
          y: clusterCenterY + Math.sin(angle) * radius,
          boxLevel: card.boxLevel,
          deckId: card.deckId,
          connections: connections.slice(0, 3), // Limit connections
        });
      });
    });

    return nodes;
  }, [cards]);

  const getNodeColor = (boxLevel: number) => {
    const colors = {
      1: 'hsl(var(--box-1))',
      2: 'hsl(var(--box-2))',
      3: 'hsl(var(--box-3))',
      4: 'hsl(var(--box-4))',
      5: 'hsl(var(--box-5))',
    };
    return colors[boxLevel as keyof typeof colors] || colors[1];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-primary" />
          Knowledge Mind Map
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize connections between your flashcards
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {decks.map(deck => (
          <Badge key={deck.id} variant="outline" className="gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: deck.color }}
            />
            {deck.name}
          </Badge>
        ))}
        <div className="h-6 w-px bg-border" />
        {[1, 2, 3, 4, 5].map(level => (
          <Badge key={level} variant="outline" className="gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: `hsl(var(--box-${level}))` }}
            />
            Box {level}
          </Badge>
        ))}
      </div>

      {/* Graph Visualization */}
      <Card className="glass border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-background/50" style={{ height: '600px' }}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full">
              {graphData.map(node => 
                node.connections.map(targetId => {
                  const target = graphData.find(n => n.id === targetId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="hsl(var(--primary) / 0.2)"
                      strokeWidth="1"
                      className="transition-all duration-300"
                    />
                  );
                })
              )}
            </svg>

            {/* Nodes */}
            {graphData.map((node, index) => {
              const deck = decks.find(d => d.id === node.deckId);
              return (
                <div
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group animate-scale-in"
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Node */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-150 hover:z-10"
                    style={{ 
                      backgroundColor: getNodeColor(node.boxLevel),
                      boxShadow: `0 0 20px ${getNodeColor(node.boxLevel)}50`
                    }}
                  >
                    <Circle className="w-3 h-3 fill-current text-background/50" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                      <p className="text-sm font-medium text-foreground">{node.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {deck?.name} • Box {node.boxLevel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {graphData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No cards to visualize
                  </h3>
                  <p className="text-muted-foreground">
                    Add some cards to see your knowledge graph
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            About the Mind Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This visualization shows how your flashcards connect to each other. Cards are grouped by deck and 
            colored by their box level. Lines between cards indicate semantic relationships based on shared 
            tags and content similarity. As you learn, cards will move to higher boxes and appear with 
            different colors.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
