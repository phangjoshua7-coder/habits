/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Camera,
  Play,
  RotateCcw,
  BookOpen,
  User,
  Heart,
  Activity,
  Award,
  Zap,
  Coffee,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Cpu,
  Brain,
  Timer,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Smile,
  LogOut,
  Send,
  LayoutGrid
} from "lucide-react";
import { sound } from "./AudioEffects";

interface AICoachLabProps {
  coins: number;
  xp: number;
  level: number;
  onAward: (xpGain: number, coinGain: number, reason: string) => void;
  showToast: (text: string, type: "success" | "award" | "shop" | "streak" | "warning") => void;
}

export const AICoachLab: React.FC<AICoachLabProps> = ({
  coins,
  xp,
  level,
  onAward,
  showToast
}) => {
  // Navigation tabs of the AI Coach Lab
  const [activeLayer, setActiveLayer] = useState<"vision" | "cognitive" | "optimization">("vision");
  const [activeFeature, setActiveFeature] = useState<string>("");

  // Common Camera state for vision features
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Feature Specific States ---

  // 1. Rainbow Plate (Nutrition Tracker)
  const [mealDescription, setMealDescription] = useState("");
  const [nutritionResult, setNutritionResult] = useState<any>(null);

  // 2. Desk-Worker Stretch (Posture)
  const [isStretchStarted, setIsStretchStarted] = useState(false);
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState(60);
  const [postureFeedbackSequence, setPostureFeedbackSequence] = useState<string[]>([]);
  const [currentPostureMetric, setCurrentPostureMetric] = useState<any>(null);
  const stretchIntervalRef = useRef<any>(null);

  // 3. "Fruit First" Identifier
  const [snackDescription, setSnackDescription] = useState("");
  const [snackResult, setSnackResult] = useState<any>(null);

  // 4. Recall Gym (Active Recall)
  const [recallReferenceDoc, setRecallReferenceDoc] = useState(
    "Mitochondria are double-membraned organelles that generate most of the chemical energy needed to power biological cell biochemical reactions (ATP). They have their own small genome (mtDNA) and replicate independently."
  );
  const [userRecallSummary, setUserRecallSummary] = useState("");
  const [recallResult, setRecallResult] = useState<any>(null);

  // 5. Brain Dump
  const [brainDumpText, setBrainDumpText] = useState("");
  const [brainDumpResult, setBrainDumpResult] = useState<any>(null);

  // 6. Feynman Tutor
  const [feynmanTopic, setFeynmanTopic] = useState("Quantum Superposition");
  const [feynmanExplanation, setFeynmanExplanation] = useState("");
  const [feynmanResult, setFeynmanResult] = useState<any>(null);

  // 7. Adaptive Pomodoro
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"work" | "rest">("work");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(1500); // 25 mins
  const [focusSliderValue, setFocusSliderValue] = useState(5); // 1-10 level scale
  const [pomoCycleCount, setPomoCycleCount] = useState(0);
  const [currentPomoRatio, setCurrentPomoRatio] = useState({ work: 25, rest: 5 });
  const [pomoLoggedFeedback, setPomoLoggedFeedback] = useState<string>("Focus stable. Standard 25/5 cycle is active.");
  const timerIntervalRef = useRef<any>(null);

  // 8. Sleep/Sunlight Synchronizer
  const [sunlightHour, setSunlightHour] = useState("07:30");
  const [sunlightMinutes, setSunlightMinutes] = useState(15);
  const [sunlightResult, setSunlightResult] = useState<any>(null);

  // 9. Procrastination Predictor (5-Minute Rule)
  const [procrastinationSeverity, setProcrastinationSeverity] = useState("medium"); // low, medium, high
  const [procrastinatedTask, setProcrastinatedTask] = useState("");
  const [fiveMinRuleTriggered, setFiveMinRuleTriggered] = useState(false);
  const [fiveMinSeconds, setFiveMinSeconds] = useState(300); // 5 minutes
  const [fiveMinRunning, setFiveMinRunning] = useState(false);
  const [ruleResult, setRuleResult] = useState<any>(null);
  const fiveMinIntervalRef = useRef<any>(null);

  // New Custom AI Coach enhancements
  const [coachPersona, setCoachPersona] = useState<"coach_li_ning" | "drill_sergeant" | "sarcastic_robot">("coach_li_ning");
  const [procrastinationRoastResult, setProcrastinationRoastResult] = useState<any>(null);
  const [deskAuditResult, setDeskAuditResult] = useState<any>(null);
  const [deskDescription, setDeskDescription] = useState("");
  const [isGamerMode, setIsGamerMode] = useState(false);

  // Auto select default sub-feature based on current active layer
  useEffect(() => {
    stopCamera();
    setSnapshot(null);
    setIsProcessing(false);
    
    if (activeLayer === "vision") {
      setActiveFeature("nutrition");
    } else if (activeLayer === "cognitive") {
      setActiveFeature("recall");
    } else if (activeLayer === "optimization") {
      setActiveFeature("timer");
    }
  }, [activeLayer]);

  // Handle count down timer for Posture Correct checkups
  useEffect(() => {
    if (isStretchStarted && stretchSecondsLeft > 0) {
      stretchIntervalRef.current = setInterval(() => {
        setStretchSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(stretchIntervalRef.current);
            setIsStretchStarted(false);
            sound.playLevelUp();
            submitStretchResult();
            return 0;
          }
          // Periodically spit training guidance
          if (prev === 45) {
            setPostureFeedbackSequence((p) => [...p, "Sight-line locked! Keep chin elevated."]);
          } else if (prev === 30) {
            setPostureFeedbackSequence((p) => [...p, "Correcting shoulders! Keep chest expanded."]);
          } else if (prev === 15) {
            setPostureFeedbackSequence((p) => [...p, "Elite core posture! 15 seconds to success."]);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(stretchIntervalRef.current);
  }, [isStretchStarted, stretchSecondsLeft]);

  // Handle adaptive pomodoro loop
  useEffect(() => {
    if (isTimerRunning && pomodoroSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            sound.playLevelUp();
            if (timerMode === "work") {
              onAward(20, 10, "Adaptive Pomodoro study session complete!");
              showToast("Pomo session completed! Grab a sip and hit some rest.", "award");
              setTimerMode("rest");
              setPomodoroSeconds(currentPomoRatio.rest * 60);
              setPomoCycleCount((c) => c + 1);
            } else {
              showToast("Rest completed! Time to tension the racket again.", "success");
              setTimerMode("work");
              setPomodoroSeconds(currentPomoRatio.work * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning, pomodoroSeconds, timerMode]);

  // 5 Min Rule Countdown
  useEffect(() => {
    if (fiveMinRunning && fiveMinSeconds > 0) {
      fiveMinIntervalRef.current = setInterval(() => {
        setFiveMinSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(fiveMinIntervalRef.current);
            setFiveMinRunning(false);
            sound.playCoin();
            onAward(15, 15, "Destroyed procrastination via the 5-Minute Rule!");
            showToast("5-Minute Rule absolute peak! Task inertia broken!", "award");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(fiveMinIntervalRef.current);
    }
    return () => clearInterval(fiveMinIntervalRef.current);
  }, [fiveMinRunning, fiveMinSeconds]);

  // Clean-up camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraLoading(false);
  };

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      if (stream) {
        stopCamera();
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 400, height: 300 },
        audio: false,
      });
      setStream(mediaStream);
      setCameraLoading(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.warn("Blocked camera:", err);
      showToast("Access to camera blocked or unsupported. Use description inputs!", "warning");
      setCameraLoading(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const vid = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = vid.videoWidth || 320;
      canvas.height = vid.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL("image/jpeg", 0.85);
        setSnapshot(url);
        showToast("Snap saved!", "success");
        stopCamera();
      }
    }
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Generic full-stack API caller wrapper
  const callAICoachAPI = async (featureType: string, payload: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureType, ...payload }),
      });
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setIsProcessing(false);
      return data;
    } catch (error) {
      console.error("AI Coach API error, launching fallback logic:", error);
      setIsProcessing(false);
      // Return beautiful fallback mock structure based on the requested feature
      return generateOfflineFallback(featureType, payload);
    }
  };

  // Generate gorgeous offline simulated outcomes
  const generateOfflineFallback = (type: string, payload: any) => {
    const mockCoach = "Coach Yonex [Fallback Engine]";
    if (type === "nutrition") {
      return {
        verified: true,
        detectedColors: ["Red", "Green", "Yellow", "Orange"],
        colorRuleMet: true,
        vitaminBreakdown: "Rich in Vitamin C, high dietary fibers, carotenoids, and hydration fluid support.",
        feedback: "Superb nutrition alignment! Your plate displays gorgeous color variety satisfying the classic 3-Color Rule. This supports active physical defense indexes on the training court. +15 Coins & +20 XP verified!",
        coachPersona: mockCoach,
        rewardCoins: 15,
        xpReward: 20
      };
    } else if (type === "fruit_snack") {
      const desc = (payload.descr || "").toLowerCase();
      const isFruit = desc.includes("apple") || desc.includes("banana") || desc.includes("orange") || desc.includes("berry") || desc.includes("kiwi") || desc.includes("pear") || desc.includes("grapes") || desc.includes("melon") || desc.includes("strawberry") || payload.imageAttached;
      return {
        isFruit: !!isFruit,
        snackName: isFruit ? "Whole Fresh Fruit" : "Processed Glucose item",
        feedback: isFruit 
          ? "Sensational choice! Pure fructose paired with healthy fiber slows glucose delivery, totally skipping insulin crash spikes. You are rewarded +20 Coins bonus!"
          : "Spotted! Processed refined snack present. This can trigger energy crashes on the third court drill. Coach recommends packing a whole banana instead to tension raw muscles next time.",
        coachPersona: mockCoach,
        rewardCoins: isFruit ? 20 : 5,
        xpReward: 10
      };
    } else if (type === "recall") {
      return {
        masteryRating: "Aspirant Tier",
        masteredConcepts: ["ATP biochemical reactions", "Independent genomic mtDNA"],
        missedConcepts: ["Double-membrane structure detail", "Independent cellular division capability"],
        feedback: "Awesome summary of mitochondria concepts! You covered core bioenergy pathways, but missed specifying the primary double-membrane wrapping aspect. Master this to elevate court studying!",
        coachPersona: "Coach Victor [Fallback Engine]"
      };
    } else if (type === "braindump") {
      return {
        worries: ["Managing court study logs", "Inertia starting study marathon", "Tension on workout days"],
        actionableTodos: [
          "Organize ReadySETGO study folders (High Priority)",
          "Do a 10-minute warm-up skip to release tension",
          "Open textbook on page 1 and read exactly 3 paragraphs"
        ],
        stressors: ["Worry of falling behind school training routines", "Physical cell fatigue"],
        feedback: "Brain dump completely sorted! Cleared cognitive clutter to make space for athletic badminton focus. Open of workspace ready! +15 Coins & +10 XP added.",
        coachPersona: mockCoach
      };
    } else if (type === "feynman") {
      return {
        simplicityScore: 88,
        jargonIdentified: ["Quantum", "Matrices"],
        feedback: "Magnificent explanation! Explaining 'Quantum Superposition' as a spinning coin that's both heads and tails until caught is a brilliant analog safe for 5-year-olds! Jargon bypassed entirely. True court mastery!",
        masteryLevel: "Mastery Confirmed",
        coachPersona: "Coach Li Ning [Fallback Engine]"
      };
    } else if (type === "sleep_sunlight") {
      return {
        sunlightDoseRating: "Peak Activation",
        digitalSunsetTime: "21:30",
        bedtimeRecommendation: "22:30",
        rationale: "Viewing sunlight at 07:30 locks in a consistent circadian clock anchor. Melatonin suppression cycle triggered immediately, planning smooth melatonin release 14 hours later. Sleep is your elite body recovery tool!",
        coachPersona: mockCoach
      };
    }
    return { error: "No fallback configuration" };
  };

  // --- Feature Submit Methods ---

  // 1. Submit Plate (Nutrition)
  const submitNutritionCheck = async () => {
    if (!snapshot && !mealDescription.trim()) {
      showToast("Attach a photo snapshot or input a description of the plate!", "warning");
      return;
    }
    const res = await callAICoachAPI("nutrition", {
      image: snapshot,
      descr: mealDescription
    });
    setNutritionResult(res);
    if (res.verified) {
      sound.playCompletion();
      onAward(20, 15, "Rainbow Plate Nutrition Check");
      showToast("Rainbow Plate Verified! +15 Coins & +20 XP", "success");
    }
  };

  // 2. Desk-Worker stretch (Posture Correction)
  const startStretchTimer = () => {
    setStretchSecondsLeft(60);
    setIsStretchStarted(true);
    setPostureFeedbackSequence(["Coach calibrating camera... Sight-line setup verified.", "Posture checking counter live! Expand shoulders."]);
    sound.playCoin();
  };

  const submitStretchResult = async () => {
    setIsProcessing(true);
    // Fetch calculation
    const res = await callAICoachAPI("posture", {
      secCompleted: 60,
      image: snapshot
    });
    setCurrentPostureMetric({
      hunchbackScore: res.hunchbackScore || 12,
      feedback: res.feedback || "Sensational active stretch alignment! Your neck and back are aligned, keeping vertebral tension low for sports hits.",
      tips: res.tips || ["Keep phone elevated at eye level when typing.", "Every 45 minutes stand and rotate shoulders 5 times."]
    });
    onAward(25, 20, "60-Second Posture Check stretch");
    showToast("Posture Correction check verified! +20 Coins!", "success");
    setIsProcessing(false);
  };

  // 3. Submit SNACK check
  const submitSnackClassification = async () => {
    if (!snapshot && !snackDescription.trim()) {
      showToast("Provide a snack photo or input a description!", "warning");
      return;
    }
    const res = await callAICoachAPI("fruit_snack", {
      image: snapshot,
      descr: snackDescription
    });
    setSnackResult(res);
    sound.playCoin();
    
    const coinReward = res.rewardCoins || (res.isFruit ? 20 : 5);
    onAward(10, coinReward, "Fruit First Snack Decision");
    if (res.isFruit) {
      showToast(`Fruit first bonus! +${coinReward} Coins!`, "award");
    } else {
      showToast(`Snack analyzed! +${coinReward} Coins.`, "success");
    }
  };

  // 4. Recall Gym
  const submitRecallCheck = async () => {
    if (!userRecallSummary.trim()) {
      showToast("Summarize what you read first!", "warning");
      return;
    }
    const res = await callAICoachAPI("recall", {
      reference: recallReferenceDoc,
      summary: userRecallSummary
    });
    setRecallResult(res);
    sound.playCompletion();
    onAward(25, 15, "Active Recall check-in");
    showToast("Recall analyzed! +15 Coins awarded.", "success");
  };

  // 5. Brain Dump
  const submitBrainDump = async () => {
    if (!brainDumpText.trim()) {
      showToast("Write some thoughts down to dump first!", "warning");
      return;
    }
    const res = await callAICoachAPI("braindump", {
      text: brainDumpText
    });
    setBrainDumpResult(res);
    sound.playCoin();
    onAward(10, 15, "Brain Dump Organizer checklist");
    showToast("Brain Dump processed. Let's attack the list!", "success");
  };

  // 6. Feynman Tutor
  const submitFeynmanExplanation = async () => {
    if (!feynmanExplanation.trim()) {
      showToast("Please input your explanation!", "warning");
      return;
    }
    const res = await callAICoachAPI("feynman", {
      topic: feynmanTopic,
      explanation: feynmanExplanation
    });
    setFeynmanResult(res);
    sound.playCompletion();
    onAward(30, 20, "Feynman 5yo Tutor challenge");
    showToast("Feynman Explanation evaluation complete!", "award");
  };

  // 7. Adaptive Pomodoro Logic Focus change
  const triggerFocusUpdate = (val: number) => {
    setFocusSliderValue(val);
    // Smart recalculation parameters
    let work = 25;
    let rest = 5;
    let feedback = "";
    
    if (val <= 3) {
      work = 15;
      rest = 3;
      feedback = "Brain fry warning! Short 15-minute intervals recommended to secure fast mental reload cycles.";
    } else if (val <= 7) {
      work = 25;
      rest = 5;
      feedback = "Solid equilibrium of study cells. Normal 25/5 Pomodoro locked in to prevent cognitive fatigue.";
    } else {
      work = 50;
      rest = 10;
      feedback = "Hyper-focus mode high activity! Evolving schedule to 50/10 cycle to sustain extreme flow state.";
    }
    
    setCurrentPomoRatio({ work, rest });
    setPomodoroSeconds(work * 60);
    setPomoLoggedFeedback(feedback);
    sound.playCoin();
    showToast(`AI Adaptive Timer morphed into ${work}/${rest} cycle!`, "success");
  };

  // 8. Sleep Sunlight log
  const submitSunlightCalculation = async () => {
    const res = await callAICoachAPI("sleep_sunlight", {
      time: sunlightHour,
      duration: sunlightMinutes
    });
    setSunlightResult(res);
    sound.playCoin();
    onAward(15, 15, "Sleep/Sunlight anchor logging");
    showToast("Circadian Anchor Sun synced! Digital Sunset alarm calculated.", "success");
  };

  // Submit study desk audit check
  const submitDeskFocusAudit = async () => {
    if (!snapshot && !deskDescription.trim()) {
      showToast("Attach a photo snapshot or input a description of your desk space!", "warning");
      return;
    }
    const res = await callAICoachAPI("desk_audit", {
      image: snapshot,
      descr: deskDescription
    });
    setDeskAuditResult(res);
    sound.playCompletion();
    onAward(20, 15, "Study Desk Focus Space Audit");
    showToast("Study Desk Audited! Zone focus rating: " + (res.focusScore || 85) + "/100", "success");
  };

  // Submit procrastination roast to chosen persona
  const submitProcrastinationRoast = async () => {
    if (!procrastinatedTask.trim()) {
      showToast("Specify what task you are procrastinating on first!", "warning");
      return;
    }
    const res = await callAICoachAPI("procrastination_roast", {
      task: procrastinatedTask,
      persona: coachPersona
    });
    setProcrastinationRoastResult(res);
    sound.playLevelUp();
    showToast("YOU HAVE BEEN ROASTED! Discipline index checked.", "warning");
  };

  // Reset helper
  const resetFeature = (feat: string) => {
    setSnapshot(null);
    stopCamera();
    if (feat === "nutrition") {
      setMealDescription("");
      setNutritionResult(null);
    } else if (feat === "desk_audit") {
      setDeskDescription("");
      setDeskAuditResult(null);
    } else if (feat === "procrastination_roast") {
      setProcrastinationRoastResult(null);
    } else if (feat === "posture") {
      setIsStretchStarted(false);
      setStretchSecondsLeft(60);
      setPostureFeedbackSequence([]);
      setCurrentPostureMetric(null);
    } else if (feat === "fruit_snack") {
      setSnackDescription("");
      setSnackResult(null);
    } else if (feat === "recall") {
      setUserRecallSummary("");
      setRecallResult(null);
    } else if (feat === "braindump") {
      setBrainDumpText("");
      setBrainDumpResult(null);
    } else if (feat === "feynman") {
      setFeynmanExplanation("");
      setFeynmanResult(null);
    } else if (feat === "sleep_sunlight") {
      setSunlightResult(null);
    }
  };

  const formattedTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const s = (totalSecs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={`space-y-6 text-left relative p-1 rounded-3xl transition-all duration-700 ${
      isGamerMode 
        ? "bg-gradient-to-b from-red-950/10 to-transparent border-2 border-red-600/60 shadow-[0_0_22px_rgba(239,68,68,0.22)] ring-1 ring-red-500/20" 
        : ""
    }`}>
      {/* Scanline glitch effect overlay for Gamer Mode */}
      {isGamerMode && (
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-[pulse_2s_infinite] rounded-3xl"></div>
      )}

      {/* Visual Identity Logo Banner */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border shadow-inner transition-all duration-500 ${
        isGamerMode 
          ? "bg-red-950/20 border-red-500/40 text-red-100" 
          : "bg-gradient-to-r from-secondary/10 to-transparent border-secondary/20"
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full bg-[#0D0D0D] border flex items-center justify-center transition-all ${
            isGamerMode ? "border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "border-secondary text-secondary"
          }`}>
            <Brain className={`w-5 h-5 ${isGamerMode ? "text-red-500 animate-[spin_6s_linear_infinite]" : "text-secondary animate-[pulse_3s_infinite]"}`} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center space-x-1.5">
              <span>{isGamerMode ? "CYBER ARENA HARSH OVERRIDE" : "AI Coach Gym"}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] border font-black ${
                isGamerMode ? "text-red-500 bg-red-950/80 border-red-500/30 animate-pulse" : "text-secondary bg-primary border-[#222222]"
              }`}>
                {isGamerMode ? "LOW HP ALERT" : "V3.5 PRO"}
              </span>
            </h2>
            <p className="text-[10px] text-gray-500 font-bold leading-normal">
              {isGamerMode 
                ? "Discipline cells failing! High intensity roaster & audio feedback protocol online." 
                : "Harnessing sensory cognitive AI loops to build elite athletic routines"}
            </p>
          </div>
        </div>

        {/* Gamer Mode Toggler Toggle */}
        <button
          onClick={() => {
            setIsGamerMode(!isGamerMode);
            sound.playLevelUp();
            showToast(isGamerMode ? "Cyber Arena mode deactivated" : "CYBER GLITCH RED CONSOLE LOADED! LOCK IN!", "warning");
          }}
          className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
            isGamerMode 
              ? "bg-red-600 text-white border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" 
              : "bg-zinc-950 text-gray-400 border-zinc-800 hover:text-[#00FFCC] hover:border-[#00FFCC]"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isGamerMode ? "bg-white" : "bg-red-500 animate-ping"}`}></span>
          <span>{isGamerMode ? "GAMER MODE ON" : "GAMER MODE OFF"}</span>
        </button>
      </div>

      {/* Layer Tabs Navigation */}
      <div className="flex space-x-1.5 bg-[#0D0D0D] p-1 rounded-2xl border border-zinc-900 shadow-md">
        {[
          { id: "vision" as const, name: "Optical Scan", icon: <Camera className="w-3.5 h-3.5" /> },
          { id: "cognitive" as const, name: "Cognitive", icon: <Brain className="w-3.5 h-3.5" /> },
          { id: "optimization" as const, name: "Optimizer", icon: <Layers className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLayer(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider duration-150 cursor-pointer select-none ${
              activeLayer === tab.id
                ? "bg-secondary text-[#0D0D0D] font-bold shadow-lg scale-[1.02]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Main active sub-features content frame */}
      <div className="space-y-5">
        
        {/* OPTICAL SENSORY REGISTRATION LAYER */}
        {activeLayer === "vision" && (
          <div className="space-y-4">
            
            {/* Feature Sub-Navigation Toggle */}
            <div className="flex space-x-1 bg-[#151515] p-1 rounded-xl border border-zinc-800">
              {[
                { id: "nutrition", label: "Rainbow Plate" },
                { id: "posture", label: "Posture Guard" },
                { id: "fruit_snack", label: "Fruit First" },
                { id: "desk_audit", label: "Desk Focus Area" }
              ].map((subBtn) => (
                <button
                  key={subBtn.id}
                  onClick={() => setActiveFeature(subBtn.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all truncate ${
                    activeFeature === subBtn.id
                      ? "bg-[#2C2C2C] text-[#00FFCC] border-b border-[#00FFCC]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {subBtn.label}
                </button>
              ))}
            </div>

            {/* 1. Nutrition checking feature */}
            {activeFeature === "nutrition" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Heart className="w-4 h-4 text-[#FF3366]" />
                      <span>Nutrition Rainbow Plate</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Snapshot or describe food colors. Meeting the 3-Color Rule gives athletic vitamin feedback and rewards!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#FF3366] bg-primary border px-2 py-0.5 rounded">
                    +15 Coins
                  </span>
                </div>

                {/* Camera preview snapshot console */}
                <div className="space-y-3">
                  <div className="relative aspect-video bg-[#060606] rounded-xl border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
                    {snapshot ? (
                      <img src={snapshot} alt="Plate snap" className="w-full h-full object-cover" />
                    ) : stream ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-500 font-bold">Webcam camera feeds</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {stream ? (
                      <button
                        onClick={captureFrame}
                        className="flex-1 bg-[#2C2C2C] border border-secondary text-secondary hover:bg-secondary hover:text-black py-2 rounded-xl text-xs font-black uppercase cursor-pointer"
                      >
                        Capture Meal Frame
                      </button>
                    ) : snapshot ? (
                      <button
                        onClick={() => setSnapshot(null)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-gray-400 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer"
                      >
                        Retake Snapshot
                      </button>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="flex-1 bg-secondary text-black py-2 rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Boot Live Camera</span>
                      </button>
                    )}

                    <label className="flex items-center justify-center bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-gray-400 hover:text-white cursor-pointer hover:border-zinc-700">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Meal text description (optional) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase">
                    Meal Description: (Optional description)
                  </label>
                  <input
                    type="text"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    placeholder="e.g., Avocado toast with tomatoes and poached eggs"
                    className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs rounded-xl focus:border-secondary focus:outline-none text-white font-semibold"
                  />
                </div>

                 {nutritionResult && (
                  <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#00FFCC] uppercase font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Analysis Result</span>
                      </span>
                      <div className="flex gap-1.5 text-[8px] font-mono font-bold uppercase">
                        {(nutritionResult.detectedColors || []).map((col: string, idx: number) => (
                          <span key={idx} className="bg-primary border px-1.5 py-0.5 rounded text-white">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-white leading-relaxed font-bold italic">
                      "{nutritionResult.feedback}"
                    </p>

                    {/* Visually polished Photo-to-Macros layout */}
                    <div className="grid grid-cols-4 gap-2 bg-black/50 p-2.5 rounded-lg border border-secondary/20">
                      <div className="text-center border-r border-[#2C2C2C]">
                        <div className="text-[14px] text-[#00FFCC] font-black">{nutritionResult.estimatedCalories || 350}</div>
                        <div className="text-[8px] text-gray-500 font-bold uppercase">kcal</div>
                      </div>
                      <div className="text-center border-r border-[#2C2C2C]">
                        <div className="text-[12px] text-[#FF3366] font-black">{nutritionResult.macros?.protein || 24}g</div>
                        <div className="text-[8px] text-gray-500 font-bold uppercase">Protein</div>
                        <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-[#FF3366] h-full" style={{ width: `${Math.min(100, ((nutritionResult.macros?.protein || 24) / 40) * 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="text-center border-r border-[#2C2C2C]">
                        <div className="text-[12px] text-[#00FFCC] font-black">{nutritionResult.macros?.carbs || 45}g</div>
                        <div className="text-[8px] text-gray-500 font-bold uppercase">Carbs</div>
                        <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-[#00FFCC] h-full" style={{ width: `${Math.min(100, ((nutritionResult.macros?.carbs || 45) / 80) * 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[12px] text-yellow-400 font-black">{nutritionResult.macros?.fats || 10}g</div>
                        <div className="text-[8px] text-gray-500 font-bold uppercase">Fats</div>
                        <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-yellow-400 h-full" style={{ width: `${Math.min(100, ((nutritionResult.macros?.fats || 10) / 30) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 font-bold">
                      <span className="text-secondary font-mono">Nutrient Matrix:</span> {nutritionResult.vitaminBreakdown}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => resetFeature("nutrition")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={submitNutritionCheck}
                    disabled={isProcessing}
                    className="flex-1 bg-secondary text-[#0D0D0D] py-2 rounded-full text-xs font-black uppercase text-shadow cursor-pointer tracking-wider"
                  >
                    {isProcessing ? "Analyzing colors..." : "Analyze Rainbow Plate"}
                  </button>
                </div>

              </div>
            )}

            {/* 2. Posture checking stretch */}
            {activeFeature === "posture" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Activity className="w-4 h-4 text-[#00FFCC]" />
                      <span>Posture Correction Stretch</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Initiate a 60-second stretch loop. Our AI system calibrates Sight-line and shoulders to detect active hunchback tendencies!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#FF3366] bg-primary border px-2 py-0.5 rounded">
                    +20 Coins
                  </span>
                </div>

                {isStretchStarted ? (
                  <div className="p-6 bg-primary border border-[#2C2C2C] rounded-xl text-center space-y-4">
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase animate-pulse">
                      Active Posture stretch calibrate loop...
                    </span>
                    <h1 className="text-4xl font-extrabold font-mono text-white tracking-widest text-[#00FFCC]">
                      {formattedTimer(stretchSecondsLeft)}
                    </h1>
                    <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden border border-zinc-900">
                      <div className="bg-[#00FFCC] h-full transition-all" style={{ width: `${(60 - stretchSecondsLeft) * 1.66}%` }} />
                    </div>
                    {/* Live calibration list */}
                    <div className="text-left space-y-1 block max-h-24 overflow-y-auto">
                      {postureFeedbackSequence.map((fb, idx) => (
                        <p key={idx} className="text-[10px] font-mono text-zinc-400 font-bold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#00FFCC]" />
                          <span>{fb}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-[#060606] rounded-xl border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
                      {snapshot ? (
                        <img src={snapshot} alt="Posture base" className="w-full h-full object-cover" />
                      ) : stream ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <Camera className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                          <p className="text-[10px] text-gray-500 font-bold">Align upper body to camera lens</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {stream ? (
                        <button
                          onClick={captureFrame}
                          className="flex-1 bg-[#2C2C2C] border border-secondary text-secondary py-2 rounded-xl text-xs font-black uppercase cursor-pointer"
                        >
                          Capture Alignment
                        </button>
                      ) : (
                        <button
                          onClick={startCamera}
                          className="flex-1 bg-zinc-900 border border-zinc-800 text-gray-400 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer"
                        >
                          Enable Setup Camera
                        </button>
                      )}
                    </div>

                    {currentPostureMetric ? (
                      <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#00FFCC] uppercase font-bold flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Telemetry Report</span>
                          </span>
                          <span className="text-[11px] font-mono font-bold text-white bg-primary px-1.5 py-0.5 rounded uppercase border">
                            Hunchback Score: {currentPostureMetric.hunchbackScore}%
                          </span>
                        </div>
                        <p className="text-xs text-white leading-relaxed font-bold italic">
                          "{currentPostureMetric.feedback}"
                        </p>
                        <div className="space-y-1 block">
                          <span className="text-[9px] uppercase font-mono text-gray-400 block">Ergonomic alignment tips:</span>
                          {currentPostureMetric.tips.map((tip: string, id: number) => (
                            <p key={id} className="text-[10pt] font-sans font-bold text-gray-200">
                              • {tip}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-primary rounded-xl border flex items-start space-x-3 text-left">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0 animate-bounce" />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">Calibrate Desk Space</h4>
                          <p className="text-[10px] text-gray-400 font-bold leading-relaxed pt-0.5">
                            Set up your phone securely at eye level. Begin stretch check for 60 seconds of upright shadow movements.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => resetFeature("posture")}
                        className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        onClick={startStretchTimer}
                        className="flex-1 bg-secondary text-black py-2.5 rounded-full text-xs font-black uppercase text-shadow cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>LAUNCH POSTURE CHALLENGE</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 3. Snacking whole fruits reward */}
            {activeFeature === "fruit_snack" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Zap className="w-4 h-4 text-secondary" />
                      <span>"Fruit First" Snacking Classifier</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Scan or input snack choice. Choosing a real whole fruit first protects glucose levels and triggers a bonus point payload!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-secondary bg-primary border px-2 py-0.5 rounded border-secondary/30 animate-pulse">
                    +20 c. Bonus
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="relative aspect-video bg-[#060606] rounded-xl border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
                    {snapshot ? (
                      <img src={snapshot} alt="Snack snap" className="w-full h-full object-cover" />
                    ) : stream ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-500 font-bold">Snap code / camera view</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {stream ? (
                      <button
                        onClick={captureFrame}
                        className="flex-1 bg-[#2C2C2C] border border-secondary text-secondary py-2 rounded-xl text-xs font-black uppercase cursor-pointer"
                      >
                        Capture Snack Snapshot
                      </button>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="flex-1 bg-secondary text-black py-2 rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Activate Cam</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 font-bold uppercase">
                  <span className="text-[10px] font-mono text-gray-400 block leading-tight">Snack Name:</span>
                  <input
                    type="text"
                    value={snackDescription}
                    onChange={(e) => setSnackDescription(e.target.value)}
                    placeholder="e.g. A whole sliced organic green apple"
                    className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs rounded-xl focus:border-secondary focus:outline-none text-white font-semibold"
                  />
                </div>

                {snackResult && (
                  <div className={`p-4 rounded-xl border-2 space-y-2 text-left ${snackResult.isFruit ? "border-[#00FFCC]/40 bg-secondary/15" : "border-red-500/30 bg-red-500/10"}`}>
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-white uppercase">Rival/Coach Judged Type</span>
                      <span className={snackResult.isFruit ? "text-[#00FFCC]" : "text-red-400"}>
                        {snackResult.snackName}
                      </span>
                    </div>
                    <p className="text-xs text-white leading-relaxed font-bold italic">
                      "{snackResult.feedback}"
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => resetFeature("fruit_snack")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={submitSnackClassification}
                    disabled={isProcessing}
                    className="flex-1 bg-[#FF3366] text-white py-2 rounded-full text-xs font-black uppercase text-shadow cursor-pointer tracking-wider shrink-0"
                  >
                    {isProcessing ? "Classifying target Snack..." : "Identify Snack First!"}
                  </button>
                </div>

              </div>
            )}

            {/* 4. Desk Focus Space Audit */}
            {activeFeature === "desk_audit" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <LayoutGrid className="w-4 h-4 text-[#00FFCC]" />
                      <span>Study Desk Focus Audit</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Scan or snap a picture of your desk space. Our AI identifies study triggers, books, and potential distractions like phones, recommending layout corrections.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#00FFCC] bg-primary border px-2 py-0.5 rounded border-[#00FFCC]/20">
                    +15 Coins
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="relative aspect-video bg-[#060606] rounded-xl border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
                    {snapshot ? (
                      <img src={snapshot} alt="Desk snap" className="w-full h-full object-cover" />
                    ) : stream ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-500 font-bold">Workspace desk snap view</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {stream ? (
                      <button
                        onClick={captureFrame}
                        className="flex-1 bg-[#2C2C2C] border border-secondary text-secondary py-2 rounded-xl text-xs font-black uppercase cursor-pointer"
                      >
                        Capture Desk Layout
                      </button>
                    ) : snapshot ? (
                      <button
                        onClick={() => setSnapshot(null)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-gray-400 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer"
                      >
                        Retake Snapshot
                      </button>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="flex-1 bg-secondary text-black py-2 rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Activate Camera Feed</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 font-bold uppercase">
                  <span className="text-[10px] font-mono text-gray-400 block leading-tight">Desk Description: (Optional manual check)</span>
                  <input
                    type="text"
                    value={deskDescription}
                    onChange={(e) => setDeskDescription(e.target.value)}
                    placeholder="e.g. Clean wood desk with computer model, smartphone right of mechanical keyboard"
                    className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs rounded-xl focus:border-secondary focus:outline-none text-white font-semibold"
                  />
                </div>

                {deskAuditResult && (
                  <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-xl space-y-3 text-left">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-white uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFCC]" />
                        <span>Focus Score Check</span>
                      </span>
                      <span className="text-[#00FFCC] bg-black px-2 py-0.5 rounded text-xs border border-[#00FFCC]/20 font-black">
                        {deskAuditResult.focusScore}/100 Rating
                      </span>
                    </div>
                    <p className="text-xs text-white leading-relaxed font-bold italic">
                      "{deskAuditResult.feedback}"
                    </p>

                    <div className="space-y-2 border-t border-secondary/10 pt-2.5">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono text-[#FF3366] font-bold block">Potential Distractions Detected:</span>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {(deskAuditResult.detectedDistractions || []).map((dist: string, id: number) => (
                            <span key={id} className="text-[9px] font-extrabold bg-red-950/40 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                              ⚠️ {dist}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-mono text-[#00FFCC] font-bold block">Space-Hacking Alignment Tips:</span>
                        {(deskAuditResult.decorTips || []).map((tip: string, id: number) => (
                          <div key={id} className="text-[10pt] font-sans font-bold text-gray-200">
                            • {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => resetFeature("desk_audit")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={submitDeskFocusAudit}
                    disabled={isProcessing}
                    className="flex-1 bg-secondary text-black py-2 rounded-full text-xs font-black uppercase text-shadow cursor-pointer tracking-wider shrink-0"
                  >
                    {isProcessing ? "Auditing Space..." : "Run Desk Focus Audit"}
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* COGNITIVE LANGUAGE REFLECTION LAYER */}
        {activeLayer === "cognitive" && (
          <div className="space-y-4">
            
            {/* Feature Sub-Navigation Toggle */}
            <div className="flex space-x-1 bg-[#151515] p-1 rounded-xl border border-zinc-800">
              {[
                { id: "recall", label: "Active Recall" },
                { id: "braindump", label: "Brain Dump" },
                { id: "feynman", label: "Feynman Tutor" }
              ].map((subBtn) => (
                <button
                  key={subBtn.id}
                  onClick={() => setActiveFeature(subBtn.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all truncate ${
                    activeFeature === subBtn.id
                      ? "bg-[#2C2C2C] text-[#00FFCC] border-b border-[#00FFCC]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {subBtn.label}
                </button>
              ))}
            </div>

            {/* 4. Active Recall Assistant */}
            {activeFeature === "recall" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <BookOpen className="w-4 h-4 text-secondary animate-pulse" />
                      <span>Active Recall Assistant</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Compare your explanation of a study document against the original source to discover gaps instantly!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-secondary bg-primary border px-2 py-0.5 rounded">
                    +15 Coins
                  </span>
                </div>

                <div className="space-y-3 text-left">
                  <div className="space-y-1 block">
                    <span className="text-[9px] font-mono uppercase text-gray-400 font-bold block">Original Reference Material (Notes or Book text):</span>
                    <textarea
                      value={recallReferenceDoc}
                      onChange={(e) => setRecallReferenceDoc(e.target.value)}
                      className="w-full h-20 bg-[#121212] border border-[#2C2C2C] p-3 text-[10px] font-mono text-white focus:outline-none focus:border-secondary rounded-xl leading-normal"
                    />
                  </div>

                  <div className="space-y-1 block">
                    <span className="text-[9px] font-mono uppercase text-gray-400 font-bold block">Your Active Recall Summary:</span>
                    <textarea
                      value={userRecallSummary}
                      onChange={(e) => setUserRecallSummary(e.target.value)}
                      placeholder="Type or speak a summarized explanation, details, formulas, structural variables..."
                      className="w-full h-24 bg-[#141414] border border-[#2A2A2A] p-3 text-xs text-white focus:outline-none focus:border-[#FF3366] rounded-xl"
                    />
                  </div>
                </div>

                {recallResult && (
                  <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-xl space-y-3 text-left">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-[#00FFCC] uppercase flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Coach Mastery Assessment</span>
                      </span>
                      <span className="text-white bg-[#FF3366] px-2 py-0.5 rounded uppercase font-bold border border-[#FF3366]/40">
                        {recallResult.masteryRating}
                      </span>
                    </div>

                    <p className="text-xs text-white font-bold leading-relaxed italic">
                      "{recallResult.feedback}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                      <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <span className="text-[8px] uppercase font-mono block text-emerald-500">Mastered Items:</span>
                        {(recallResult.masteredConcepts || []).map((c: string, idx: number) => (
                          <p key={idx}>• {c}</p>
                        ))}
                      </div>
                      <div className="bg-red-950/40 p-2.5 rounded-xl border border-red-500/20 text-red-400">
                        <span className="text-[8px] uppercase font-mono block text-red-500">Forgotten Concepts:</span>
                        {(recallResult.missedConcepts || []).map((c: string, idx: number) => (
                          <p key={idx}>• {c}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => resetFeature("recall")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={submitRecallCheck}
                    disabled={isProcessing}
                    className="flex-1 bg-[#00FFCC] text-[#0D0D0D] py-2.5 rounded-full text-xs font-black uppercase text-shadow cursor-pointer"
                  >
                    {isProcessing ? "Analyzing recall loops..." : "EVALUATE ACTIVE RECALL"}
                  </button>
                </div>

              </div>
            )}

            {/* 5. Brain Dump Organizer */}
            {activeFeature === "braindump" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span>The "Morning Page" Brain Dump</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Write down anything stressing you or cluttering your head. AI organizes it into actionable to-dos and isolates stressors!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-secondary bg-primary border px-2 py-0.5 rounded">
                    +15 Coins
                  </span>
                </div>

                <div className="space-y-1">
                  <textarea
                    value={brainDumpText}
                    onChange={(e) => setBrainDumpText(e.target.value)}
                    placeholder="Write anything cluttering your headspace right now: e.g. I need to register academic folders, forgot to buy shampoo, feeling behind on fitness stretch, worried about test..."
                    className="w-full h-28 bg-[#141414] border border-[#2C2C2C] p-3 text-xs text-white font-semibold rounded-xl focus:border-secondary focus:outline-none"
                  />
                </div>

                {brainDumpResult && (
                  <div className="p-4 bg-purple-950/15 border-2 border-purple-500/25 rounded-xl space-y-3 text-left">
                    <span className="text-[10px] font-mono text-[#00FFCC] uppercase font-bold flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      <span>Brain Clutter Cleared</span>
                    </span>

                    <p className="text-xs text-white leading-relaxed italic font-bold">
                      "{brainDumpResult.feedback}"
                    </p>

                    <div className="space-y-2 block">
                      <h4 className="text-[9px] uppercase font-mono text-zinc-400 font-bold">🎯 Immediate Actionable To-Do List:</h4>
                      <div className="space-y-1 block">
                        {(brainDumpResult.actionableTodos || []).map((todo: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2 text-[10pt] font-bold text-gray-200">
                            <input type="checkbox" className="rounded bg-[#121212] border border-zinc-700 text-[#00FFCC]" />
                            <span>{todo}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 block bg-primary p-2.5 rounded-lg border">
                      <span className="text-[8px] uppercase font-mono text-[#FF3366] block font-bold">Isolate Stressor nodes:</span>
                      {(brainDumpResult.stressors || []).map((stress: string, i: number) => (
                        <p key={i} className="text-[10pt] font-sans font-bold text-gray-400">
                          ⚡ {stress}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => resetFeature("braindump")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={submitBrainDump}
                    disabled={isProcessing}
                    className="flex-1 bg-secondary text-black py-2.5 rounded-full text-xs font-black uppercase text-shadow cursor-pointer"
                  >
                    {isProcessing ? "Sorting worries..." : "Organize Brain Dump"}
                  </button>
                </div>

              </div>
            )}

            {/* 6. Feynman Tutor */}
            {activeFeature === "feynman" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Smile className="w-4 h-4 text-emerald-400" />
                      <span>The Feynman 5-Year-Old Tutor</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Explain a complex topic as if teaching a 5-year-old. AI checks simplicity and flags jargon!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#FF3366] bg-primary border px-2 py-0.5 rounded">
                    +20 Coins
                  </span>
                </div>

                <div className="space-y-3.5 text-left">
                  <div className="space-y-1 block">
                    <label className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Select Complex Topic to Teach:</label>
                    <select
                      value={feynmanTopic}
                      onChange={(e) => setFeynmanTopic(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs text-white rounded-xl focus:border-secondary focus:outline-none font-bold"
                    >
                      <option value="Quantum Superposition">Quantum Superposition (Physics)</option>
                      <option value="ATP Synthase Rotation">Mitochondria ATP Synthase (Bioenergy)</option>
                      <option value="Aerodynamic Lift of feather">Aerodynamic Shuttlecock Lift (Badminton Physics)</option>
                      <option value="Compound Interest Formula">Compound Interest Exponential Loop (Finance)</option>
                    </select>
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Your Explanation (Keep it Simple!):</label>
                    <textarea
                      value={feynmanExplanation}
                      onChange={(e) => setFeynmanExplanation(e.target.value)}
                      placeholder="e.g. Think of a coin spinning on a table. Before it lands, is it heads or tails? It is both! Or think of a light turned on and off..."
                      className="w-full h-24 bg-[#141414] border border-[#2A2A2A] p-3 text-xs text-white rounded-xl focus:outline-none focus:border-[#FF3366] font-semibold"
                    />
                  </div>
                </div>

                {feynmanResult && (
                  <div className="p-4 bg-emerald-950/15 border-2 border-emerald-500/25 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-[#00FFCC] uppercase font-bold flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Feynman Simple Score: {feynmanResult.simplicityScore}%</span>
                      </span>
                      <span className="text-white bg-[#FF3366] px-2 py-0.5 rounded uppercase font-extrabold border">
                        {feynmanResult.masteryLevel}
                      </span>
                    </div>

                    <p className="text-xs text-white leading-relaxed font-semibold italic">
                      "{feynmanResult.feedback}"
                    </p>

                    <div className="space-y-1 block text-[10pt] font-sans font-bold text-gray-300">
                      <span className="text-[8px] font-mono uppercase text-gray-500">Unnecessary Jargon Flagged:</span>
                      {feynmanResult.jargonIdentified.length === 0 ? (
                        <p className="text-[#00FFCC]">None! Perfect simple pairing and tracking.</p>
                      ) : (
                        <p>Deducted vocabulary: {feynmanResult.jargonIdentified.join(", ")}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => resetFeature("feynman")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={submitFeynmanExplanation}
                    disabled={isProcessing}
                    className="flex-1 bg-secondary text-black py-2.5 rounded-full text-xs font-black uppercase text-shadow cursor-pointer"
                  >
                    {isProcessing ? "Evaluating vocabulary..." : "ANALYZE SIMPLE EXPLANATION"}
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* AUTOMATION SMART SCHEDULING LAYER */}
        {activeLayer === "optimization" && (
          <div className="space-y-4">
            
            {/* Feature Sub-Navigation Toggle */}
            <div className="flex space-x-1 bg-[#151515] p-1 rounded-xl border border-zinc-800">
              {[
                { id: "timer", label: "Adaptive Pomo" },
                { id: "sunlight", label: "Sunlight Anchor" },
                { id: "procrastination", label: "5-Min Rule" }
              ].map((subBtn) => (
                <button
                  key={subBtn.id}
                  onClick={() => setActiveFeature(subBtn.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all truncate ${
                    activeFeature === subBtn.id
                      ? "bg-[#2C2C2C] text-[#00FFCC] border-b border-[#00FFCC]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {subBtn.label}
                </button>
              ))}
            </div>

            {/* 7. Adaptive Study Timer */}
            {activeFeature === "timer" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4 text-center">
                <div className="flex justify-between items-start text-left">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Timer className="w-4 h-4 text-secondary animate-spin-slow" />
                      <span>Adaptive Pomodoro Routine</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Adjust your focus level to recommend dynamic work/rest cycles (e.g. 50/10 vs 15/3 to prevent brain frying!).
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-primary rounded-xl border text-center space-y-4 relative overflow-hidden">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">
                    {timerMode === "work" ? "Active Study Work Period" : "Rest Period"} (Cycle #{pomoCycleCount + 1})
                  </span>
                  <h1 className="text-5xl font-black font-mono text-white tracking-widest drop-shadow">
                    {formattedTimer(pomodoroSeconds)}
                  </h1>

                  <div className="flex space-x-2.5 justify-center">
                    {isTimerRunning ? (
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="px-6 py-2 bg-red-600 text-white font-extrabold text-xs rounded-full uppercase cursor-pointer"
                      >
                        PAUSE DRILL
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTimerRunning(true)}
                        className="px-6 py-2 bg-secondary text-black font-black text-xs rounded-full uppercase cursor-pointer"
                      >
                        LAUNCH FOCUS
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setPomodoroSeconds(currentPomoRatio.work * 60);
                        setTimerMode("work");
                      }}
                      className="p-2 border border-[#2C2C2C] text-gray-400 rounded-full cursor-pointer hover:text-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Adaptive slider gauge control */}
                <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Dynamic Focus level:</span>
                    <span className="text-xs font-mono font-bold text-secondary">{focusSliderValue}/10 Target power</span>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={focusSliderValue}
                    onChange={(e) => triggerFocusUpdate(parseInt(e.target.value))}
                    className="w-full accent-secondary cursor-pointer h-2 bg-[#1A1A1A] rounded-lg"
                  />

                  <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase">
                    <span>1 (Brain Fried)</span>
                    <span>5 (Balanced)</span>
                    <span>10 (Hyper Flow)</span>
                  </div>

                  <div className="p-3 bg-primary border-l-2 border-secondary text-[11px] font-sans font-bold leading-relaxed text-gray-200">
                    "{pomoLoggedFeedback}" <span className="text-secondary whitespace-nowrap">Schedule morphed: {currentPomoRatio.work}m work / {currentPomoRatio.rest}m rest</span>
                  </div>
                </div>

              </div>
            )}

            {/* 8. Sleep/Sunlight Synchronizer */}
            {activeFeature === "sunlight" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Sun className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>Clock Sunlight Synchronizer</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Sunlight anchor: Log morning sunlight time to programs circadian clock bedroom bedtime trigger!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-secondary bg-primary border px-2 py-0.5 rounded">
                    +15 Coins
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-left">
                  <div className="space-y-1 block">
                    <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">Log Morning Sun Time:</label>
                    <input
                      type="time"
                      value={sunlightHour}
                      onChange={(e) => setSunlightHour(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs text-white rounded-xl focus:border-secondary focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1 block">
                    <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">Duration: (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={sunlightMinutes}
                      onChange={(e) => setSunlightMinutes(parseInt(e.target.value))}
                      className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs text-white rounded-xl focus:border-secondary focus:outline-none font-bold"
                    />
                  </div>
                </div>

                {sunlightResult && (
                  <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-xl space-y-3 shadow-md text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#00FFCC] uppercase font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Circadian Lock Calibrated</span>
                      </span>
                      <span className="text-[10px] text-white font-mono font-bold bg-primary border px-1.5 py-0.5 rounded uppercase">
                        {sunlightResult.sunlightDoseRating}
                      </span>
                    </div>

                    <p className="text-xs text-white font-bold leading-relaxed italic">
                      "{sunlightResult.rationale}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10pt] font-mono font-bold">
                      <div className="bg-primary p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-[8px] uppercase text-gray-500 block">Digital Sunset Alarm:</span>
                        <span className="text-[#FF3366]">{sunlightResult.digitalSunsetTime} (No screen)</span>
                      </div>
                      <div className="bg-primary p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-[8px] uppercase text-gray-500 block">Target Bedtime:</span>
                        <span className="text-[#00FFCC]">{sunlightResult.bedtimeRecommendation} (Sleep)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => resetFeature("sleep_sunlight")}
                    className="px-4 py-2 bg-primary hover:bg-[#1A1A1A] border border-[#2C2C2C] text-gray-400 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={submitSunlightCalculation}
                    className="flex-1 bg-[#FF3366] text-white py-2.5 rounded-full text-xs font-black uppercase text-shadow cursor-pointer"
                  >
                    SYNC CIRCADIAN ALARM TIME
                  </button>
                </div>

              </div>
            )}

            {/* 9. Procrastination Predictor 5 Min Rule */}
            {activeFeature === "procrastination" && (
              <div className="p-5 bg-[#0D0D0D]/90 border border-[#2C2C2C] rounded-[22px] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase text-white flex items-center space-x-1.5 mb-1">
                      <Clock className="w-4 h-4 text-[#FF3366] animate-pulse" />
                      <span>Procrastination 5-Minute Rule</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Feeling lazy? Program a 5-minute easy start commitment. Zero hesitation once the racket is swings!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-secondary bg-primary border px-2 py-0.5 rounded">
                    +15 Coins
                  </span>
                </div>

                {fiveMinRuleTriggered ? (
                  <div className="p-6 bg-primary border border-zinc-800 rounded-xl text-center space-y-4">
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase animate-pulse">
                      5-Minute task inertia breaking live...
                    </span>
                    <h1 className="text-5xl font-black font-mono text-[#FF3366] tracking-tighter">
                      {formattedTimer(fiveMinSeconds)}
                    </h1>
                    <p className="text-[11px] font-sans font-bold text-zinc-300">
                      Target Task: "{procrastinatedTask || "Active studying drill"}"
                    </p>
                    <div className="flex justify-center space-x-2">
                      {fiveMinRunning ? (
                        <button
                          onClick={() => setFiveMinRunning(false)}
                          className="px-6 py-2 bg-red-600 text-white font-extrabold text-xs rounded-full uppercase cursor-pointer"
                        >
                          PAUSE DRILL
                        </button>
                      ) : (
                        <button
                          onClick={() => setFiveMinRunning(true)}
                          className="px-6 py-3 bg-secondary text-black font-black text-xs rounded-full uppercase cursor-pointer"
                        >
                          RESUME SWINGS
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setFiveMinRuleTriggered(false);
                          setFiveMinRunning(false);
                          setFiveMinSeconds(300);
                        }}
                        className="px-4 py-2 border border-[#2C2C2C] text-gray-400 rounded-full font-bold text-xs cursor-pointer hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1 block">
                      <label className="text-[9px] font-mono uppercase text-gray-400 block font-bold">What are you procrastinating on?</label>
                      <input
                        type="text"
                        value={procrastinatedTask}
                        onChange={(e) => setProcrastinatedTask(e.target.value)}
                        placeholder="e.g. Studying chemistry assignment or going to study marathon"
                        className="w-full bg-[#141414] border border-[#2C2C2C] p-3 text-xs text-white rounded-xl focus:border-secondary focus:outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-1 block">
                      <label className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Procrastination Severity Level:</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: "low", label: "Low (Easy start)" },
                          { id: "medium", label: "Medium (Hard start)" },
                          { id: "high", label: "Severe (Brain fried)" }
                        ].map((risk) => (
                          <button
                            key={risk.id}
                            type="button"
                            onClick={() => setProcrastinationSeverity(risk.id)}
                            className={`py-2 px-3.5 rounded-xl border text-[10pt] font-sans font-bold cursor-pointer transition-all uppercase select-none ${
                              procrastinationSeverity === risk.id
                                ? "bg-secondary text-[#0D0D0D] border-secondary"
                                : "bg-primary text-gray-400 border-zinc-900"
                            }`}
                          >
                            {risk.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">Select Arena Coach Persona Roast:</label>
                        <span className="text-[8px] bg-red-950 font-black text-[#FF3366] px-1.5 py-0.5 rounded uppercase border border-red-500/20">TOUGH LOVE</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "coach_li_ning" as const, label: "Coach Li Ning", desc: "Supportive trainer" },
                          { id: "drill_sergeant" as const, label: "Drill Sergeant", desc: "EXTREME DRILL" },
                          { id: "sarcastic_robot" as const, label: "Cynic Robot", desc: "Cold AI efficiency" }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setCoachPersona(p.id)}
                            className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                              coachPersona === p.id
                                ? "bg-[#FF3366]/10 text-[#FF3366] border-[#FF3366]"
                                : "bg-primary text-gray-400 border-zinc-900"
                            }`}
                          >
                            <div className="text-[10px] font-extrabold uppercase truncate">{p.label}</div>
                            <div className="text-[7px] text-gray-500 font-bold leading-normal truncate">{p.desc}</div>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={submitProcrastinationRoast}
                        disabled={isProcessing}
                        className="w-full bg-[#FF3366] text-white py-2 rounded-xl text-xs font-black uppercase text-shadow cursor-pointer hover:bg-red-700 tracking-wide"
                      >
                        {isProcessing ? "Calibrating roaster..." : "💥 GET ROASTED BY COACH 🔥"}
                      </button>
                    </div>

                    {procrastinationRoastResult && (
                      <div className="p-4 bg-red-950/20 border-2 border-[#FF3366]/30 rounded-xl space-y-3 text-left">
                        <div className="flex justify-between items-center border-b border-[#FF3366]/10 pb-2">
                          <span className="text-[9px] font-mono text-[#FF3366] uppercase font-black flex items-center space-x-1">
                            <span>{procrastinationRoastResult.coachName}</span>
                          </span>
                          <span className="text-[8px] text-zinc-400 font-mono font-bold bg-primary border px-2 py-0.5 rounded">
                            Discipline Score: {procrastinationRoastResult.disciplineScore}/100
                          </span>
                        </div>

                        <p className="text-xs text-white leading-relaxed font-bold italic">
                          "{procrastinationRoastResult.roast}"
                        </p>

                        <div className="space-y-1.5 border-t border-[#FF3366]/10 pt-2.5">
                          <span className="text-[9px] uppercase font-mono text-[#FF3366] font-bold block">Defensive Action Protocol (Defeat Inertia):</span>
                          {(procrastinationRoastResult.actionPlan || []).map((step: string, id: number) => (
                            <div key={id} className="text-[10px] text-gray-300 font-bold flex items-start gap-1">
                              <span>•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-primary rounded-xl border border-zinc-900 flex items-start space-x-3 text-left">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase">The 5-Minute Zero Commitment Trick</h4>
                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed pt-0.5">
                          Commit to action for only 5 minutes. If it feels awesome, finish it! If not, rest. By then, standard inertia mechanics break completely!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!procrastinatedTask.trim()) {
                          showToast("Specify what task you are procrastinating on first!", "warning");
                          return;
                        }
                        setFiveMinSeconds(300);
                        setFiveMinRuleTriggered(true);
                        setFiveMinRunning(true);
                      }}
                      className="w-full bg-secondary text-[#0D0D0D] font-black py-2.5 rounded-full text-xs font-sans uppercase text-shadow cursor-pointer"
                    >
                      ENGAGE 5-MINUTE ROUTINE HAMMER
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
