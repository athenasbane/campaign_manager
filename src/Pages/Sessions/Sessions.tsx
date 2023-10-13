import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "Components/Molecule/Session/Session";
import { useGetSessionsDataQuery } from "Store/slices/backend";
import theme from "theme";
import { ESessionType } from "Types/Enum/sessions.enum";
import { TSession } from "Types/Types/session.type";
import { Grid } from "@mui/material";

export default function Sessions() {
  const { data, error, isLoading } = useGetSessionsDataQuery(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      navigate("/404");
    }
  }, [error, navigate]);

  const sessions =
    !isLoading && data?.length && !error ? (
      data.map((session: TSession, i: number) => {
        switch (session.__typename) {
          case ESessionType.Session:
            return (
              <Session key={session.shortDescription + i} session={session} />
            );
          case ESessionType.StoryIncrement:
            return (
              <Typography
                key={session.displayText + i}
                align={session.increment === "act" ? "center" : "left"}
                variant={session.increment === "act" ? "h3" : "h4"}
                color={theme.palette.secondary.light}
                sx={{ mt: 4 }}
              >
                {session.displayText}
              </Typography>
            );

          case ESessionType.Location:
            return (
              <Typography
                key={session.displayText + i}
                sx={{ mt: 2 }}
                variant="h5"
              >
                {session.displayText}
              </Typography>
            );

          default:
            return <Session key={"issue"} session={session} />;
        }
      })
    ) : (
      <></>
    );

  return (
    <Grid item container direction="column" justifyContent="center">
      <Typography align="center" variant="h3">
        Session Recap
      </Typography>
      {sessions}
    </Grid>
  );
}
