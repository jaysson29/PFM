import { PieChart, Pie, Cell, Legend } from "recharts";

// #region Sample data
const colors = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "url(#pattern-checkers)",
];

// #endregion
const CellPie = ({
  isAnimationActive = true,
  data,
}: {
  isAnimationActive?: boolean;
  data: any[];
}) => (
  <PieChart
    style={{
      width: "100%",
      maxWidth: "500px",
      maxHeight: "70vh",
      aspectRatio: 1,
    }}
    responsive
  >
    <defs>
      <pattern
        id="pattern-checkers"
        x="0"
        y="0"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <rect className="checker" x="0" width="5" height="5" y="0" />
        <rect className="checker" x="10" width="5" height="5" y="10" />
      </pattern>
    </defs>
    <Pie
      data={data}
      label={({ name, value }) => `${name}: £${value.toFixed(2)}`}
      isAnimationActive={isAnimationActive}
      outerRadius={80}
    >
      {data.map((_entry, index) => (
        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
      ))}
    </Pie>

    <Legend />
  </PieChart>
);

export default CellPie;
