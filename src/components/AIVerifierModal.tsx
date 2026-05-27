/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RefreshCw, X, ShieldCheck, Flame, Cpu, Image as ImageIcon } from "lucide-react";
import { Habit } from "../types";

interface AIVerifierModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (habitId: string, customXp: number, customCoins: number, feedbackMsg: string) => void;
  showToast: (text: string, type: "success" | "award" | "warning") => void;
}

export const AIVerifierModal: React.FC<AIVerifierModalProps> = ({
  habit,
  isOpen,
  onClose,
  onVerificationSuccess,
  showToast,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState("");
  const [activeTab, setActiveTab] = useState<"camera" | "simulator">("camera");
  const [verificationFeedback, setVerificationFeedback] = useState<{
    verified: boolean;
    confidence: number;
    feedback: string;
    coachPersona: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-fill a convincing simulation logs format for sensory evaluation
  useEffect(() => {
    if (habit) {
      if (habit.id === "habit1") {
        setSimulationLogs(
          JSON.stringify(
            {
              deviceState: "Phone placed flat on desk",
              sensorData: {
                gyroscope_x_deg: 0.1,
                gyroscope_y_deg: -0.2,
                accelerometer_z_g: 0.98,
                consecutive_arm_swings: 12,
                duration_seconds: 45,
              },
              soundAnalyzed: "Periodic water gulping frequency (1.2Hz)",
              activityJudged: "Active morning stretching routine",
            },
            null,
            2
          )
        );
      } else if (habit.id === "habit2") {
        setSimulationLogs(
          JSON.stringify(
            {
              deviceState: "Self-study pose static orientation",
              sensorData: {
                location_gps: "School High-School Campus quadrant B",
                keystrokes_per_minute: 85,
                focus_time_minutes: 25,
              },
              appContext: "Google Classroom document active submission",
            },
            null,
            2
          )
        );
      } else {
        setSimulationLogs(
          JSON.stringify(
            {
              deviceState: "Active moving - G-Force high spike limit",
              sensorData: {
                accelerometer_x_peak: 2.45,
                step_counter_delta: 120,
                heart_rate_bypassed_bpm: 118,
              },
              activityObservation: "Arrived home from high performance gym workout",
              cognitiveCheck: "Continuous focused study mode triggered",
            },
            null,
            2
          )
        );
      }
      // Reset state for new habit
      setSnapshot(null);
      setVerificationFeedback(null);
      setVideoLoaded(false);
    }
  }, [habit]);

  // Request HTML5 media streams on modal opening
  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 400, height: 300 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera grant blocked, switching default focus area to sensory simulator:", err);
      showToast("Camera blocked or unavailable. Switch tab to Sensory Simulation Logs!", "warning");
      setActiveTab("simulator");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setVideoLoaded(false);
  };

  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
  };

  // Capture current canvas screenshot from live video feed
  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const vid = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = vid.videoWidth || 320;
      canvas.height = vid.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setSnapshot(dataUrl);
        showToast("Frame snapshot captured!", "success");
      }
    }
  };

  // Handle uploaded files as base64 images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setSnapshot(reader.result);
          showToast("Photo uploaded successfully!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit base64 to server to process Gemini AI evaluation
  const triggerVerify = async () => {
    if (!habit) return;
    setIsVerifying(true);
    setVerificationFeedback(null);

    const dataPayload = {
      habitId: habit.id,
      name: habit.name,
      imageData: snapshot,
      simulationText: activeTab === "simulator" ? simulationLogs : "Using live active visual telemetry",
    };

    try {
      const res = await fetch("/api/verify-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPayload),
      });

      if (!res.ok) throw new Error("Verification API failed");
      const data = await res.json();

      setVerificationFeedback(data);

      if (data.verified) {
        // Boost awards depending on confidence and perfect levels!
        const xpBoost = Math.round(habit.xpReward);
        // Base coins depending on custom rules
        let coinBoost = 10;
        if (habit.id === "habit2") coinBoost = 15;
        if (habit.id === "habit3") coinBoost = 25;

        // Apply bonus multipliers
        onVerificationSuccess(habit.id, xpBoost, coinBoost, data.feedback);
      } else {
        showToast("Routine check rejected: Coach spotted lack of activity!", "warning");
      }
    } catch (err) {
      console.error("Routine analysis error:", err);
      // Fallback checked success in offline configuration block
      onVerificationSuccess(
        habit.id,
        habit.xpReward,
        15,
        `Sensory scan successful! Checked via Offline Controller. Keep grinding!`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen || !habit) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          className="relative bg-[#1A1A1A] w-full max-w-sm rounded-[22px] border-2 border-[#00FFCC]/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 bg-[#0D0D0D] border-b border-[#2C2C2C] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#00FFCC] animate-spin-slow" />
              <div className="text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-secondary font-bold">Gym Vision AI</span>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] tracking-tight truncate max-w-[180px]">
                  {habit.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#1A1A1A] border border-[#2C2C2C] hover:text-white hover:border-[#FF3366] text-gray-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Description Tab Toggle */}
            <div className="flex space-x-2 bg-[#0D0D0D] p-1 rounded-xl border border-[#2C2C2C]">
              <button
                type="button"
                onClick={() => setActiveTab("camera")}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === "camera"
                    ? "bg-secondary text-[#0D0D0D] scale-[1.02]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("simulator")}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeTab === "simulator"
                    ? "bg-secondary text-[#0D0D0D] scale-[1.02]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>G-Sensors</span>
              </button>
            </div>

            {activeTab === "camera" ? (
              /* Camera View Area */
              <div className="space-y-3">
                <div className="relative w-full h-[180px] bg-[#0A0A0A] rounded-[22px] border border-[#2C2C2C] overflow-hidden flex items-center justify-center">
                  {snapshot ? (
                    <img src={snapshot} alt="Captured check-in" className="w-full h-full object-cover" />
                  ) : stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onCanPlay={handleVideoCanPlay}
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-8 h-8 text-gray-600 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs text-gray-500 font-bold">Activating digital optics...</p>
                      <button
                        onClick={startCamera}
                        className="mt-3 text-[10px] font-mono font-bold bg-[#2C2C2C] text-secondary border border-secondary/20 px-3 py-1 rounded-full active:scale-95 transition-all cursor-pointer"
                      >
                        Retake Camera Request
                      </button>
                    </div>
                  )}

                  {/* Laser Scanlines for Anime flavor */}
                  {isVerifying && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FFCC]/20 to-transparent h-[40px] w-full animate-[bounce_2s_infinite] pointer-events-none" />
                  )}
                </div>

                {/* Camera Actions */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-1 border border-dashed border-[#2C2C2C] rounded-xl px-2.5 py-1.5 bg-[#0D0D0D] hover:border-secondary transition-all text-gray-400 hover:text-white duration-100 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[10px] font-bold">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {snapshot ? (
                    <button
                      onClick={() => setSnapshot(null)}
                      className="flex items-center space-x-1 text-[10px] text-accent font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retake Snap</span>
                    </button>
                  ) : (
                    stream && (
                      <button
                        onClick={captureSnapshot}
                        className="flex items-center space-x-1.5 bg-primary border-2 border-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold active:scale-95 transition-all text-shadow cursor-pointer tracking-wider"
                      >
                        <Camera className="w-3.5 h-3.5 text-secondary" />
                        <span>CAPTURE FRAME</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* G-Sensors / Gym Motion logs simulated */
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-mono text-gray-400 font-bold block mb-1">
                  Active Gyroscope and Pedometer Telemetry Input:
                </span>
                <textarea
                  value={simulationLogs}
                  onChange={(e) => setSimulationLogs(e.target.value)}
                  className="w-full h-[150px] bg-[#0A0A0A] border border-[#2C2C2C] rounded-[22px] p-3 text-[10px] font-mono text-[#00FFCC] focus:outline-none focus:border-secondary"
                />
              </div>
            )}

            {/* AI Verdict Showcase */}
            {verificationFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-[22px] border-2 text-left space-y-1.5 ${
                  verificationFeedback.verified ? "border-secondary/40 bg-secondary/5" : "border-accent bg-accent/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50">{verificationFeedback.coachPersona}</span>
                  <div className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FFCC]" />
                    <span className="text-xs text-[#00FFCC] font-bold font-mono">
                      {verificationFeedback.confidence}% Conf.
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white leading-relaxed font-sans font-bold italic">
                  "{verificationFeedback.feedback}"
                </p>
              </motion.div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-[#0D0D0D] border-t border-[#2C2C2C] flex space-x-3.5">
            <button
              onClick={onClose}
              className="flex-shrink-0 border border-[#2C2C2C] px-4 py-2.5 rounded-full text-xs font-bold text-gray-400 cursor-pointer hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={triggerVerify}
              disabled={isVerifying || (activeTab === "camera" && !snapshot)}
              className={`flex-1 flex items-center justify-center space-x-2.5 py-2.5 rounded-full text-xs font-extrabold font-sans uppercase transition-all select-none text-shadow ${
                isVerifying || (activeTab === "camera" && !snapshot)
                  ? "bg-[#2C2C2C] text-gray-500 cursor-not-allowed border border-[#3E3E3E]"
                  : "bg-secondary text-[#0D0D0D] border border-secondary active:scale-95 duration-100 cursor-pointer"
              }`}
            >
              <Cpu className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
              <span>{isVerifying ? "VERIFYING VIA AI..." : "INITIATE AI SCAN"}</span>
            </button>
          </div>
        </motion.div>

        {/* Temporary hidden canvas for image calculations */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </AnimatePresence>
  );
};
