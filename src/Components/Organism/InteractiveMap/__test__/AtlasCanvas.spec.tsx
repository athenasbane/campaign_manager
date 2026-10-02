import { createRef, StrictMode } from "react";
import { render } from "@testing-library/react";
import { AtlasCanvas, type AtlasController } from "../AtlasCanvas";
import type { InteractiveMapData } from "../../../../Types/Interfaces/interactiveMap.interface";
const data: InteractiveMapData = {
  mapId: "luxtria",
  imageSrc: "city.png",
  imageWidth: 1000,
  imageHeight: 1000,
  minZoom: -3,
  maxZoom: 2,
  defaultZoom: -2,
  defaultCenter: [500, 500],
  features: [],
  fogFeatures: [],
};
test("restores changed shared views on the mounted Leaflet map, including Back navigation", () => {
  const prior = global.ResizeObserver;
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
  try {
    const controller = createRef<AtlasController>();
    const props = {
      data,
      layers: [],
      labels: false,
      mode: "explore" as const,
      geometryMode: "point" as const,
      points: [],
      onSelect: jest.fn(),
      onPoint: jest.fn(),
      onZoom: jest.fn(),
    };
    const { rerender, unmount } = render(
      <StrictMode>
        <AtlasCanvas ref={controller} {...props} initialView="-1,500,500" />
      </StrictMode>,
    );
    expect(controller.current?.view()).toBe("-1,500,500");
    rerender(
      <StrictMode>
        <AtlasCanvas ref={controller} {...props} initialView="2,900,800" />
      </StrictMode>,
    );
    expect(controller.current?.view()).toBe("2,900,800");
    rerender(
      <StrictMode>
        <AtlasCanvas ref={controller} {...props} initialView="-1,500,500" />
      </StrictMode>,
    );
    expect(controller.current?.view()).toBe("-1,500,500");
    rerender(
      <StrictMode>
        <AtlasCanvas ref={controller} {...props} initialView="9,-1,Infinity" />
      </StrictMode>,
    );
    expect(controller.current?.view()).toBe("-1,500,500");
    unmount();
  } finally {
    global.ResizeObserver = prior;
  }
});
