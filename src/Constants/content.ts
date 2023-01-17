import { EContentType } from "Types/Enum/content.enum";
import { TContent } from "Types/Types/content.type";
import {
  PACT_MORTALIS,
  THE_HEALER_SYMBOL_SMALL,
  THE_LEADER_SYMBOL_SMALL,
  THE_SOLDIER_SYMBOL_SMALL,
  THE_WATCHER_SYMBOL_SMALL,
  THE_WORKER_SYMBOL_SMALL,
  VILLIOUS_AND_HREGG_CIRCLE_SMALL,
} from "./images";

export const alignmentContent: TContent[] = [
  {
    contentType: EContentType.Title,
    displayLabel: "Overview",
  },
  {
    contentType: EContentType.TextBlock,
    displayText: `Each citizen of Tordenhelm aligns to a number of these casts for example a common farmer may only align to the Worker but a military medic may align to both The Healer and The Soldier. Within the more populated or affluent areas of the Imperium the cast system has great influence. It determines the God you worship (or claim to worship) your career progression, earnings (therefore taxation), your rank within your alignment also will determine your access and acceptance within elements of Torden society. The influence of the system isn’t total however. Towns and cities in the less populated areas of Tordenhelm have a looser use of the cast system.`,
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
        "The Soldier",
        "Squadie",
        "Silver crossed swords",
        "Krig",
        "Arch-General",
        "Soldier, Tactician, War Architect",
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
    displayLabel: "The Soldier",
  },
  {
    contentType: EContentType.Image,
    imageSrc: THE_SOLDIER_SYMBOL_SMALL,
    altText: "The Soldier Symbol",
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

export const deadGodsContent: TContent[] = [
  {
    contentType: EContentType.Title,
    displayLabel: "Dead Gods",
    variant: "h3",
    align: "center",
  },
  {
    contentType: EContentType.TextBlock,
    displayText:
      "The Imperium refers to any God not in the “Imperial Pantheon” as Dead Gods and worship or even of acknowledgement of these gods is considered blasphemy.",
  },
  {
    contentType: EContentType.Title,
    displayLabel: "Villious & Hregg",
  },
  {
    contentType: EContentType.TextBlock,
    displayText:
      "The Arch-Deities of Tertatin (The World) are Villious & Hregg (pronounced Reg). Villious is the a force for balance, maintenance but also adaption to change. They are known to control living animals, plants and trees. Hregg, on the other hand, is the God of change is known to control weather, forrest fires, tides, waves and moons.",
  },
  {
    contentType: EContentType.Image,
    imageSrc: VILLIOUS_AND_HREGG_CIRCLE_SMALL,
    altText: "Villious and Hregg Circle of balance",
  },
  {
    contentType: EContentType.TextBlock,
    displayText:
      "According to their followers this is what forms the basis for balance of the elements enough for mortal life to survive on Tertatin. ",
  },
];

export const pactMortalis: TContent[] = [
  {
    contentType: EContentType.Title,
    displayLabel: "Pact Mortalis",
    variant: "h3",
    align: "center",
  },
  {
    contentType: EContentType.TextBlock,
    displayText:
      "The Pact Mortalis was one of the primary documents created at the time of the forging. Said to have been witnessed and signed by the imperial pantheon themselves. The pact guaranteed that: ",
  },
  {
    contentType: EContentType.Section,
    swapSections: false,
    image: {
      contentType: EContentType.Image,
      altText: "Pact Mortalis",
      imageSrc: PACT_MORTALIS,
    },
    textBlock: {
      contentType: EContentType.TextBlock,
      displayText: `Work would be given and fairly paid inline with skills and aptitude, regardless of background, title, lands or station. Citizen's will display their rank to protect themselves from slavery. The empero's duty is to create and save guard laws that will provide safety, security and liberty of their subject. The herein entitlement would be granted to Elves, Dwarfs, Halflings, Gnomes, Orcs and Humans. An amendment was made after the annexation of Cirrane to add Dragonborne.`,
    },
  },
];
