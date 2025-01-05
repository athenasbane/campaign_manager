import { render, screen } from "@testing-library/react";
import Section, {
  ISectionProps,
} from "../../../Components/Molecule/Section/Section";
import { THE_LEADER_SYMBOL_SMALL } from "../../../Constants/images";
import { EContentType } from "../../../Types/Enum/content.enum";

const mockDataNoSwap: ISectionProps = {
  contentType: EContentType.Section,
  swapSections: false,
  image: {
    contentType: EContentType.Image,
    altText: "The Leader Symbol - a hand pointing",
    imageSrc: THE_LEADER_SYMBOL_SMALL,
  },
  textBlock: {
    contentType: EContentType.TextBlock,
    displayText: `Each citizen of Tordenhelm aligns to a number of these casts for example a common farmer may only align to the Worker but a military medic may align to both The Healer and The Soldier. Within the more populated or affluent areas of the Imperium the cast system has great influence. It determines the God you worship (or claim to worship) your career progression, earnings (therefore taxation), your rank within your alignment also will determine your access and acceptance within elements of Torden society. The influence of the system isn’t total however. Towns and cities in the less populated areas of Tordenhelm have a looser use of the cast system.`,
  },
};

const mockDataSwap: ISectionProps = {
  contentType: EContentType.Section,
  swapSections: true,
  image: {
    contentType: EContentType.Image,
    altText: "The Leader Symbol - a hand pointing",
    imageSrc: THE_LEADER_SYMBOL_SMALL,
  },
  textBlock: {
    contentType: EContentType.TextBlock,
    displayText: `Each citizen of Tordenhelm aligns to a number of these casts for example a common farmer may only align to the Worker but a military medic may align to both The Healer and The Soldier. Within the more populated or affluent areas of the Imperium the cast system has great influence. It determines the God you worship (or claim to worship) your career progression, earnings (therefore taxation), your rank within your alignment also will determine your access and acceptance within elements of Torden society. The influence of the system isn’t total however. Towns and cities in the less populated areas of Tordenhelm have a looser use of the cast system.`,
  },
};

describe("Molecule - Section", () => {
  it("should match snapshot", () => {
    const { container } = render(<Section {...mockDataNoSwap} />);

    expect(container).toMatchSnapshot();
  });

  it.each`
    mock              | firstTag | secondTag
    ${mockDataNoSwap} | ${"IMG"} | ${"P"}
    ${mockDataSwap}   | ${"P"}   | ${"IMG"}
  `(
    'should have image on the right if "SwapSections is false"',
    async ({ mock, firstTag, secondTag }) => {
      render(<Section {...mock} />);

      const [firstSwap, secondSwap] =
        await screen.findAllByTestId("section_element");
      expect(firstSwap.tagName).toBe(firstTag);
      expect(secondSwap.tagName).toBe(secondTag);
    }
  );
});
