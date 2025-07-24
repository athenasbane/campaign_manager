import reducer, { openSingleModal, closeAll, selectModalStatus, EnumModalSlice } from "./modals";

describe("modals slice", () => {
  it("opens a single modal", () => {
    const state = reducer(undefined, openSingleModal(EnumModalSlice.Menu));
    expect(state[EnumModalSlice.Menu]).toBe(true);
  });

  it("closes all modals", () => {
    const current = { [EnumModalSlice.Menu]: true } as any;
    const state = reducer(current, closeAll());
    expect(state[EnumModalSlice.Menu]).toBe(false);
  });

  it("selectModalStatus returns modal state", () => {
    const slice = { [EnumModalSlice.Menu]: true } as any;
    expect(selectModalStatus(slice, EnumModalSlice.Menu)).toBe(true);
  });
});
