import React, { useEffect, useState, useMemo, memo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import graphApiService from '../services/graphApi';

// Suppress React Flow warning
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  let suppressCount = 0;
  
  console.warn = (...args) => {
    if (args[0]?.includes?.('nodeTypes or edgeTypes')) {
      suppressCount++;
      if (suppressCount > 3) return;
    }
    originalWarn.apply(console, args);
  };
}

const GraphVisualization = memo(({ decision_id }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState(null);

  // ✅ Function to load graph data
  const loadGraphData = async (isPolling = false) => {
    if (!decision_id) {
      setError('No decision ID provided');
      setLoading(false);
      return;
    }

    try {
      if (!isPolling) setLoading(true);
      setError(null);

      console.log(`📊 Loading graph data for decision: ${decision_id}${isPolling ? ' (polling)' : ''}`);

      const timeline = await graphApiService.getDecisionTimeline(decision_id);
      console.log('✅ Timeline loaded:', timeline);

      const graphStats = await graphApiService.getGraphStats();
      console.log('✅ Graph stats loaded:', graphStats);
      
      setStats(graphStats);
      setTimelineData(timeline);
    } catch (err) {
      console.error('❌ Failed to load graph data:', err);
      setError(`Failed to load graph data: ${err.message || 'Unknown error'}`);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  // ✅ Load data on mount and when decision_id changes
  useEffect(() => {
    loadGraphData(false);
  }, [decision_id]);

  // ✅ Poll for new events every 2 seconds
  useEffect(() => {
    if (!decision_id) return;

    console.log('🔄 Starting auto-poll for new events...');
    
    const pollInterval = setInterval(() => {
      loadGraphData(true);
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log('🛑 Stopping auto-poll');
      clearInterval(pollInterval);
    };
  }, [decision_id]);

  // ✅ Memoize nodes creation
  const memoizedNodes = useMemo(() => {
    if (!timelineData || !timelineData.timeline) return [];

    console.log('🔄 Recreating nodes from timeline');

    const newNodes = [];

    // Decision node
    newNodes.push({
      id: `decision-${timelineData.decision_id}`,
      data: {
        label: (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <strong>{timelineData.decision_title || 'Decision'}</strong>
          </div>
        ),
      },
      position: { x: 250, y: 25 },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #1e40af',
        borderRadius: 8,
        width: 220,
      },
    });

    // Event nodes
    timelineData.timeline.forEach((event, idx) => {
      newNodes.push({
        id: `event-${event.event_id || idx}`,
        data: {
          label: (
            <div style={{ textAlign: 'center', padding: 8 }}>
              <div style={{ fontWeight: 'bold' }}>
                {event.event_type || 'Event'}
              </div>
              <div style={{ fontSize: 12 }}>
                {event.description || 'No description'}
              </div>
              <div style={{ fontSize: 10, color: '#718096', marginTop: 4 }}>
                {event.timestamp
                  ? new Date(event.timestamp).toLocaleString()
                  : 'No date'}
              </div>
            </div>
          ),
        },
        position: { x: 250, y: 125 + idx * 100 },
        style: {
          background: '#059669',
          color: 'white',
          border: '2px solid #047857',
          borderRadius: 8,
          width: 200,
        },
      });
    });

    console.log('✅ Created nodes:', newNodes.length);
    return newNodes;
  }, [timelineData]);

  // ✅ Memoize edges creation
  const memoizedEdges = useMemo(() => {
    if (!timelineData || !timelineData.timeline) return [];

    console.log('🔄 Recreating edges from timeline');

    const newEdges = [];

    timelineData.timeline.forEach((event, idx) => {
      // Edge from decision to event
      newEdges.push({
        id: `edge-decision-event-${event.event_id || idx}`,
        source: `decision-${timelineData.decision_id}`,
        target: `event-${event.event_id || idx}`,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed' },
        label: 'HAS_EVENT',
        labelStyle: { fill: '#3b82f6', fontWeight: 'bold', fontSize: 12 },
      });

      // Edge between consecutive events (temporal)
      if (idx > 0) {
        newEdges.push({
          id: `edge-event-${idx - 1}-${idx}`,
          source: `event-${timelineData.timeline[idx - 1].event_id || idx - 1}`,
          target: `event-${event.event_id || idx}`,
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          markerEnd: { type: 'arrowclosed' },
        });
      }
    });

    console.log('✅ Created edges:', newEdges.length);
    return newEdges;
  }, [timelineData]);

  // ✅ Update nodes/edges when memoized values change
  useEffect(() => {
    if (memoizedNodes.length > 0) {
      console.log('📍 Updating React Flow with new nodes/edges');
      setNodes(memoizedNodes);
      setEdges(memoizedEdges);
    }
  }, [memoizedNodes, memoizedEdges, setNodes, setEdges]);

  if (loading)
    return (
      <div
        style={{
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Loading decision graph...</p>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          height: 200,
          color: 'red',
          textAlign: 'center',
          paddingTop: 20,
          backgroundColor: '#ffe6e6',
          borderRadius: 8,
          border: '1px solid red',
        }}
      >
        <p>❌ {error}</p>
      </div>
    );

  return (
    <div style={{ height: 400, border: '1px solid #ddd', borderRadius: 8 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background gap={16} color="#aaa" />
        <Controls />
        <MiniMap
          nodeColor={(node) =>
            node.id.startsWith('decision') ? '#3b82f6' : '#059669'
          }
        />
        <Panel
          position="top-left"
          style={{
            padding: 4,
            backgroundColor: 'white',
            borderRadius: 4,
            border: '1px solid #ddd',
            fontSize: 12,
          }}
        >
          <div>Decisions: {stats?.decisions_in_graph ?? '-'}</div>
          <div>Events: {stats?.events_in_graph ?? '-'}</div>
          <div>Relationships: {stats?.relationships ?? '-'}</div>
          <div style={{ fontSize: 10, marginTop: 4, color: '#666' }}>
            Auto-polling every 2s
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
});

GraphVisualization.displayName = 'GraphVisualization';

export default GraphVisualization;
