import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { snapshots } from "./timeseries";
import {
  fromOrdinal,
  formatTordenDate,
  MONTHS,
} from "../../../helpers/TordenhelmCalendar";

const ALL_CODES = [
  "CIR",
  "FRT",
  "PRA",
  "KRA",
  "SHA",
  "FRE",
  "MAM",
  "MON",
  "VIL",
] as const;
type Code = (typeof ALL_CODES)[number];

export const ExchangeChart = () => {
  const [visible, setVisible] = useState<Code[]>(["CIR", "PRA", "MON"]);
  const data = useMemo(() => snapshots, []);

  const toggle = (c: Code) =>
    setVisible((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));

  return (
    <div style={{ width: "100%", height: 420 }}>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
      >
        {ALL_CODES.map((code) => (
          <label key={code} style={{ fontFamily: "sans-serif" }}>
            <input
              type="checkbox"
              checked={visible.includes(code)}
              onChange={() => toggle(code)}
            />
            {code}
          </label>
        ))}
      </div>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ordinal"
            type="number"
            tickFormatter={(ord) => {
              const d = fromOrdinal(ord);
              // e.g. “Frostwane 1”
              return `${MONTHS[d.month - 1].imperial.slice(0, 4)} ${d.day}`;
            }}
            domain={["dataMin", "dataMax"]}
            allowDataOverflow={false}
            minTickGap={24}
          />
          <YAxis tickFormatter={(v) => v.toFixed(2)} />
          <Tooltip
            labelFormatter={(ord) => {
              const d = fromOrdinal(Number(ord));
              return `${formatTordenDate(d)} (${MONTHS[d.month - 1].slang})`;
            }}
            formatter={(v, name) => [Number(v).toFixed(4), name as string]}
          />
          <Legend />
          {/* Baseline GLD */}
          <ReferenceLine y={1} strokeDasharray="4 4" />

          {/* GLD line is optional, usually constant at 1 */}
          {/* <Line type="monotone" dataKey="GLD" name="GLD" dot={false} isAnimationActive={false} /> */}

          {visible.map((code) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              name={code}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
