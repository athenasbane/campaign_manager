import Stack from "@mui/material/Stack";
import { useNavigate, useParams } from "react-router-dom";
import { useGetContentPageQuery } from "../../Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect } from "react";
import RichContentRenderer from "../../helpers/RichContentRenderer";
import { StyledTypography } from "./ContentStyles";

export function ContentView({ data }: { data: any }) {
  return (
    <Stack direction="column" sx={{ maxWidth: "100vw" }}>
      <StyledTypography variant="h3" sx={{ textAlign: "center" }}>
        {data.pageTitle || " "}
      </StyledTypography>
      <RichContentRenderer content={data.pageContentCollection.items[0].content} />
    </Stack>
  );
}

export default function Content() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetContentPageQuery(slug);
  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/404");
    }
  }, [error, data, navigate, isLoading]);

  return (
    <Stack direction="column" sx={{ maxWidth: "100vw" }}>
      {data && !isLoading ? <ContentView data={data} /> : <Skeleton variant="text" />}
    </Stack>
  );
}
