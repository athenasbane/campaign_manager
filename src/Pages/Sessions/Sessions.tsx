import Typography from "@mui/material/Typography";
import Session from "Components/Molecule/Session/Session";
import { useAppSelector } from "hooks/store.hooks";
import { selectSessions } from "Store/slices/sessions";
import theme from "theme";
import { SessionType } from "Types/Enum/sessions.enum";

export default function Sessions() {
  const sessionsData = useAppSelector((state) =>
    selectSessions(state.sessions)
  );

  const sessions = sessionsData.map((session) => {
    switch (session.type) {
      case SessionType.Session:
        return <Session key={session.shortDescription} session={session} />;
      case SessionType.StoryIncrement:
        return (
          <Typography
            key={session.displayLabel}
            align={session.increment === "act" ? "center" : "left"}
            variant={session.increment === "act" ? "h3" : "h4"}
            color={theme.palette.secondary.light}
            sx={{ mt: 4 }}
          >
            {session.displayLabel}
          </Typography>
        );

      case SessionType.Location:
        return (
          <Typography key={session.displayLabel} sx={{ mt: 2 }} variant="h5">
            {session.displayLabel}
          </Typography>
        );

      default:
        return <Session key={"issue"} session={session} />;
    }
  });

  return (
    <>
      <Typography align="center" variant="h3">
        Session Recap
      </Typography>
      {sessions}
    </>
  );
}
