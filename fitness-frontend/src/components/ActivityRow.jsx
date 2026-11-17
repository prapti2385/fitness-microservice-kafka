import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { activityDate, fmtDate, typeMeta } from "../utils/activity";
import { describeMetrics } from "../utils/metrics";
import { DISPLAY, MONO } from "../theme/themes";
import { rise } from "./ui";

export default function ActivityRow({ activity, onClick, i = 0 }) {
  const m = typeMeta(activity.activityType);
  const extra = describeMetrics(activity).slice(0, 2).map((x) => `${x.label} ${x.value}`);
  return (
    <ButtonBase onClick={onClick} {...rise(i)}
      sx={{ width: "100%", display: "grid", gridTemplateColumns: "10px 1fr auto", gap: 2, alignItems: "center", textAlign: "left",
        py: 2, px: 1, borderBottom: 1, borderColor: "divider", transition: "padding .25s ease, background-color .25s",
        "&:hover": { pl: 2.5, bgcolor: "action.hover" } }}>
      <Box sx={{ width: 10, height: 10, bgcolor: m.color }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: DISPLAY, fontSize: 26, lineHeight: 1.1 }}>{m.label}</Typography>
        <Typography noWrap sx={{ fontFamily: MONO, fontSize: 12, color: "text.secondary" }}>
          {[fmtDate(activityDate(activity)), ...extra].join("  ·  ")}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Typography sx={{ fontFamily: MONO }}>{activity.duration} min</Typography>
        <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "text.secondary" }}>{activity.caloriesBurned} kcal</Typography>
      </Box>
    </ButtonBase>
  );
}
