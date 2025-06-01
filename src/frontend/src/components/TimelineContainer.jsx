// filepath: missionplanning/src/frontend/src/components/timelinecontainer.jsx
import { useState, useEffect } from 'react';
import GanttChart from './GanttChart.jsx';

export default function TimelineContainer({ events = [], satellites = [] }) {
  const [timeView, setTimeView] = useState('day');

  useEffect(() => {
    console.log('React loaded');
  }, []);

  return (
    <div className="w-full">
      <GanttChart 
        events={events}
        satellites={satellites}
        timeView={timeView}
        onTimeViewChange={setTimeView}
      />
    </div>
  );
}