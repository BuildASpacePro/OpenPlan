// filepath: missionplanning/src/frontend/src/components/timelinecontainer.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import ViewToggle from './ViewToggle.jsx';

const GanttChart = lazy(() => import('./GanttChart.jsx'));
const TimelineTable = lazy(() => import('./TimelineTable.jsx'));

export default function TimelineContainer({ events = [], satellites = [] }) {
  const [timeView, setTimeView] = useState('day');
  const [displayView, setDisplayView] = useState('timeline');

  useEffect(() => {
    console.log('React loaded');
  }, []);

  const viewOptions = [
    { key: 'timeline', label: 'Timeline', icon: 'timeline' },
    { key: 'table', label: 'Table', icon: 'table' }
  ];

  return (
    <div className="w-full space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <ViewToggle 
          currentView={displayView}
          onViewChange={setDisplayView}
          views={viewOptions}
        />
      </div>

      {/* Content based on selected view */}
      {displayView === 'timeline' ? (
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded flex items-center justify-center"><span className="text-gray-500">Loading timeline...</span></div>}>
          <GanttChart 
            events={events}
            satellites={satellites}
            timeView={timeView}
            onTimeViewChange={setTimeView}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded flex items-center justify-center"><span className="text-gray-500">Loading table...</span></div>}>
          <TimelineTable 
            events={events}
          />
        </Suspense>
      )}
    </div>
  );
}