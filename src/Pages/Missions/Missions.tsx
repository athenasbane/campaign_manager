import { Stack, Box, Skeleton, Typography } from "@mui/material";
import { useGetMissionsPageQuery } from "../../Store/slices/backend";
import { useState } from "react";
import MissionDetails from "../../Components/Molecule/MissionDetails/MissionDetails";
import {
  EmptyState,
  UnavailableState,
} from "../../Components/Campaign/Content";

export default function Missions() {
  const [selectedId, setSelectedId] = useState("");
  const { data, error, isLoading, refetch } =
    useGetMissionsPageQuery(undefined);
  if (isLoading) return <Skeleton height={100} />;
  if (error) return <UnavailableState retry={refetch} />;
  const missions = data?.missionsCollection.items || [];
  if (!missions.length)
    return (
      <EmptyState title="No archived missions.">
        <p>There are no missions in this archive yet.</p>
      </EmptyState>
    );
  const selected =
    missions.find((mission) => mission.sys.id === selectedId) ||
    missions.find((mission) => !mission.complete) ||
    missions[0];
  return (
    <Stack sx={{ gap: 6 }}>
      <Typography variant="h2">{data?.title || "Archived missions"}</Typography>
      <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 6 }}>
        <Box
          component="nav"
          aria-label="Archived missions"
          sx={{ width: { xs: "100%", md: "33%" }, flexShrink: 0 }}
        >
          {[false, true].map((complete) => (
            <section key={String(complete)} className="archive-mission-group">
              <h3>{complete ? "Complete" : "Active"}</h3>
              {missions
                .filter((mission) => mission.complete === complete)
                .map((mission) => (
                  <button
                    type="button"
                    key={mission.sys.id}
                    aria-current={
                      selected.sys.id === mission.sys.id ? "true" : undefined
                    }
                    onClick={() => setSelectedId(mission.sys.id)}
                  >
                    {mission.missionName}
                  </button>
                ))}
            </section>
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MissionDetails {...selected} />
        </Box>
      </Stack>
    </Stack>
  );
}
