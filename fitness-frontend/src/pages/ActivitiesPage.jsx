import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Skeleton, Typography } from "@mui/material";
import ActivityForm from "../components/ActivityForm";
import ActivityRow from "../components/ActivityRow";
import { Eyebrow, SectionTitle, rise } from "../components/ui";
import useActivities from "../hooks/useActivities";
import { DISPLAY } from "../theme/themes";

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const { activities, loading, error, refresh } = useActivities();

  return (
    <Box>
      <Box {...rise(0)} sx={{ mb: { xs: 4, md: 6 } }}>
        <Eyebrow>{activities.length} on record</Eyebrow>
        <Typography component="h1" sx={{ fontFamily: DISPLAY, fontSize: { xs: 56, md: 96 }, lineHeight: 0.95, letterSpacing: "-0.03em", mt: 1.5 }}>Activities</Typography>
      </Box>
      <Box sx={{ display: "grid", gap: { xs: 5, md: 6 }, gridTemplateColumns: { xs: "1fr", md: "380px 1fr" }, alignItems: "start" }}>
        <Box {...rise(1)}><ActivityForm onAdded={refresh} /></Box>
        <Box {...rise(2)}>
          <SectionTitle title="History" />
          {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={refresh}>Retry</Button>}>{error}</Alert>}
          {loading && activities.length === 0 && [0, 1, 2].map((k) => <Skeleton key={k} variant="rectangular" height={68} sx={{ mb: 1 }} />)}
          {!loading && !error && activities.length === 0 && (
            <Box sx={{ py: 6 }}>
              <Typography sx={{ fontFamily: DISPLAY, fontSize: 32 }}>Nothing logged yet.</Typography>
              <Typography color="text.secondary">Your first workout goes here.</Typography>
            </Box>
          )}
          {activities.map((a, k) => (
            <ActivityRow key={a.id} activity={a} i={Math.min(k, 8)} onClick={() => navigate(`/activities/${a.id}`)} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
