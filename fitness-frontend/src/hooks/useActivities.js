import { useCallback, useEffect, useState } from "react";
import { getActivities } from "../services/api";
import { activityDate } from "../utils/activity";

export default function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getActivities();
      setActivities([...data].sort((a, b) => activityDate(b) - activityDate(a)));
    } catch (e) {
      console.error(e);
      setError("We couldn’t load your activities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activities, loading, error, refresh };
}
