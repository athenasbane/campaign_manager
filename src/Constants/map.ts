import { IMap } from "Types/Interfaces";
import {
  CIRANE_COAST_MAP,
  HIRANE_MOUNT_MAP,
  KLILCAITHNESS_MAP,
  MERE_LANDS,
  NIRWOD_MAP,
  THE_SHAMBLES_MAP,
  TORDENHELM_MAP,
} from "./map_images";

export const maps: IMap[] = [
  {
    displayText: "Klilcaithness",
    imageSrc: KLILCAITHNESS_MAP,
    imageRoute: "klilcaithness",
  },
  {
    displayText: "Tordenhelm",
    imageRoute: "tordenhelm",
    imageSrc: TORDENHELM_MAP,
  },
  {
    displayText: "The Shambles",
    imageRoute: "shambles",
    imageSrc: THE_SHAMBLES_MAP,
  },
  {
    displayText: "Cirrane Coast",
    imageRoute: "cirrain_coast",
    imageSrc: CIRANE_COAST_MAP,
  },
  {
    displayText: "Mere Lands",
    imageRoute: "mere_lands",
    imageSrc: MERE_LANDS,
  },
  {
    displayText: "Hirane Mount Coast",
    imageRoute: "hirane_mount_coast",
    imageSrc: HIRANE_MOUNT_MAP,
  },
  {
    displayText: "Nirwod",
    imageSrc: NIRWOD_MAP,
    imageRoute: "nirwod",
  },
];
