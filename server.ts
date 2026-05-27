import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini SDK with client telemetry
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini SDK successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini SDK:", err);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is not configured in environment variables. Falling back to simulated smart coach responses.");
}

// Motivational sports quotes
const SPORTS_QUOTES = [
  "Coach Li Ning: 'Champions keep training when everyone else takes a break! Ready, SET, SMASH!'",
  "Coach Victor: 'Power is nothing without precision. Complete today's drill with perfect form!'",
  "Coach Yonex: 'The court is waiting. Don't let your training drop. Your strength grows with every single hit!'",
  "Coach Yonex: 'Only those who repeat the basics 1,000 times can command the godly dark aura of court victory!'",
  "Rival Li Ning: 'You think you are healthier? Water is your racket's tension. Hydrate and do morning swings!'",
  "Rival Victor: 'My racket is strung at 32lbs, what about yours? Hit the gym and build your explosive smash!'"
];

// Helper to clean up base64 image prefixes
const stripBase64Prefix = (base64Str: string): { mimeType: string; data: string } => {
  const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/jpeg", data: base64Str };
};

// Shared local fallback generator for the 9 multi-layer AI Features
const getOfflineFallback = (featureType: string, payload: any): any => {
  const mockCoach = "Coach Li Ning [Local Engine]";
  if (featureType === "nutrition") {
    return {
      verified: true,
      detectedColors: ["Red", "Green", "Yellow", "Orange"],
      colorRuleMet: true,
      vitaminBreakdown: "Excellent organic fibers, Vitamin C, hydration assistance, and dietary beta-carotene energy.",
      feedback: "Superb nutrition alignment! Your plate displays gorgeous color variety satisfying the classic 3-Color Rule. This supports active physical defense indexes on the training court. +15 Coins & +20 XP verified!",
      coachPersona: mockCoach,
      rewardCoins: 15,
      xpReward: 20,
      estimatedCalories: 365,
      macros: {
        protein: 26,
        carbs: 42,
        fats: 11
      }
    };
  } else if (featureType === "fruit_snack") {
    const isFruitVal = (payload.descr || "").toLowerCase().includes("apple") || 
                       (payload.descr || "").toLowerCase().includes("banana") || 
                       (payload.descr || "").toLowerCase().includes("orange") || 
                       !!payload.image;
    return {
      isFruit: isFruitVal,
      snackName: isFruitVal ? "Whole Fresh Fruit" : "Processed Refined Snack",
      feedback: isFruitVal
        ? "Sensational choice! Pure fructose paired with healthy fiber slows glucose delivery, totally skipping insulin crash spikes. You are rewarded +20 Coins bonus!"
        : "Spotted! Processed refined snack present. This can trigger energy crashes on the third court drill. Coach recommends packing a whole banana instead to tension raw muscles next time.",
      coachPersona: mockCoach,
      rewardCoins: isFruitVal ? 20 : 5,
      xpReward: 10
    };
  } else if (featureType === "posture") {
    return {
      hunchbackScore: 15,
      feedback: "Sensational active stretch alignment! Your neck and back are aligned, keeping vertebral tension low for sports hits.",
      tips: [
        "Keep phone elevated at eye level when typing.",
        "Every 45 minutes stand and rotate shoulders 5 times."
      ],
      coachPersona: "Coach Victor [Local Engine]"
    };
  } else if (featureType === "recall") {
    return {
      masteryRating: "Aspirant Tier",
      masteredConcepts: ["ATP biochemical reactions", "Independent genomic mtDNA"],
      missedConcepts: ["Double-membrane structure detail", "Independent cellular division capability"],
      feedback: "Awesome summary of mitochondria concepts! You covered core bioenergy pathways, but missed specifying the primary double-membrane wrapping aspect. Master this to elevate court studying!",
      coachPersona: "Coach Victor [Local Engine]"
    };
  } else if (featureType === "braindump") {
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
  } else if (featureType === "feynman") {
    return {
      simplicityScore: 92,
      jargonIdentified: ["Matrices"],
      feedback: "Magnificent explanation! Explaining 'Quantum Superposition' as a spinning coin that's both heads and tails until caught is a brilliant analog safe for 5-year-olds! Jargon bypassed entirely. True court mastery!",
      masteryLevel: "Mastery Confirmed",
      coachPersona: "Coach Li Ning [Local Engine]"
    };
  } else if (featureType === "sleep_sunlight") {
    return {
      sunlightDoseRating: "Peak Activation",
      digitalSunsetTime: "21:30",
      bedtimeRecommendation: "22:30",
      rationale: "Viewing sunlight at 07:30 locks in a consistent circadian clock anchor. Melatonin suppression cycle triggered immediately, planning smooth melatonin release 14 hours later. Sleep is your elite body recovery tool!",
      coachPersona: mockCoach
    };
  } else if (featureType === "desk_audit") {
    return {
      focusScore: 85,
      detectedDistractions: ["Smartphone placed face-up", "Scattered paper files", "Extraneous device on screen"],
      decorTips: [
        "Position smartphone completely out of direct arm reach.",
        "Store old textbook files back on the vertical desk rack.",
        "Secure single liquid bottle anchor within stable range."
      ],
      feedback: "Active desk space analyzed. Very good organization level, but removing those active phone triggers will lock you into higher-output study gears. Secure the zone! +15 Coins & +10 XP awarded.",
      coachPersona: "Coach Victor [Local Engine]"
    };
  } else if (featureType === "procrastination_roast") {
    const task = payload.task || "your workout";
    const persona = payload.persona || "drill_sergeant";
    let roast = "";
    if (persona === "drill_sergeant") {
      roast = `LISTEN UP, CHAMPION! DROP AND GIVE ME TEN! This is NOT a drill! You are sitting there slacking about "${task}" while real Arena masters are doing explosive jump squats! Excuses are lower tension than a kids supermarket plastic toy racket! Pick up your water, adjust your spine, and engage active focus. MOVE IT, MOVE IT, MOVE IT!`;
    } else if (persona === "sarcastic_robot") {
      roast = `Flesh-sack inertia detected. Interrogating why human system has delayed action on "${task}". Calculation metrics suggest your biochemical organism prefers low-tension dopamine loops and sedentary scrolling. Commencing robotic disappointment protocol. Overriding sluggishness core: stand up, rotate joints, and execute the task.`;
    } else {
      roast = `Let's keep it straight. Your delay on "${task}" is slowing down your training level. True mastery is built during times when you don't feel like launching. We are not here to study halfway. Put your phone away, sit tall, and commit to exactly 5 minutes of high-powered effort. The smash power is in you. Let's register it.`;
    }
    return {
      roast,
      disciplineScore: 38,
      actionPlan: [
        "Spend exactly 5 minutes on the task without thinking about the outcome.",
        "Move your phone into another room or lock it in a drawer.",
        "Do 10 rapid jumping jacks or 5 deep chest expansion breaths right now."
      ],
      coachName: persona === "drill_sergeant" ? "Drill Sergeant [Local Roaster]" : persona === "sarcastic_robot" ? "Sarcastic Robot [Local Cynic]" : "Coach Li Ning [Local Engine]"
    };
  }
  return { error: "Unsupported fallback type" };
};

