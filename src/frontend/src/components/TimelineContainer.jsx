// filepath: missionplanning/src/frontend/src/components/timelinecontainer.jsx
import { useState, useEffect } from 'react';
import GanttChart from './GanttChart.jsx';
import TimelineTable from './TimelineTable.jsx';
import ViewToggle from './ViewToggle.jsx';

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
        <GanttChart 
          events={events}
          satellites={satellites}
          timeView={timeView}
          onTimeViewChange={setTimeView}
        />
      ) : (
        <TimelineTable 
          events={events}
        />
      )}
    </div>
  );
}