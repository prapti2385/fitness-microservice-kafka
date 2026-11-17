import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, LinearProgress, Skeleton, Typography } from "@mui/material";
import { getActivityDetail } from "../services/api";
import useActivities from "../hooks/useActivities";
import { activityDate, typeMeta } from "../utils/activity";
import { describeMetrics } from "../utils/metrics";
import { DISPLAY, MONO } from "../theme/themes";
import { Eyebrow, rise } from "./ui";

const MAX_ATTEMPTS = 12;
const RETRY_MS = 5000;

const Section = ({ title, items }) =>
  items?.length ? (
    <Box sx={{ mt: 4 }}>
      <Eyebrow>{title}</Eyebrow>
      <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, mt: 1.5 }}>
        {items.map((t, i) => (
          <Box component="li" key={i} sx={{ display: "grid", gridTemplateColumns: "44px 1fr", py: 1.5, borderTop: 1, borderColor: "divider" }}>
            <Typography sx={{ fontFamily: MONO, color: "primary.main" }}>{String(i + 1).padStart(2, "0")}</Typography>
            <Typography>{t}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  ) : null;

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activities, loading } = useActivities();
  const activity = activities.find((a) => a.id === id);
  const [rec, setRec] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | pending | ready | error

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer;
    const load = async () => {
      try {
        const { data } = await getActivityDetail(id);
        if (cancelled) return;
        setRec(data);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404 && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setStatus("pending");
          timer = setTimeout(load, RETRY_MS);
        } else {
          console.error(err);
          setStatus("error");
        }
      }
    };
    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [id]);

  const m = typeMeta(activity?.activityType ?? rec?.activityType);
  const tiles = activity
    ? [{ label: "Duration", value: `${activity.duration} min` }, { label: "Calories", value: `${activity.caloriesBurned} kcal` }, ...describeMetrics(activity)]
    : [];

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Button onClick={() => navigate("/activities")} sx={{ mb: 3, fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>← All activities</Button>

      {loading && !activity ? <Skeleton variant="rectangular" height={180} /> : activity && (
        <>
          <Box {...rise(0)}>
            <Eyebrow>{activityDate(activity).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</Eyebrow>
            <Typography component="h1" sx={{ fontFamily: DISPLAY, fontSize: { xs: 56, md: 96 }, lineHeight: 0.95, letterSpacing: "-0.03em", mt: 1.5, mb: 4 }}>{m.label}</Typography>
          </Box>
          <Box {...rise(1)} sx={{ display: "flex", flexWrap: "wrap", pr: "1px", pb: "1px" }}>
            {tiles.map((x) => (
              <Box key={x.label} sx={{ flex: "1 1 170px", border: 1, borderColor: "divider", mr: "-1px", mb: "-1px", p: 2.5 }}>
                <Eyebrow>{x.label}</Eyebrow>
                <Typography sx={{ fontFamily: DISPLAY, fontSize: 36, lineHeight: 1.1, mt: 0.5 }}>{x.value}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      <Box {...rise(2)} sx={{ mt: 7 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, borderBottom: 1, borderColor: "divider", pb: 1.5, mb: 3 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontSize: 38, lineHeight: 1 }}>Coach’s notes</Typography>
          <Eyebrow>AI generated</Eyebrow>
        </Box>
        {(status === "loading" || status === "pending") && (
          <Box>
            <LinearProgress sx={{ borderRadius: 0, mb: 1.5 }} />
            <Typography color="text.secondary">
              {status === "loading" ? "Loading…" : "Your coach is going over this session. It usually takes a few seconds."}
            </Typography>
          </Box>
        )}
        {status === "error" && <Alert severity="info">No notes are available for this activity.</Alert>}
        {status === "ready" && rec && (
          <>
            <Typography sx={{ whiteSpace: "pre-line", fontSize: 18, lineHeight: 1.65 }}>{rec.recommendation}</Typography>
            <Section title="Improvements" items={rec.improvements} />
            <Section title="Suggested workouts" items={rec.suggestions} />
            <Section title="Safety" items={rec.safety} />
          </>
        )}
      </Box>
    </Box>
  );
}
