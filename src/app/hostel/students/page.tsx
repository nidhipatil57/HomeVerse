"use client";

import { useState } from "react";
import { Users, Search, Bed, BookOpen, AlertCircle, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function WardenStudentsPage() {
  const [search, setSearch] = useState("");
  
  const students = [
    { name: "Aarav Mehta", room: "204", block: "Block B", roll: "NIT-2024-089", course: "Computer Science (3rd Yr)", status: "present", phone: "+91 76543 21098", parentPhone: "+91 99999 88888" },
    { name: "Rohan Das", room: "201", block: "Block A", roll: "NIT-2024-112", course: "Electronics (2nd Yr)", status: "outing", phone: "+91 76543 21022", parentPhone: "+91 99999 88811" },
    { name: "Aditya Roy", room: "105", block: "Block B", roll: "NIT-2025-045", course: "Mechanical (1st Yr)", status: "present", phone: "+91 76543 21054", parentPhone: "+91 99999 88833" },
    { name: "Sumit Mishra", room: "302", block: "Block C", roll: "NIT-2023-018", course: "Electrical (4th Yr)", status: "present", phone: "+91 76543 21066", parentPhone: "+91 99999 88844" },
    { name: "Kunal Verma", room: "204", block: "Block B", roll: "NIT-2024-092", course: "Computer Science (3rd Yr)", status: "disciplinary", phone: "+91 76543 21077", parentPhone: "+91 99999 88855", flag: "Late curfew check-in x2" }
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.room.includes(search) ||
    s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Student Directory</h1>
          <p className="text-muted-foreground mt-1">Review occupied rooms, attendance statuses, parent emergency contacts, and disciplinary remarks.</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
          <Users className="w-3.5 h-3.5" />
          {students.length} Students Total
        </Badge>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, room number, or roll ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 border-0">Filter</Button>
      </div>

      <div className="grid gap-4">
        {filteredStudents.map((student, idx) => (
          <Card key={idx} className="border-border/50 hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                    {student.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground">{student.name}</h4>
                    <Badge variant="outline" className="text-[10px]">{student.roll}</Badge>
                    <Badge className={
                      student.status === "present" ? "bg-green-500/15 text-green-500" :
                      student.status === "outing" ? "bg-amber-500/15 text-amber-500" :
                      "bg-red-500/15 text-red-500"
                    }>
                      {student.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> Room: {student.room} ({student.block})</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {student.course}</span>
                  </p>
                  {student.flag && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Alert: {student.flag}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                <Button size="sm" variant="outline" className="flex-1 rounded-lg h-9 text-xs">
                  View Profile
                </Button>
                <a href={`tel:${student.phone}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full rounded-lg h-9 text-xs flex items-center justify-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500" /> Contact
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
