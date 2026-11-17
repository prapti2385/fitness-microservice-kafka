import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Skeleton, Typography } from "@mui/material";
import StatCard from "../components/StatCard";
import ActivityRow from "../components/ActivityRow";
import { Eyebrow, SectionTitle, rise } from "../components/ui";
import useActivities from "../hooks/useActivities";
import { activityDate, dayKey } from "../utils/activity";
import { DISPLAY, MONO } from "../theme/themes";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function DashboardPage({ name }) {
  const navigate = useNavigate();
  const { activities, loading, error, refresh } = useActivities();

  const s = useMemo(() => {
    const minutes = activities.reduce((t, a) => t + (a.duration ?? 0), 0);
    const calories = activities.reduce((t, a) => t + (a.caloriesBurned ?? 0), 0);
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: "short" }), minutes: 0, today: i === 6 };
    });
    const byKey = Object.fromEntries(week.map((d) => [d.key, d]));
    activities.forEach((a) => {
      const day = byKey[dayKey(activityDate(a))];
      if (day) day.minutes += a.duration ?? 0;
    });
    const active = new Set(activities.map((a) => dayKey(activityDate(a))));
    const cursor = new Date();
    if (!active.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (active.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    return { count: activities.length, minutes, calories, week, streak,
      avg: activities.length ? Math.round(minutes / activities.length) : 0,
      weekMax: Math.max(...week.map((d) => d.minutes), 1) };
  }, [activities]);

  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={refresh}>Retry</Button>}>{error}</Alert>;

  return (
    <Box>
      <Box {...rise(0)} sx={{ mb: { xs: 4, md: 6 } }}>
        <Eyebrow>{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</Eyebrow>
        <Typography component="h1" sx={{ fontFamily: DISPLAY, fontSize: { xs: 56, md: 104 }, lineHeight: 0.92, letterSpacing: "-0.035em", mt: 1.5 }}>
          {greeting()},<br /><em>{name}.</em>
        </Typography>
      </Box>

      {loading ? <Skeleton variant="rectangular" height={170} /> : (
        <Box sx={{ display: "grid", gap: "1px", bgcolor: "divider", border: 1, borderColor: "divider", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
          {[["Activities", s.count, "logged so far"], ["Minutes", s.minutes, `Avg ${s.avg} per session`],
            ["Calories", s.calories, "burned in total"], ["Day streak", s.streak, s.streak ? "Keep it going" : "Log today to start"]]
            .map(([label, value, hint], i) => <StatCard key={label} label={label} value={value} hint={hint} i={i + 1} />)}
        </Box>
      )}

      <Box sx={{ display: "grid", gap: { xs: 5, md: 6 }, gridTemplateColumns: { xs: "1fr", md: "1.25fr 1fr" }, mt: { xs: 5, md: 7 }, alignItems: "start" }}>
        <Box {...rise(5)}>
          <SectionTitle title="Last seven days" note="minutes" />
          <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: { xs: 2, md: 3 }, pt: 4 }}>
            <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }} role="img" aria-label="Minutes of activity for each of the last seven days">
              {s.week.map((d, i) => (
                <Box key={d.key} sx={{ flex: 1, textAlign: "center" }}>
                  <Box sx={{ height: 170, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <Box className="grow" style={{ "--i": i }}
                      sx={{ width: "100%", maxWidth: 48, bgcolor: d.minutes ? "primary.main" : "divider",
                        height: `${d.minutes ? Math.max((d.minutes / s.weekMax) * 100, 6) : 2}%` }} />
                  </Box>
                  <Typography sx={{ fontFamily: MONO, fontSize: 12, mt: 1, fontWeight: d.today ? 700 : 400 }}>{d.minutes || "–"}</Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "text.secondary", textTransform: "uppercase", letterSpacing: ".1em" }}>{d.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box {...rise(6)}>
          <SectionTitle title="Recent" action={<Button size="small" onClick={() => navigate("/activities")} sx={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>View all →</Button>} />
          {loading ? [0, 1, 2].map((k) => <Skeleton key={k} variant="rectangular" height={68} sx={{ mb: 1 }} />) :
            activities.length === 0 ? (
              <Box sx={{ py: 4 }}>
                <Typography sx={{ fontFamily: DISPLAY, fontSize: 30 }}>Nothing logged yet.</Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/activities")}>Log your first activity</Button>
              </Box>
            ) : activities.slice(0, 4).map((a, k) => (
              <ActivityRow key={a.id} activity={a} i={k} onClick={() => navigate(`/activities/${a.id}`)} />
            ))}
        </Box>
      </Box>
    </Box>
  );
}
