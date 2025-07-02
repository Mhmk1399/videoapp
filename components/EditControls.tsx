"use client";
import React, { useState } from "react";

interface EditControlsProps {
  onCut: () => void;
  onDelete: () => void;
  onTrim: (start: number, end: number) => void;
  onPlay: () => void;
  onExport: () => void;
  isPlaying: boolean;
  selectedSegment: any;
  currentTime: number;
}

const EditControls: React.FC<EditControlsProps> = ({
  onCut,
  onDelete,
  onTrim,
  onPlay,
  onExport,
  isPlaying,
  selectedSegment,
  currentTime,
}) => {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [showTrimControls, setShowTrimControls] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTrimApply = () => {
    onTrim(trimStart, trimEnd);
    setShowTrimControls(false);
  };

  const handleTrimCancel = () => {
    setTrimStart(0);
    setTrimEnd(selectedSegment ? selectedSegment.end - selectedSegment.start : 0);
    setShowTrimControls(false);
  };

  const handleShowTrimControls = () => {
    if (selectedSegment) {
      setTrimStart(0);
      setTrimEnd(selectedSegment.end - selectedSegment.start);
      setShowTrimControls(true);
    }
  };

  return (
    <div className="edit-controls">
      <div className="main-controls">
        <button
          onClick={onPlay}
          disabled={!selectedSegment}
          className="control-button play-button"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={onCut}
          disabled={!selectedSegment}
          className="control-button cut-button"
        >
          Cut at Current Position ({formatTime(currentTime)})
        </button>
        <button
          onClick={handleShowTrimControls}
          disabled={!selectedSegment}
          className="control-button trim-button"
        >
          Trim
        </button>
        <button
          onClick={onDelete}
          disabled={!selectedSegment}
          className="control-button delete-button"
        >
          Delete Segment
        </button>
        <button onClick={onExport} className="control-button export-button">
          Export Video
        </button>
      </div>
      {showTrimControls && selectedSegment && (
        <div className="trim-controls">
          <div className="trim-sliders">
            <div className="trim-slider-container">
              <label>Start: {formatTime(trimStart)}</label>
              <input
                type="range"
                min="0"
                max={selectedSegment ? selectedSegment.end - selectedSegment.start : 0}
                value={trimStart}
                onChange={(e) => setTrimStart(Number(e.target.value))}
                className="trim-slider"
              />
            </div>
            <div className="trim-slider-container">
              <label>End: {formatTime(trimEnd)}</label>
              <input
                type="range"
                min={trimStart}
                max={selectedSegment ? selectedSegment.end - selectedSegment.start : 0}
                value={trimEnd}
                onChange={(e) => setTrimEnd(Number(e.target.value))}
                className="trim-slider"
              />
            </div>
          </div>
          <div className="trim-buttons">
            <button onClick={handleTrimApply} className="trim-apply">
              Apply Trim
            </button>
            <button onClick={handleTrimCancel} className="trim-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="time-info">
        {selectedSegment && (
          <>
            <span>Current Position: {formatTime(currentTime)}</span>
            <span>
              Total Duration: {formatTime(selectedSegment.end - selectedSegment.start)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default EditControls;