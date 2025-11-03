import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function SummaryPanel({ summary, onClear }) {
	return (
		<div>
			<Card className="rounded-xl shadow-sm">
				<CardHeader>
					<CardTitle>Pitch Deck Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Click “Summarize pitch deck” on a post to see a brief summary here.
					</p>
					<Textarea value={summary || ""} readOnly placeholder="Summary will appear here..." className="min-h-[160px]" />
					<div className="flex gap-2">
						<Button variant="outline" className="flex-1" onClick={onClear}>Clear</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}