// 1. POST API for AI Habit Verification
app.post("/api/verify-habit", async (req, res) => {
  const { habitId, name, imageData, simulationText } = req.body;

  if (!habitId) {
    return res.status(400).json({ error: "Missing habitId" });
  }

  // Backup fallback behavior if Gemini is not initialized or API key is absent
  if (!ai) {
    // Generate sports evaluation simulation
    const coach = habitId === "habit1" ? "Li Ning" : habitId === "habit2" ? "Victor" : "Yonex";
    const baseFeedback = habitId === "habit1"
      ? "Smashed it! Your posture is excellent, morning hydration tension verified! Morning water and movements got you fully active! +20 XP awarded."
      : habitId === "habit2"
      ? "Studying drill approved! The classroom screenshot or assignment is pristine. Academic stringing holds solid. +30 XP."
      : "Excellent athletic transition verified! You returned home, checked the gym, and studied. Splendid court endurance! +50 XP.";

    return res.json({
      verified: true,
      confidence: 95,
      feedback: `${baseFeedback} (Simulated Coach Assessment)`,
      coachPersona: `Coach ${coach}`
    });
  }

  try {
    const promptText = `
      You are a strict, athletic, high-energy anime sports coach verifying a user's progress for a habit check in "ReadySETGO".
      The user checked: "${name || habitId}" (${habitId}).
      Analyze the target activity. If an image is provided, parse it meticulously to verify if:
      - For "habit1" (Wake up, water, morning exercise): Does it show exercise postures, water intake, a water bottle, sunrise, or stretching?
      - For "habit2" (Go to school to study): Does it show a desk, textbook, notebook, assignments, classroom, online portal, or educational tasks?
      - For "habit3" (Gym, study, home grind): Does it show gym gear, dumbbells, study tools, home workspace, or sport workout actions?

      If the image is just a blank camera preview or unrelated, provide low-confidence or constructive athletic corrections with a stern, anime-style coach attitude. If no image is provided, but a text simulation/logs were sent: "${simulationText || 'grinding'}", assess it and return a verdict.
      
      Respond STRICTLY in JSON format with these exact keys:
      {
        "verified": boolean,
        "confidence": integer from 0 to 100,
        "feedback": "high-energy anime sports mentor review of the action, containing badminton puns and sports references",
        "coachPersona": "Coach Li Ning" / "Coach Victor" / "Coach Yonex" depending on the intensity
      }
    `;

    // Process parts depending on if base64 imageData was attached
    const contents: any[] = [];
    if (imageData && typeof imageData === "string" && imageData.length > 50) {
      try {
        const { mimeType, data } = stripBase64Prefix(imageData);
        contents.push({
          inlineData: {
            mimeType,
            data
          }
        });
      } catch (fileErr) {
        console.error("Error reading base64 image data:", fileErr);
      }
    }
    
    // Push the textual context
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: { type: Type.BOOLEAN, description: "Whether the evidence justifies habit completion" },
            confidence: { type: Type.INTEGER, description: "Confidence percentage (0 to 100)" },
            feedback: { type: Type.STRING, description: "Mentor's visual evaluation and high-octane coaching advice" },
            coachPersona: { type: Type.STRING, description: "Name of the coach assessing (e.g., Coach Yonex, Coach Victor, Coach Li Ning)" }
          },
          required: ["verified", "confidence", "feedback", "coachPersona"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Gemini Verification API Error:", error);
    return res.status(500).json({
      error: error?.message || "Internal verification system failure",
      verified: true, // Graceful recovery for the user on system error
      confidence: 80,
      feedback: "The communication network had a temporal portal breach, but your Coach believes in your athletic integrity. Checked! Keep smashing!",
      coachPersona: "Coach Yonex"
    });
  }
});

