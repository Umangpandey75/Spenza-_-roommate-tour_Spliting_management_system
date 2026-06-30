'use client';

import React from 'react';
import { WhatIfPanel } from '../what-if/what-if-panel';

export function WhatIf({ group, originalBalances, originalSettlements }) {
  return (
    <WhatIfPanel
      group={group}
      originalBalances={originalBalances}
      originalSettlements={originalSettlements}
    />
  );
}