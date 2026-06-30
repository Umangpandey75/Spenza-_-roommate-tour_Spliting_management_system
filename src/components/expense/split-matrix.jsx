import React, { useState, useCallback } from 'react';

export const SplitMatrix = React.memo(function SplitMatrix({ participants, weights, onChange }) {
  const [localWeights, setLocalWeights] = useState(weights);

  const handleWeightChange = useCallback((id, value) => {
    const updated = { ...localWeights, [id]: Number(value) };
    setLocalWeights(updated);
    onChange(updated);
  }, [localWeights, onChange]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {participants.map((p) => (
        <div key={p.id} className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 p-2 sm:p-0 rounded-lg sm:rounded-none bg-muted/50 sm:bg-transparent">
          <span className="text-foreground font-medium truncate flex-1 text-sm sm:text-base">{p.name}</span>
          <input
            type="number"
            min={0}
            value={localWeights[p.id] || 1}
            onChange={(e) => handleWeightChange(p.id, e.target.value)}
            className="w-16 sm:w-20 px-2 sm:px-3 py-2 rounded bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors min-h-[44px] text-center"
          />
        </div>
      ))}
    </div>
  );
});
