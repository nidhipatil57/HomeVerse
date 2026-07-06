"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocietyCommunityRedirect() {
  const router = useRouter();

  useEffect(() => {
<<<<<<< HEAD
    router.replace("/society/facility-booking");
  }, [router]);
=======
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWorker = user?.role === "worker";

  const facilitiesList = ["Gymnasium", "Badminton Court", "Swimming Pool", "Clubhouse Lounge", "Party Hall"];
  const slotsList = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM"
  ];

  const handleBookFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacilityError("");
    setFacilitySuccess(false);

    if (!bookingDate) {
      setFacilityError("Please choose a reservation date.");
      return;
    }

    const success = await bookFacility({
      facility: selectedFacility,
      userId: user?.id || "user-resident-1",
      userName: user?.name || "Nidhi Kumar",
      unit: user?.unit || "A-301",
      date: bookingDate,
      slot: bookingSlot
    });

    if (success) {
      setFacilitySuccess(true);
      setTimeout(() => {
        setFacilitySuccess(false);
      }, 2000);
    } else {
      setFacilityError("This timeslot is already reserved. Double booking blocked.");
    }
  };

  const handleReportLf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle.trim() || !lfDesc.trim()) return;

    reportLostFoundItem({
      title: lfTitle,
      description: lfDesc,
      reporterId: user?.id || "user-resident-1",
      reporterName: user?.name || "Nidhi Kumar",
      portal: "society"
    });

    setLfTitle("");
    setLfDesc("");
    setShowLfForm(false);
  };

  // Filter lists
  const myBookings = facilityBookings.filter(b => b.userId === user?.id);
  const activeEvents = communityEvents;
  const activeLfItems = lostFoundItems.filter(item => item.portal === "society");
>>>>>>> 0fd2d3268fdddb9105791a430a8c36076b489b75

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  );
}
