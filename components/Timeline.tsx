"use client";
import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface VideoSegmentProps {
  id: string;
  start: number;
  end: number;
  duration: number;
  thumbnail: string;
  index: number;
  moveSegment: (dragIndex: number, hoverIndex: number) => void;
  onSelect: (id: string) => void;
  
}

interface DragItem {
  id: string;
  index: number;
}

interface TimelineProps {
  videoSegments: VideoSegmentProps[];
  setVideoSegments: (segments: VideoSegmentProps[]) => void;
  onSelectSegment: (id: string | null) => void;
}

const VideoSegment: React.FC<VideoSegmentProps> = ({
  id,
  start,
  end,
  duration,
  thumbnail,
  index,
  moveSegment,
  onSelect,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "VIDEO_SEGMENT",
    item: { id, index } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "VIDEO_SEGMENT",
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveSegment(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const segmentWidth = `${(duration / 60) * 100}%`;

  return (
    <div
      ref={ref}
      className={`video-segment ${isDragging ? "dragging" : ""}`}
      style={{ width: segmentWidth, opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onSelect(id)}
    >
      <div className="segment-thumbnail">
        <img src={thumbnail || "placeholder.jpg"} alt="Video thumbnail" />
      </div>
      <div className="segment-info">
        <span>
          {Math.floor(start / 60)}:{(start % 60).toString().padStart(2, "0")} -{" "}
          {Math.floor(end / 60)}:{(end % 60).toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({
  videoSegments,
  setVideoSegments,
  onSelectSegment,
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const moveSegment = (dragIndex: number, hoverIndex: number) => {
    const dragSegment = videoSegments[dragIndex];
    const newSegments = [...videoSegments];
    newSegments.splice(dragIndex, 1);
    newSegments.splice(hoverIndex, 0, dragSegment);
    setVideoSegments(newSegments);
  };

  const handleSegmentSelect = (id: string) => {
    setSelectedSegmentId(id);
    onSelectSegment(id);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === timelineRef.current) {
      setSelectedSegmentId(null);
      onSelectSegment(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="timeline-container">
        <div className="timeline-controls">
          <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button>
        </div>
        <div className="timeline-ruler">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="ruler-mark">
              <span>{i * 10}s</span>
            </div>
          ))}
        </div>
        <div
          className="timeline"
          ref={timelineRef}
          onClick={handleTimelineClick}
          style={{ transform: `scaleX(${scale})` }}
        >
          {videoSegments.map((segment, index) => (
            <VideoSegment
              key={segment.id}
              id={segment.id}
              index={index}
              start={segment.start}
              end={segment.end}
              duration={segment.duration}
              thumbnail={segment.thumbnail}
              moveSegment={moveSegment}
              onSelect={handleSegmentSelect}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Timeline;