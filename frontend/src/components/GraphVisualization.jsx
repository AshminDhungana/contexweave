import React, { useEffect, useState } from 'react';
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

export default function GraphVisualization({ decision_id }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Load graph data only once per decision_id
  useEffect(() => {
    if (!decision_id) return;

    const loadGraphData = async () => {
      try {
        setLoading(true);
        const timeline = await graphApiService.getDecisionTimeline(decision_id);
        const graphStats = await graphApiService.getGraphStats();
        setStats(graphStats);

        // Build nodes and edges
        const newNodes = [];
        const newEdges = [];

        // Decision node
        newNodes.push({
          id: `decision-${timeline.decision_id}`,
          data: {
            label: (
              <div style={{ textAlign: 'center', padding: 8 }}>
                <strong>{timeline.decision_title}</strong>
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

        // Event nodes with vertical layout below decision node
        timeline.timeline.forEach((event, idx) => {
          newNodes.push({
            id: `event-${event.event_id}`,
            data: {
              label: (
                <div style={{ textAlign: 'center', padding: 8 }}>
                  <div style={{ fontWeight: 'bold' }}>{event.event_type}</div>
                  <div style={{ fontSize: 12 }}>{event.description}</div>
                  <div style={{ fontSize: 10, color: '#718096', marginTop: 4 }}>
                    {new Date(event.timestamp).toLocaleString()}
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

          // Edge from decision to event
          newEdges.push({
            id: `edge-decision-event-${event.event_id}`,
            source: `decision-${timeline.decision_id}`,
            target: `event-${event.event_id}`,
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
              source: `event-${timeline.timeline[idx - 1].event_id}`,
              target: `event-${event.event_id}`,
              animated: false,
              style: { stroke: '#94a3b8', strokeWidth: 1.5 },
              markerEnd: { type: 'arrowclosed' },
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setError(null);
      } catch (err) {
        setError('Failed to load graph data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGraphData();
  }, [decision_id]); // Only depend on decision_id

  if (loading)
    return (
      <div style={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        Loading decision graph...
      </div>
    );

  if (error)
    return (
      <div style={{ height: 200, color: 'red', textAlign: 'center', paddingTop: 20 }}>
        {error}
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
        <MiniMap nodeColor={(node) => (node.id.startsWith('decision') ? '#3b82f6' : '#059669')} />
        <Panel position="top-left" style={{ padding: 4, backgroundColor: 'white', borderRadius: 4, border: '1px solid #ddd', fontSize: 12 }}>
          <div>Decisions: {stats?.decisions_in_graph ?? '-'}</div>
          <div>Events: {stats?.events_in_graph ?? '-'}</div>
          <div>Relationships: {stats?.relationships ?? '-'}</div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
