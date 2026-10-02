import CityAtlas from "../../Components/Organism/InteractiveMap/CityAtlas";
import { useGetCampaignMapQuery } from "../../Store/slices/campaignApi";
import {
  LoadingState,
  UnavailableState,
} from "../../Components/Campaign/Content";
import "./atlas.css";
export default function Atlas() {
  const { data, isLoading, error, refetch } = useGetCampaignMapQuery();
  if (isLoading) return <LoadingState />;
  if (error) return <UnavailableState retry={refetch} />;
  return data ? <CityAtlas data={data} /> : null;
}
