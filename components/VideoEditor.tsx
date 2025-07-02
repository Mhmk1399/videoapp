"use client";
import React, { useState, useRef, useEffect, JSX } from "react";
import Timeline from "./Timeline";
import EditControls from "./EditControls";
import ChatBox from "./ChatBox";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface VideoSegment {
  id: string;
  src: string;
  filename: string;
  start: number;
  end: number;
  thumbnail: string;
  originalDuration: number;
  duration: number;
}

const VideoEditor: React.FC = (): JSX.Element => {
  const [videoSegments, setVideoSegments] = useState<VideoSegment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedSegment = videoSegments.find(
    (segment) => segment.id === selectedSegmentId
  );

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.post("http://localhost:8000/upload", formData);
        const { video_id, file_path } = response.data;

        const url = URL.createObjectURL(file);
        const tempVideo = document.createElement("video");
        tempVideo.src = url;

        tempVideo.onloadedmetadata = async () => {
          const duration = tempVideo.duration;
          const newSegment: VideoSegment = {
            id: uuidv4(),
            src: url,
            filename: file.name,
            start: 0,
            end: duration,
            thumbnail: "",
            originalDuration: duration,
            duration: duration,
          };

          const thumbnail = await generateThumbnail(tempVideo, newSegment.id);
          newSegment.thumbnail = thumbnail;
          setVideoSegments([newSegment]);
          setVideoId(video_id);
        };
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const generateThumbnail = (
    videoElement: HTMLVideoElement,
    id: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      videoElement.currentTime = videoElement.duration * 0.25;
      videoElement.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/jpeg");
          resolve(dataURL);
        }
      };
    });
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCutVideo = () => {
    if (selectedSegmentId && currentTime > 0) {
      setVideoSegments((prev) =>
        prev
          .map((segment) => {
            if (segment.id === selectedSegmentId) {
              const firstSegment: VideoSegment = {
                ...segment,
                id: uuidv4(),
                end: segment.start + currentTime,
                duration: currentTime,
              };
              const secondSegment: VideoSegment = {
                ...segment,
                id: uuidv4(),
                start: segment.start + currentTime,
                duration: segment.end - (segment.start + currentTime),
              };
              return [firstSegment, secondSegment];
            }
            return segment;
          })
          .flat()
      );
    }
  };

  const handleDeleteSegment = () => {
    if (selectedSegmentId) {
      setVideoSegments((prev) =>
        prev.filter((segment) => segment.id !== selectedSegmentId)
      );
      setSelectedSegmentId(null);
    }
  };

  const handleTrimSegment = (start: number, end: number) => {
    if (selectedSegmentId) {
      setVideoSegments((prev) =>
        prev.map((segment) =>
          segment.id === selectedSegmentId
            ? {
                ...segment,
                start: segment.start + start,
                end: segment.start + end,
                duration: end - start,
              }
            : segment
        )
      );
    }
  };

  const handleExport = () => {
    alert("Exporting... Check server for final video.");
  };

  const handleSubmitPrompt = async (prompt: string, videoId: string) => {
    // Implementation pending
  };



  return (
    <div className="video-editor">
      <div className="editor-main">
        <div className="preview-area">
          {selectedSegment ? (
            <video
              ref={videoRef}
              src={selectedSegment.src}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="empty-preview">
              <p>Upload a video to start</p>
            </div>
          )}
        </div>
        <div className="upload-area">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            id="video-upload"
          />
          <label htmlFor="video-upload" className="upload-button">
            Upload Video
          </label>
        </div>
      </div>
      <Timeline
        videoSegments={videoSegments}
        setVideoSegments={setVideoSegments}
        onSelectSegment={setSelectedSegmentId}
      />
      <ChatBox onSubmitPrompt={handleSubmitPrompt} videoId={videoId} />
      <EditControls
        onCut={handleCutVideo}
        onDelete={handleDeleteSegment}
        onTrim={handleTrimSegment}
        onPlay={handlePlay}
        onExport={handleExport}
        isPlaying={isPlaying}
        selectedSegment={selectedSegment}
        currentTime={currentTime}
      />
    </div>
  );



};
export default VideoEditor;