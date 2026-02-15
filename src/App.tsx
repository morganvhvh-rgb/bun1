// Notice we use '@' instead of relative paths
import { cn } from '@/lib/utils';

export default function App() {
  const isDamaged = true;

  return (
    <div className={cn(
      "w-full h-screen flex items-center justify-center bg-black text-white", // Base styles
      isDamaged && "bg-red-900" // Conditional style that merges safely
    )}>
      <h1>Game Ready</h1>
    </div>
  )
}


