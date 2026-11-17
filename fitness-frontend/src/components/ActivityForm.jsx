import React, { useState } from "react";
import { Alert, Box, Button, InputAdornment, MenuItem, Snackbar, TextField, Typography } from "@mui/material";
import { addActivity } from "../services/api";
import { TYPE_OPTIONS } from "../utils/activity";
import { METRIC_FIELDS, buildMetrics } from "../utils/metrics";
import { DISPLAY } from "../theme/themes";

const empty = { type: "RUNNING", duration: "", caloriesBurned: "" };
const localIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);

export default function ActivityForm({ onAdded }) {
  const [form, setForm] = useState(empty);
  const [metricValues, setMetricValues] = useState({});
  const [metricErrors, setMetricErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const fields = METRIC_FIELDS[form.type] ?? [];
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const changeType = (e) => {
    setForm({ ...form, type: e.target.value });
    setMetricValues({});
    setMetricErrors({});
  };
  const setMetric = (key) => (e) => {
    setMetricValues({ ...metricValues, [key]: e.target.value });
    setMetricErrors({ ...metricErrors, [key]: undefined });
  };
  const valid = Number(form.duration) > 0 && form.caloriesBurned !== "" && Number(form.caloriesBurned) >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    const { metrics, errors } = buildMetrics(form.type, metricValues);
    if (Object.keys(errors).length) {
      setMetricErrors(errors);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addActivity({
        activityType: form.type,
        duration: Number(form.duration),
        caloriesBurned: Number(form.caloriesBurned),
        startTime: localIso(),
        additionalMetrics: metrics,
      });
      setForm(empty);
      setMetricValues({});
      setSaved(true);
      onAdded?.();
    } catch (err) {
      console.error(err);
      setError("Couldn’t save your activity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5, p: 3, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Box>
          <Typography sx={{ fontFamily: DISPLAY, fontSize: 34, lineHeight: 1 }}>Log an activity</Typography>
          <Typography variant="body2" color="text.secondary">Record what you just finished.</Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField select label="Activity type" value={form.type} onChange={changeType}>
          {TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField label="Duration (minutes)" type="number" value={form.duration} onChange={set("duration")}
          slotProps={{ htmlInput: { min: 1 } }} required />
        <TextField label="Calories burned" type="number" value={form.caloriesBurned} onChange={set("caloriesBurned")}
          slotProps={{ htmlInput: { min: 0 } }} required />

        {fields.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Workout details</Typography>
            <Typography variant="caption" color="text.secondary">Optional. The more you add, the better your recommendations.</Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr", mt: 2 }}>
              {fields.map((f) =>
                f.kind === "select" ? (
                  <TextField key={f.key} select label={f.label} value={metricValues[f.key] ?? ""} onChange={setMetric(f.key)}
                    slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}>
                    <MenuItem value="">Not set</MenuItem>
                    {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.key} type="number" label={f.label} value={metricValues[f.key] ?? ""}
                    onChange={setMetric(f.key)} error={Boolean(metricErrors[f.key])}
                    helperText={metricErrors[f.key] ?? f.hint}
                    slotProps={{
                      htmlInput: { min: f.min, max: f.max, step: f.step },
                      input: f.unit ? { endAdornment: <InputAdornment position="end">{f.unit}</InputAdornment> } : undefined,
                    }} />
                ),
              )}
            </Box>
          </Box>
        )}

        <Button type="submit" variant="contained" size="large" disabled={!valid || submitting}>
          {submitting ? "Saving…" : "Add activity"}
        </Button>
      </Box>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>Activity saved</Alert>
      </Snackbar>
    </Box>
  );
}
