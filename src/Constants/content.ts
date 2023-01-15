import { EContentType } from "Types/Enum/content.enum";
import { TContent } from "Types/Types/content.type";
import {
  THE_HEALER_SYMBOL_SMALL,
  THE_LEADER_SYMBOL_SMALL,
  THE_SOLIDER_SYMBOL_SMALL,
  THE_WATCHER_SYMBOL_SMALL,
  THE_WORKER_SYMBOL_SMALL,
} from "./images";

export const alignmentContent: TContent[] = [
  {
    contentType: EContentType.Title,
    displayLabel: "Overview",
  },
  {
    contentType: EContentType.TextBlock,
    displayText: `Each citizen of Tordenhelm aligns to a number of these casts for example a common farmer may only align to the Worker but a military medic may align to both The Healer and The Solider. Within the more populated or affluent areas of the Imperium the cast system has great influence. It determines the God you worship (or claim to worship) your career progression, earnings (therefore taxation), your rank within your alignment also will determine your access and acceptance within elements of Torden society. The influence of the system isn’t total however. Towns and cities in the less populated areas of Tordenhelm have a looser use of the cast system.`,
  },
  {
    contentType: EContentType.Image,
    altText: "The Leader Symbol - a hand pointing",
    imageSrc: THE_LEADER_SYMBOL_SMALL,
  },
  {
    contentType: EContentType.TextBlock,
    displayText: `It's important to note that although some may be dual aligned (particularly leaders) your rank is only determined by one of the two casts. Your rank is recorded by the Imperial Rankers (Watcher cast) who’s job it is to archive and judge the advances, falls and realignments of the citizenry. These individuals (or individual dependant on the size of the population) are also the tax collectors of the population usually enforced by lower ranking cast members (Guards).`,
  },
  {
    contentType: EContentType.TextBlock,
    displayText: `There isn't an inherent hierarchy between casts Leaders are those who have skills at leading people but may be in the employ of a master craftsman who has them lead there other workers while they focus on their next master piece. However, it is seen as uncouth for a large group of any cast not to at least have some sort of leader amongst them.`,
  },
  {
    contentType: EContentType.Table,
    tableHeader: [
      "Common Name",
      "Pejorative Name",
      "Symbology",
      "God",
      "Most Senior (Title)",
      "Common Jobs",
    ],
    body: [
      [
        "The Worker",
        "Sickle",
        "A Copper Sickle",
        "Arbeider",
        "Arch-Artisan",
        "Farmer, Craftsman, blacksmith, Clerk,",
      ],
      [
        "The Leader",
        "Two face",
        "A Gold pointing hand",
        "Zuicleth",
        "Empero",
        "Captain, Merchant, Lord, Emperor",
      ],
      [
        "The Solider",
        "Squadie",
        "Silver crossed swords",
        "Krig",
        "Arch-General",
        "Solider, Tactician, War Architect",
      ],
      [
        "The Watcher",
        "Pigs, Spooks, Screws",
        "A Silver Eye",
        "Avanker",
        "Arch-Justice",
        "Guard, Ranker, Spy, Judge",
      ],
      [
        "The Healer",
        "Gods Botherer",
        "A Copper Heart",
        "Hirane",
        "Arch-Bishop",
        "Doctor, Medic, Preacher, Priest, Bishop",
      ],
    ],
  },
  {
    contentType: EContentType.Title,
    displayLabel: "Symbols",
    variant: "h3",
    align: "center",
  },
  {
    contentType: EContentType.Title,
    displayLabel: "The Leader",
  },
  {
    contentType: EContentType.Image,
    imageSrc: THE_LEADER_SYMBOL_SMALL,
    altText: "The Leader Symbol",
  },
  {
    contentType: EContentType.Title,
    displayLabel: "The Worker",
  },
  {
    contentType: EContentType.Image,
    imageSrc: THE_WORKER_SYMBOL_SMALL,
    altText: "The Worker Symbol",
  },
  {
    contentType: EContentType.Title,
    displayLabel: "The Solider",
  },
  {
    contentType: EContentType.Image,
    imageSrc: THE_SOLIDER_SYMBOL_SMALL,
    altText: "The Solider Symbol",
  },
  {
    contentType: EContentType.Title,
    displayLabel: "The Healer",
  },
  {
    contentType: EContentType.Image,
    imageSrc: THE_HEALER_SYMBOL_SMALL,
    altText: "The Healer Symbol",
  },
  {
    contentType: EContentType.Title,
    displayLabel: "The Watcher",
  },
  {
    contentType: EContentType.Image,
    imageSrc: THE_WATCHER_SYMBOL_SMALL,
    altText: "The Watcher Symbol",
  },
];
