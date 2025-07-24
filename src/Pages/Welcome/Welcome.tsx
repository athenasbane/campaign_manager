import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useGetFrontPageQuery } from "../../Store/slices/backend";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RichContentRenderer from "../../helpers/RichContentRenderer";
import { Skeleton } from "@mui/material";
import { nextSession } from "./WelcomeUtils";
import { StyledPaper } from "./WelcomeStyles";

export default function Welcome() {
  const { data, error, isLoading } = useGetFrontPageQuery(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (error || (!data && !isLoading)) {
      console.error(error);
      navigate("/404");
    }
  }, [error, navigate, data, isLoading]);

  const nextSessionDate = useMemo(
    () => nextSession(data?.nextSession),
    [data?.nextSession]
  );

  return (
    <Stack direction="column">
      {data && !isLoading ? (
        <>
          <Box>
            <Typography variant="h4" align="center">
              <span>{data.pageTitle}</span>
            </Typography>
            <StyledPaper>
              <Stack direction="column">
                <Box>
                  <Typography variant="h2" textAlign="center">
                    Next Session
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" textAlign="center">
                    {nextSessionDate}
                  </Typography>
                </Box>
              </Stack>
            </StyledPaper>
          </Box>
          <RichContentRenderer content={data.introduction} />
        </>
      ) : (
        <>
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
        </>
      )}
    </Stack>
  );
}
