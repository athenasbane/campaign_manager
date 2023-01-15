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
    displayLabel: "Klilcaithness",
    imageSrc: KLILCAITHNESS_MAP,
    imageRoute: "klilcaithness",
  },
  {
    displayLabel: "Tordenhelm",
    imageRoute: "tordenhelm",
    imageSrc: TORDENHELM_MAP,
  },
  {
    displayLabel: "The Shambles",
    imageRoute: "shambles",
    imageSrc: THE_SHAMBLES_MAP,
  },
  {
    displayLabel: "Cirrane Coast",
    imageRoute: "cirrain_coast",
    imageSrc: CIRANE_COAST_MAP,
  },
  {
    displayLabel: "Mere Lands",
    imageRoute: "mere_lands",
    imageSrc: MERE_LANDS,
  },
  {
    displayLabel: "Hirane Mount Coast",
    imageRoute: "hirane_mount_coast",
    imageSrc: HIRANE_MOUNT_MAP,
  },
  {
    displayLabel: "Nirwod",
    imageSrc: NIRWOD_MAP,
    imageRoute: "nirwod",
  },
];
