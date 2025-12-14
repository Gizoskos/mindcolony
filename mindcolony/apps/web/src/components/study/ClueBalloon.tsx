import { useState } from 'react';
import { 
  Network, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  Archive, 
  Target,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ClueType = 'graph' | 'semantic' | 'rag' | 'difficulty' | 'box' | 'cluster';

export interface Clue {
  id: string;
  text: string;
  type: ClueType;
  weight: number;
  expanded?: string;
}

interface ClueBalloonProps {
  clue: Clue;
  onFeedback?: (clueId: string, helpful: boolean) => void;
  delay?: number;
}

const clueTypeConfig: Record<ClueType, { 
  icon: typeof Network; 
  color: string; 
  label: string;
  bgClass: string;
  borderClass: string;
}> = {
  graph: {
    icon: Network,
    color: 'text-blue-400',
    label: 'Related Concepts',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
  },
  semantic: {
    icon: Brain,
    color: 'text-purple-400',
    label: 'Semantic Hint',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
  },
  rag: {
    icon: BookOpen,
    color: 'text-green-400',
    label: 'Context',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
  },
  difficulty: {
    icon: TrendingUp,
    color: 'text-amber-400',
    label: 'Progress Insight',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  box: {
    icon: Archive,
    color: 'text-cyan-400',
    label: 'Learning Stage',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
  },
  cluster: {
    icon: Target,
    color: 'text-rose-400',
    label: 'Focus Area',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
  },
};

export function ClueBalloon({ clue, onFeedback, delay = 0 }: ClueBalloonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  
  const config = clueTypeConfig[clue.type];
  const Icon = config.icon;

  const handleFeedback = (helpful: boolean) => {
    setFeedback(helpful ? 'helpful' : 'not-helpful');
    onFeedback?.(clue.id, helpful);
  };

  return (
    <div 
      className={cn(
        "group relative animate-fade-in transition-all duration-300",
        "rounded-2xl border backdrop-blur-sm",
        config.bgClass,
        config.borderClass,
        isExpanded ? "p-4" : "px-4 py-3"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          config.bgClass
        )}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {config.label}
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {clue.text}
          </p>
          
          {/* Expanded content */}
          {clue.expanded && isExpanded && (
            <p className="mt-2 text-sm text-muted-foreground italic animate-fade-in">
              {clue.expanded}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {clue.expanded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          
          {onFeedback && !feedback && (
            <>
              <button
                onClick={() => handleFeedback(true)}
                className="p-1.5 rounded-full hover:bg-green-500/20 transition-colors"
                aria-label="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground hover:text-green-400" />
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="p-1.5 rounded-full hover:bg-rose-500/20 transition-colors"
                aria-label="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-400" />
              </button>
            </>
          )}
          
          {feedback && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              feedback === 'helpful' ? "bg-green-500/20 text-green-400" : "bg-rose-500/20 text-rose-400"
            )}>
              {feedback === 'helpful' ? '👍' : '👎'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ClueBalloonContainerProps {
  clues: Clue[];
  onFeedback?: (clueId: string, helpful: boolean) => void;
  maxVisible?: number;
}

export function ClueBalloonContainer({ 
  clues, 
  onFeedback, 
  maxVisible = 3 
}: ClueBalloonContainerProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleClues = showAll ? clues : clues.slice(0, maxVisible);
  const hiddenCount = clues.length - maxVisible;

  return (
    <div className="space-y-3 w-full max-w-xl">
      {visibleClues.map((clue, index) => (
        <ClueBalloon 
          key={clue.id} 
          clue={clue} 
          onFeedback={onFeedback}
          delay={index * 100}
        />
      ))}
      
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/30"
        >
          Show {hiddenCount} more clue{hiddenCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
