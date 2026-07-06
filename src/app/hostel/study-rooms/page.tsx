"use client";

import { useState, useEffect } from "react";
import { BookOpen, CalendarPlus, Clock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudyRoomsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("Study Room A (Silence Zone)");
  const [selectedSlot, setSelectedSlot] = useState("09:00 AM - 11:00 AM");
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const newB = {
      id: Math.random().toString(),
      room: selectedRoom,
      slot: selectedSlot,
      date: new Date().toLocaleDateString()
    };
    setBookings([newB, ...bookings]);
    alert(`Study room reserved successfully!`);
  };

  const slots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Study Rooms 📖
        </h1>
        <p className="text-muted-foreground mt-1">
          Reserve quite zones or collaborative discussion chambers in the hostel library wing
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Reserve Study Chamber</CardTitle>
            <CardDescription>Select room and slot to lock reservation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Chamber Type</label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                  <option>Study Room A (Silence Zone)</option>
                  <option>Study Room B (Group Discussion)</option>
                  <option>Chamber C (Projector / Presentation)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Timeslot Block</label>
                <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                  {slots.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs shadow-sm">
                <CalendarPlus className="w-4 h-4 mr-2" /> Book Chamber Block
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right List */}
        <Card className="lg:col-span-7 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Active Chamber Reservations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-bold">{b.room}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{b.date} • {b.slot}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold">
                    Approved
                  </Badge>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-xs">
                  No active study room reservations.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
