"use client";

import { useState } from "react";
import { Bed, Plus, Key, ArrowRightLeft, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WardenRoomsPage() {
  const [allocation, setAllocation] = useState([
    { room: "101", block: "Block A", type: "Double Occupancy", occupancy: 2, capacity: 2, students: ["Amit Verma", "Rahul Sharma"] },
    { room: "102", block: "Block A", type: "Double Occupancy", occupancy: 1, capacity: 2, students: ["Varun Sharma"] },
    { room: "204", block: "Block B", type: "Triple Occupancy", occupancy: 2, capacity: 3, students: ["Aarav Mehta", "Kunal Verma"] },
    { room: "302", block: "Block C", type: "Single Occupancy", occupancy: 1, capacity: 1, students: ["Sumit Mishra"] },
    { room: "305", block: "Block C", type: "Double Occupancy", occupancy: 0, capacity: 2, students: [] }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Room Allocation Command</h1>
          <p className="text-muted-foreground mt-1">Assign bed spaces, track room vacancies, and manage student transfer requests.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 border-0">
          <Plus className="w-4 h-4 mr-2" /> Allocate Room
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Rooms Layout Registry</h3>
          {allocation.map((r, idx) => (
            <Card key={idx} className="border-border/50">
              <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">Room {r.room}</span>
                      <Badge variant="outline" className="text-[10px]">{r.block}</Badge>
                      <Badge className={r.occupancy === r.capacity ? "bg-red-500/15 text-red-500" : r.occupancy === 0 ? "bg-green-500/15 text-green-500" : "bg-blue-500/15 text-blue-500"}>
                        {r.occupancy === r.capacity ? "Full" : r.occupancy === 0 ? "Vacant" : `${r.capacity - r.occupancy} Space Left`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.type} • Capacity: {r.capacity} Beds</p>
                    {r.students.length > 0 && (
                      <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-1.5">
                        <Users className="w-3.5 h-3.5" /> Occupants: {r.students.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 self-end md:self-center">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg h-9 text-xs flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" /> Transfer
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg h-9 text-xs">
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Vacancy Analytics</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Overall hostel bed vacancy index. Student allocation changes can be performed immediately with automated notification sent to registrar and mess manager.
          </p>
          <div className="border border-border/50 rounded-xl p-4 bg-secondary/20 text-xs font-mono space-y-2">
            <div className="flex justify-between"><span>Occupied Beds:</span><span>165</span></div>
            <div className="flex justify-between"><span>Vacant Beds:</span><span>15</span></div>
            <div className="flex justify-between"><span>Total Bed Capacity:</span><span>180</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
