import { render } from "@testing-library/react";
import Session, { ISessionProps } from "Components/Molecule/Session/Session";
import { ESessionType } from "Types/Enum/sessions.enum";

const genericProps: ISessionProps = {
  session: {
    type: ESessionType.Session,
    sessionNo: 1,
    location: "test, The Test",
    inGameEndTime: "21:00",
    shortDescription: "This is a test",
    longDescription: "This is a longer test",
  },
};

describe("Molecule - Session", () => {
  it("should match snapshot", () => {
    const { container } = render(<Session {...genericProps} />);

    expect(container).toMatchSnapshot();
  });
});
