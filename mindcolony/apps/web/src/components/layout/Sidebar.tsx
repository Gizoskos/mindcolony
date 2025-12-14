import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Library, 
  Box, 
  Brain, 
  BarChart3, 
  Settings,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/decks', label: 'Decks', icon: Library },
  { path: '/boxes', label: 'Card Boxes', icon: Box },
  { path: '/study', label: 'Study', icon: Brain },
  { path: '/graph', label: 'Mind Map', icon: Sparkles },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:shadow-glow-sm transition-all duration-300">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">ColonyMind</h1>
              <p className="text-xs text-muted-foreground">Adaptive Learning</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
