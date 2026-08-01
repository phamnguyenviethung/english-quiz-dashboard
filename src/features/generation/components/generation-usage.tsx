import { IconCpu, IconLogin, IconLogout } from "@tabler/icons-react"

import { StatTile, StatTileGrid } from "@/components/common/stat-tile.tsx"
import { formatNumber } from "@/lib/format.ts"

import type { GeneratedUsage } from "../types.ts"

export function GenerationUsage({ usage }: { usage: GeneratedUsage }) {
  return (
    <StatTileGrid className="sm:grid-cols-3 lg:grid-cols-3">
      <StatTile
        label="Token vào"
        value={formatNumber(usage.inputTokens)}
        icon={IconLogin}
      />
      <StatTile
        label="Token ra"
        value={formatNumber(usage.outputTokens)}
        icon={IconLogout}
      />
      <StatTile
        label="Model"
        value={<span className="font-mono text-sm">{usage.model}</span>}
        icon={IconCpu}
      />
    </StatTileGrid>
  )
}
