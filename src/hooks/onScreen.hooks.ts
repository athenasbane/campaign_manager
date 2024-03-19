import { RefObject, useEffect, useMemo, useState } from "react";

export default function useOnScreen(
  ref: RefObject<HTMLElement>,
  verticalOffset?: number
) {
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => {
          setIntersecting(entry.isIntersecting);
        },
        {
          rootMargin: `-${verticalOffset || undefined}px 0px 0px 0px`,
        }
      ),
    [verticalOffset]
  );

  useEffect(() => {
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  });

  return isIntersecting;
}
