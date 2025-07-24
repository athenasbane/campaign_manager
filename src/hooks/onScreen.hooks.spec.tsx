import { render, act } from "@testing-library/react";
import React from "react";
import useOnScreen from "./onScreen.hooks";

describe("useOnScreen", () => {
  it("returns true when intersection occurs", () => {
    let callback: (entries: IntersectionObserverEntry[]) => void = () => {};
    const observe = jest.fn();
    const disconnect = jest.fn();
    (window as any).IntersectionObserver = jest.fn((cb, options) => {
      callback = cb;
      return { observe, disconnect };
    });

    const TestComponent = () => {
      const ref = React.useRef<HTMLDivElement>(null);
      const visible = useOnScreen(ref, 25);
      return <div ref={ref} data-testid="target" data-visible={visible} />;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(observe).toHaveBeenCalled();

    act(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(getByTestId("target")).toHaveAttribute("data-visible", "true");
  });
});