// 2. POST API for AI Coach Lab Evaluations
app.post("/api/ai-coach", async (req, res) => {
  const {
    featureType,
    image,
    descr,
    secCompleted,
    reference,
    summary,
    text,
    topic,
    explanation,
    time,
    duration
  } = req.body;

  if (!featureType) {
    return res.status(400).json({ error: "Missing featureType parameter" });
  }

  // Define fallback logic in case Gemini key is missing
  if (!ai) {
    const mockCoach = "Coach Li Ning [Local Engine]";
    if (featureType === "nutrition") {
      return res.json({
        verified: true,
        detectedColors: ["Red", "Green", "Yellow", "Orange"],
        colorRuleMet: true,
        vitaminBreakdown: "Excellent organic fibers, Vitamin C, hydration assistance, and dietary beta-carotene energy.",
        feedback: "Superb nutrition alignment! Your plate displays gorgeous color variety satisfying the classic 3-Color Rule. This supports active physical defense indexes on the training court. +15 Coins & +20 XP verified!",
        coachPersona: mockCoach,
        rewardCoins: 15,
        xpReward: 20
      });
    } else if (featureType === "fruit_snack") {
      const isFruitVal = (descr || "").toLowerCase().includes("apple") || (descr || "").toLowerCase().includes("banana") || (descr || "").toLowerCase().includes("orange") || !!image;
      return res.json({
        isFruit: isFruitVal,
        snackName: isFruitVal ? "Whole Fresh Fruit" : "Processed Refined Snack",
        feedback: isFruitVal
          ? "Sensational choice! Pure fructose paired with healthy fiber slows glucose delivery, totally skipping insulin crash spikes. You are rewarded +20 Coins bonus!"
          : "Spotted! Processed refined snack present. This can trigger energy crashes on the third court drill. Coach recommends packing a whole banana instead to tension raw muscles next time.",
        coachPersona: mockCoach,
        rewardCoins: isFruitVal ? 20 : 5,
        xpReward: 10
      });
    } else if (featureType === "posture") {
      return res.json({
        hunchbackScore: 15,
        feedback: "Sensational active stretch alignment! Your neck and back are aligned, keeping vertebral tension low for sports hits.",
        tips: [
          "Keep phone elevated at eye level when typing.",
          "Every 45 minutes stand and rotate shoulders 5 times."
        ],
        coachPersona: "Coach Victor [Local Engine]"
      });
    } else if (featureType === "recall") {
      return res.json({
        masteryRating: "Aspirant Tier",
        masteredConcepts: ["ATP biochemical reactions", "Independent genomic mtDNA"],
        missedConcepts: ["Double-membrane structure detail", "Independent cellular division capability"],
        feedback: "Awesome summary of mitochondria concepts! You covered core bioenergy pathways, but missed specifying the primary double-membrane wrapping aspect. Master this to elevate court studying!",
        coachPersona: "Coach Victor [Local Engine]"
      });
    } else if (featureType === "braindump") {
      return res.json({
        worries: ["Managing court study logs", "Inertia starting study marathon", "Tension on workout days"],
        actionableTodos: [
          "Organize ReadySETGO study folders (High Priority)",
          "Do a 10-minute warm-up skip to release tension",
          "Open textbook on page 1 and read exactly 3 paragraphs"
        ],
        stressors: ["Worry of falling behind school training routines", "Physical cell fatigue"],
        feedback: "Brain dump completely sorted! Cleared cognitive clutter to make space for athletic badminton focus. Open of workspace ready! +15 Coins & +10 XP added.",
        coachPersona: mockCoach
      });
    } else if (featureType === "feynman") {
      return res.json({
        simplicityScore: 92,
        jargonIdentified: ["Matrices"],
        feedback: "Magnificent explanation! Explaining 'Quantum Superposition' as a spinning coin that's both heads and tails until caught is a brilliant analog safe for 5-year-olds! Jargon bypassed entirely. True court mastery!",
        masteryLevel: "Mastery Confirmed",
        coachPersona: "Coach Li Ning [Local Engine]"
      });
    } else if (featureType === "sleep_sunlight") {
      return res.json({
        sunlightDoseRating: "Peak Activation",
        digitalSunsetTime: "21:30",
        bedtimeRecommendation: "22:30",
        rationale: "Viewing sunlight at 07:30 locks in a consistent circadian clock anchor. Melatonin suppression cycle triggered immediately, planning smooth melatonin release 14 hours later. Sleep is your elite body recovery tool!",
        coachPersona: mockCoach
      });
    } else if (featureType === "desk_audit" || featureType === "procrastination_roast") {
      return res.json(getOfflineFallback(featureType, req.body));
    }
    return res.status(500).json({ error: "Unsupported fallback type" });
  }

  try {
    let promptText = "";
    let schemaProps: any = {};
    let requiredFields: string[] = [];

    const contents: any[] = [];
    if (image && typeof image === "string" && image.length > 50) {
      try {
        const { mimeType, data } = stripBase64Prefix(image);
        contents.push({
          inlineData: { mimeType, data }
        });
      } catch (err) {
        console.error("Image parsing warning in coach endpoint:", err);
      }
    }

    if (featureType === "nutrition") {
      promptText = `
        Evaluate this photo/description ("${descr || 'visual plate'}").
        Identify foods present, colors, and check if it qualifies for the 3-Color Rule (having at least 3 distinct primary colors like green, yellow/orange, red/purple).
        In addition, estimate the total calories (kcal) and basic macronutrients (protein, carbs, and fats in grams) based on the meal contents and portion size you can see or infer.
        Synthesize nutritional benefits, key vitamins, and suggest a supportive, enthusiastic anime sports coaching verdict.
      `;
      schemaProps = {
        verified: { type: Type.BOOLEAN, description: "True if the plate has at least 3 active colors" },
        detectedColors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Primary colors detected" },
        colorRuleMet: { type: Type.BOOLEAN },
        vitaminBreakdown: { type: Type.STRING },
        feedback: { type: Type.STRING },
        coachPersona: { type: Type.STRING },
        estimatedCalories: { type: Type.INTEGER, description: "Estimated total calories of the meal" },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.INTEGER, description: "Estimated protein in grams" },
            carbs: { type: Type.INTEGER, description: "Estimated carbohydrates in grams" },
            fats: { type: Type.INTEGER, description: "Estimated fats in grams" }
          },
          required: ["protein", "carbs", "fats"]
        }
      };
      requiredFields = ["verified", "detectedColors", "colorRuleMet", "vitaminBreakdown", "feedback", "coachPersona", "estimatedCalories", "macros"];

    } else if (featureType === "fruit_snack") {
      promptText = `
        Assess this food item ("${descr || 'visual snack'}"). Determine if it is a whole, natural raw fruit (e.g., banana, apple, orange, grapes, berries, pear, melon, strawberry) or a heavily processed glucose item (e.g., potato chips, cookies, chocolate bar, donuts).
        State clearly if it is healthy or processed, and explain nutritional aspects with sports badminton puns.
      `;
      schemaProps = {
        isFruit: { type: Type.BOOLEAN, description: "True if natural whole raw fruit" },
        snackName: { type: Type.STRING },
        feedback: { type: Type.STRING },
        coachPersona: { type: Type.STRING },
        rewardCoins: { type: Type.INTEGER }
      };
      requiredFields = ["isFruit", "snackName", "feedback", "coachPersona"];

    } else if (featureType === "posture") {
      promptText = `
        Evaluate posture / ergonomics during study stretch checking. Estimate a Hunchback/slouching score from 0 (perfect posture) to 100 (severe hunchback).
        Provide 2 clear, concise ergonomic alignment remedies in bullet points.
      `;
      schemaProps = {
        hunchbackScore: { type: Type.INTEGER },
        feedback: { type: Type.STRING },
        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        coachPersona: { type: Type.STRING }
      };
      requiredFields = ["hunchbackScore", "feedback", "tips", "coachPersona"];

    } else if (featureType === "recall") {
      promptText = `
        Act as an intense badminton training master of study. Compare user's summary ("${summary}") against the original reference textbook material ("${reference}").
        Isolate which critical concepts the student "Mastered" and which ones they missed or "Forgot".
        Rate their recall tier as: "Master Tier", "Aspirant Tier", or "Rookie Tier". Respond with energetic coaching lines.
      `;
      schemaProps = {
        masteryRating: { type: Type.STRING },
        masteredConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
        missedConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.STRING },
        coachPersona: { type: Type.STRING }
      };
      requiredFields = ["masteryRating", "masteredConcepts", "missedConcepts", "feedback", "coachPersona"];

    } else if (featureType === "braindump") {
      promptText = `
        Translate this mental brain-dump ("${text}") into a clear, structured cognitive schedule.
        Filter out raw worries, outline 3 distinct atomic actionable To-Dos (starting with verbs like 'Write', 'Open', 'Do'), and isolate real tension or physical sleep stressors.
      `;
      schemaProps = {
        worries: { type: Type.ARRAY, items: { type: Type.STRING } },
        actionableTodos: { type: Type.ARRAY, items: { type: Type.STRING } },
        stressors: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.STRING },
        coachPersona: { type: Type.STRING }
      };
      requiredFields = ["worries", "actionableTodos", "stressors", "feedback", "coachPersona"];

    } else if (featureType === "feynman") {
      promptText = `
        Critique this student's explanation ("${explanation}") explaining "${topic}" to a 5-year-old.
        Check if the vocabulary is sufficiently simplified. Deduct complex jargon used ("${explanation}") and output a general Simplicity score (0 to 100).
      `;
      schemaProps = {
        simplicityScore: { type: Type.INTEGER },
        jargonIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.STRING },
        masteryLevel: { type: Type.STRING },
        coachPersona: { type: Type.STRING }
      };
      requiredFields = ["simplicityScore", "jargonIdentified", "feedback", "masteryLevel", "coachPersona"];

    } else if (featureType === "sleep_sunlight") {
      promptText = `
        Based on sunrise light duration and morning sun exposure logged at log time: "${time}" (${duration || 15} minutes duration), calculate circadian schedule parameters:
        - Digital Sunset screen-off limit time (14 hours after morning light).
        - Sleep bedtime schedule.
        - Circadian rhythm explanation in athletic terms.
      `;
      schemaProps = {
        sunlightDoseRating: { type: Type.STRING },
        digitalSunsetTime: { type: Type.STRING },
        bedtimeRecommendation: { type: Type.STRING },
        rationale: { type: Type.STRING },
        coachPersona: { type: Type.STRING }
      };
      requiredFields = ["sunlightDoseRating", "digitalSunsetTime", "bedtimeRecommendation", "rationale", "coachPersona"];
    } else if (featureType === "desk_audit") {
      promptText = `
        Meticulously analyze this photo of a study desk workspace. Detect potential distractions such as smartphones, messy papers, gaming consoles, snacks, or unstructured garbage.
        Calculate a Focus Score from 0 to 100 based on the organization and lack of distractions.
        Provide a list of up to 3 specific detected distractions, and 3 desk-organization space-hacking tips.
        Deliver a coaching feedback review with the intense persona of an anime athletic trainer.
      `;
      schemaProps = {
        focusScore: { type: Type.INTEGER },
        detectedDistractions: { type: Type.ARRAY, items: { type: Type.STRING } },
        decorTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.STRING },
        coachPersona: { type: Type.STRING }
      };
      requiredFields = ["focusScore", "detectedDistractions", "decorTips", "feedback", "coachPersona"];
    } else if (featureType === "procrastination_roast") {
      const selectedPersona = req.body.persona || "drill_sergeant";
      promptText = `
        The user is procrastinating on this task: "${req.body.task || 'their goals'}".
        Deliver a funny, intense, and highly engaging tough-love roast of their laziness, speaking with the chosen persona: "${selectedPersona}".
        - If persona is "drill_sergeant": Be extremely loud, capitalize entire words, use shouting sports military themes.
        - If "sarcastic_robot": Speak in a cold, robotic, sci-fi analytical way making fun of human inefficiency and flesh-sack biological limitations.
        - If "coach_li_ning" or default: Speak as a supportive but stern professional athletic coach who insists on endurance, focus, and doing 5 minutes of work.
        Provide a discipline score from 0 (completely lazy couch lock) to 100 (high focus), and outline 3 tiny action-plan steps (e.g. rotate shoulder, open 1 paragraph, put on sports socks) to defeat inertia.
      `;
      schemaProps = {
        roast: { type: Type.STRING },
        disciplineScore: { type: Type.INTEGER },
        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        coachName: { type: Type.STRING }
      };
      requiredFields = ["roast", "disciplineScore", "actionPlan", "coachName"];
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProps,
          required: requiredFields
        }
      }
    });

    const parsed = JSON.parse((response.text || "{}").trim());
    return res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Coach API Error:", err);
    return res.status(500).json({
      error: err?.message || "Circadian channel failure",
      ...getOfflineFallback(featureType, req.body)
    });
  }
});

// 3. GET API for random quote
app.get("/api/quote", (req, res) => {
  const index = Math.floor(Math.random() * SPORTS_QUOTES.length);
  res.json({ quote: SPORTS_QUOTES[index] });
});

// Setup Vite Dev Server / Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled production client assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReadySETGO Server is actively listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
