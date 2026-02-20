import { useMemo } from "react";
import { toDateKey } from "./utils";

type HeatmapCalendarProps = {
	completedDates: string[];
	color?: string;
	months?: number;
};

export function HeatmapCalendar({
	completedDates,
	color = "#3b82f6",
	months = 2,
}: HeatmapCalendarProps) {
	const totalDays = Math.max(1, months * 30);

	const dates = useMemo(() => {
		const list: Date[] = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = totalDays - 1; i >= 0; i -= 1) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			list.push(d);
		}

		return list;
	}, [totalDays]);

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-14 gap-1">
				{dates.map((date) => {
					const dateStr = toDateKey(date);
					const isDone = completedDates.includes(dateStr);

					return (
						<div
							key={dateStr}
							title={date.toLocaleDateString("en-US")}
							className="h-4 w-4 rounded-sm border"
							style={{
								backgroundColor: isDone ? color : "transparent",
								borderColor: isDone ? color : "hsl(var(--border))",
							}}
						/>
					);
				})}
			</div>
			<p className="text-[11px] text-muted-foreground">
				{months} month activity snapshot
			</p>
		</div>
	);
}
