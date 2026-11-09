'use client'

import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RunPoint, WeeklyDistance } from '@/lib/stats'

// Couleurs de l'île : violet pour la course, bleu ciel pour la FC.
// La FC est aussi en pointillés : les deux courbes se distinguent sans couleur.
const RUN_COLOR = '#a78bfa' // violet-400
const HEART_COLOR = '#7dd3fc' // sky-300
const GRID_COLOR = 'rgba(255, 255, 255, 0.1)'
const AXIS_COLOR = 'rgba(255, 255, 255, 0.6)'

const tooltipStyle = {
  backgroundColor: '#0f172a', // slate-900
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  color: '#fff',
}

/** 332 → "5:32" */
function formatPaceSeconds(seconds: number): string {
  // On arrondit d'abord le total pour ne jamais afficher "5:60"
  const total = Math.round(seconds)
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

type Tab = 'volume' | 'pace'

export function ProgressCharts({
  weekly,
  runs,
}: {
  weekly: WeeklyDistance[]
  runs: RunPoint[]
}) {
  const [tab, setTab] = useState<Tab>('volume')

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <TabButton active={tab === 'volume'} onClick={() => setTab('volume')}>
          Km par semaine
        </TabButton>
        <TabButton active={tab === 'pace'} onClick={() => setTab('pace')}>
          Allure et FC
        </TabButton>
      </div>

      <div className="h-64">
        {tab === 'volume' ? (
          <WeeklyChart data={weekly} />
        ) : runs.length > 1 ? (
          <PaceChart data={runs} />
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-white/50">
            Il faut au moins deux courses pour voir une évolution.
          </p>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border border-white/20 px-3 py-1 text-sm font-semibold transition hover:border-white aria-pressed:border-violet-400 aria-pressed:bg-violet-600"
    >
      {children}
    </button>
  )
}

function WeeklyChart({ data }: { data: WeeklyDistance[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          contentStyle={tooltipStyle}
          labelFormatter={(label) => `Semaine du ${label}`}
          formatter={(value) => [`${value} km`, 'Distance']}
        />
        <Line
          type="monotone"
          dataKey="km"
          stroke={RUN_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function PaceChart({ data }: { data: RunPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 0, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        {/* Axe inversé : une allure plus rapide (moins de secondes) monte */}
        <YAxis
          yAxisId="pace"
          reversed
          domain={['dataMin - 15', 'dataMax + 15']}
          tickFormatter={formatPaceSeconds}
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="heart"
          orientation="right"
          domain={['dataMin - 5', 'dataMax + 5']}
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) =>
            name === 'Allure'
              ? [`${formatPaceSeconds(Number(value))} /km`, name]
              : [`${value} bpm`, name]
          }
        />
        <Legend wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
        <Line
          yAxisId="pace"
          type="monotone"
          dataKey="paceSeconds"
          name="Allure"
          stroke={RUN_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          yAxisId="heart"
          type="monotone"
          dataKey="avgHeartRate"
          name="FC moyenne"
          stroke={HEART_COLOR}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
