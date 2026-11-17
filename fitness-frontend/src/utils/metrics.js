// Per-activity-type metrics. Only numbers and fixed choices are allowed (no free text),
// because these values are passed to the AI prompt.
const num = (key, label, unit, min, max, step = 1, hint) => ({ key, label, unit, kind: "number", min, max, step, hint });
const pick = (key, label, options) => ({ key, label, kind: "select", options });

const HR = num("avgHeartRate", "Avg heart rate", "bpm", 30, 230);
const MAX_HR = num("maxHeartRate", "Max heart rate", "bpm", 30, 250);
const DIST = num("distanceKm", "Distance", "km", 0.01, 500, 0.01);
const ELEV = num("elevationGainM", "Elevation gain", "m", 0, 9000);
const EFFORT = num("perceivedExertion", "Effort", "/10", 1, 10, 1, "1 easy · 10 max");

export const METRIC_FIELDS = {
  RUNNING: [DIST, HR, MAX_HR, ELEV, EFFORT],
  WALKING: [DIST, num("steps", "Steps", "", 1, 200000), HR, EFFORT],
  CYCLING: [DIST, ELEV, HR, pick("terrain", "Terrain", ["Road", "Trail", "Indoor"]), EFFORT],
  SWIMMING: [
    num("distanceM", "Distance", "m", 1, 20000), num("laps", "Laps", "", 1, 1000),
    pick("stroke", "Stroke", ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Mixed"]), HR, EFFORT,
  ],
  WEIGHT_TRAINING: [
    num("totalSets", "Total sets", "", 1, 200), num("totalReps", "Total reps", "", 1, 5000),
    num("maxWeightKg", "Heaviest lift", "kg", 1, 1000, 0.5),
    pick("focus", "Focus", ["Upper body", "Lower body", "Full body", "Core"]), EFFORT,
  ],
  YOGA: [
    pick("style", "Style", ["Hatha", "Vinyasa", "Ashtanga", "Yin", "Power", "Other"]),
    pick("intensity", "Intensity", ["Gentle", "Moderate", "Intense"]),
  ],
  HIIT: [
    num("rounds", "Rounds", "", 1, 100), num("workIntervalSec", "Work interval", "sec", 5, 600),
    num("restIntervalSec", "Rest interval", "sec", 0, 600), HR, MAX_HR, EFFORT,
  ],
  CARDIO: [
    pick("equipment", "Equipment", ["Treadmill", "Elliptical", "Rowing machine", "Stair climber", "Other"]),
    HR, MAX_HR, EFFORT,
  ],
  STRETCHING: [pick("focus", "Focus", ["Full body", "Upper body", "Lower body", "Back & neck"])],
  OTHER: [HR, EFFORT],
};

// Validates the entered values and returns only the filled-in ones, as numbers where needed.
export function buildMetrics(type, values) {
  const metrics = {};
  const errors = {};
  for (const f of METRIC_FIELDS[type] ?? []) {
    const raw = values[f.key];
    if (raw === undefined || raw === "") continue;
    if (f.kind === "select") {
      metrics[f.key] = raw;
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < f.min || n > f.max) errors[f.key] = `Enter ${f.min}–${f.max}`;
    else metrics[f.key] = n;
  }
  return { metrics, errors };
}

const clock = (minutesPerUnit) => {
  let m = Math.floor(minutesPerUnit);
  let s = Math.round((minutesPerUnit - m) * 60);
  if (s === 60) { m += 1; s = 0; }
  return `${m}:${String(s).padStart(2, "0")}`;
};

// Readable label/value pairs for an activity, including values worked out from distance and time.
export function describeMetrics(activity) {
  const m = activity.additionalMetrics ?? {};
  const items = (METRIC_FIELDS[activity.activityType] ?? [])
    .filter((f) => m[f.key] !== undefined && m[f.key] !== null && m[f.key] !== "")
    .map((f) => ({ label: f.label, value: f.unit ? `${m[f.key]}${f.unit === "/10" ? "" : " "}${f.unit}` : String(m[f.key]) }));

  const km = Number(m.distanceKm);
  const min = Number(activity.duration);
  if (km > 0 && min > 0) {
    if (activity.activityType === "RUNNING" || activity.activityType === "WALKING") {
      items.unshift({ label: "Avg pace", value: `${clock(min / km)} /km` });
    } else if (activity.activityType === "CYCLING") {
      items.unshift({ label: "Avg speed", value: `${(km / (min / 60)).toFixed(1)} km/h` });
    }
  }
  return items;
}
