import { render } from "@testing-library/react";
import Table from "Components/Molecule/Table/Table";
import { EContentType } from "Types/Enum/content.enum";

const mock = {
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
};

describe("Molecule - Table", () => {
  it("should match snapshot", () => {
    const { container } = render(<Table {...mock} />);
    expect(container).toMatchSnapshot();
  });
});
