// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import { BroadcastChannel } from "worker_threads";
import { TextEncoder, TextDecoder } from "util";
import { TransformStream } from "stream/web";

Object.assign(global, {
  TextDecoder,
  TextEncoder,
  BroadcastChannel,
  TransformStream,
  IntersectionObserver: class IntersectionObserver {
    observe = () => null;
    unobserve = () => null;
    disconnect = () => null;
  },
});
