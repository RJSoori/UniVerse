import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface FocusData {
  date: string;
  minutes: number;
}

interface FocusTrendChartProps {
  data: FocusData[];
}

export default function FocusTrendChart({ data }: FocusTrendChartProps) {
  return (
    <div className="w-full flex justify-center">
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </div>
  );
}
