export const nextSession = (nextSession?: string) => {
  if (nextSession)
    return new Date(nextSession).toLocaleDateString("en-gb", {
      dateStyle: "full",
    });
  const d = new Date();
  d.setDate(d.getDate() + ((3 + 7 - d.getDay()) % 7));
  return d.toLocaleDateString("en-gb", { dateStyle: "full" });
};
