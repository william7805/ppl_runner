import Link from 'next/link'
import type { Activity } from '@/db/schema'
import { formatDistance, formatDuration, formatShortDate } from '@/lib/format'
import { formatPace } from '@/lib/pace'

export function RecentRuns({ runs }: { runs: Activity[] }) {
  return (
    // Liste défilante : tabIndex pour pouvoir la faire défiler au clavier
    <div
      tabIndex={0}
      className="max-h-96 overflow-y-auto rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-slate-900 text-white/60">
          <tr>
            <th scope="col" className="py-2 pr-2 font-normal">
              Date
            </th>
            <th scope="col" className="py-2 pr-2 font-normal">
              Distance
            </th>
            <th scope="col" className="py-2 pr-2 font-normal">
              Durée
            </th>
            <th scope="col" className="py-2 pr-2 font-normal">
              Allure
            </th>
            <th scope="col" className="py-2 font-normal">
              FC moy.
            </th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="border-t border-white/10">
              <td className="py-2 pr-2">
                <Link
                  href={`/activities/${run.id}`}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {formatShortDate(run.startedAt)}
                </Link>
              </td>
              <td className="py-2 pr-2">
                {run.distanceMeters !== null
                  ? formatDistance(run.distanceMeters)
                  : 'n/a'}
              </td>
              <td className="py-2 pr-2">
                {formatDuration(run.durationSeconds)}
              </td>
              <td className="py-2 pr-2">
                {run.distanceMeters
                  ? (formatPace(run.distanceMeters, run.durationSeconds) ??
                    'n/a')
                  : 'n/a'}
              </td>
              <td className="py-2">
                {run.avgHeartRate !== null ? `${run.avgHeartRate} bpm` : 'n/a'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
