import { useState } from 'react';

/**
 * GanttChart React component
 * @param {Object[]} events - Array of event objects with satellite_name, activity_type, duration, planned_time, colour
 * @param {string[]} satellites - Array of satellite names
 * @param {string} timeView - 'hour' | 'day' | 'week' | 'month'
 * @param {function} onTimeViewChange - callback for time view change
 */
export default function GanttChart({ events, satellites, timeView, onTimeViewChange }) {
  // Calculate time range
  const [scrollOffset, setScrollOffset] = useState(0);
  const timeViewOptions = [
    { label: '1 Hour', value: 'hour' },
    { label: '1 Day', value: 'day' },
    { label: '1 Week', value: 'week' },
    { label: '1 Month', value: 'month' },
  ];

  // Helper to get time window in ms
  const getWindowMs = (view) => {
    switch (view) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  // Find min and max event times
  const eventTimes = events.map(e => new Date(e.planned_time).getTime());
  const minTime = Math.min(...eventTimes);
  const maxTime = Math.max(...eventTimes);

  // Current window start
  const windowMs = getWindowMs(timeView);
  const windowStart = minTime + scrollOffset;
  const windowEnd = windowStart + windowMs;

  // Scroll handlers
  const scrollLeft = () => setScrollOffset(Math.max(scrollOffset - windowMs / 2, 0));
  const scrollRight = () => setScrollOffset(Math.min(scrollOffset + windowMs / 2, Math.max(0, maxTime - minTime - windowMs)));

  // Render
  return (
    <div className="gantt-chart">
      <div className="flex items-center mb-4">
        <button onClick={scrollLeft} className="px-2 py-1 bg-gray-200 rounded mr-2">◀</button>
        <button onClick={scrollRight} className="px-2 py-1 bg-gray-200 rounded mr-4">▶</button>
        <span className="mr-2">View:</span>
        <select value={timeView} onChange={e => onTimeViewChange(e.target.value)} className="border rounded px-2 py-1">
          {timeViewOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 border-r px-4 py-2">Satellite</th>
              <th className="text-left px-4 py-2">Timeline</th>
            </tr>
          </thead>
          <tbody>
            {satellites.map(sat => (
              <tr key={sat}>
                <td className="sticky left-0 bg-white z-10 border-r px-4 py-2 font-bold">{sat}</td>
                <td className="relative h-12 min-w-[600px]">
                  {events.filter(e => e.satellite_name === sat && new Date(e.planned_time).getTime() >= windowStart && new Date(e.planned_time).getTime() <= windowEnd)
                    .map(e => {
                      // Position and width
                      const start = new Date(e.planned_time).getTime();
                      const left = ((start - windowStart) / windowMs) * 100;
                      const width = Math.max((e.duration * 60 * 1000) / windowMs * 100, 2); // duration in minutes
                      return (
                        <div
                          key={e.event_id}
                          className="absolute top-1 h-8 rounded text-xs text-white flex items-center justify-center shadow"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            background: e.colour || '#888',
                            minWidth: '40px',
                          }}
                          title={`${e.activity_type} (${e.duration} min) @ ${e.planned_time}`}
                        >
                          {e.activity_type}
                        </div>
                      );
                    })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
