"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, BookOpen, Clock, Heart, CheckCircle2, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store/useAuth";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const libraryCatalog = [
  { id: "b1", title: "Atomic Habits", author: "James Clear", category: "Self Help", available: true, copies: 2, location: "Shelf A-4" },
  { id: "b2", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", available: true, copies: 1, location: "Shelf B-2" },
  { id: "b3", title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: false, copies: 0, location: "Shelf C-1", returnDate: "Jul 12, 2026" },
  { id: "b4", title: "Deep Work", author: "Cal Newport", category: "Business & Focus", available: true, copies: 3, location: "Shelf A-1" },
  { id: "b5", title: "The Silent Patient", author: "Alex Michaelides", category: "Thriller", available: true, copies: 1, location: "Shelf B-5" },
];

export default function BookBorrowingPage() {
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted) return null;

  const filteredBooks = libraryCatalog.filter((b) => {
    return b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
  });

  const handleBorrowRequest = (book: any) => {
    const isAlreadyBorrowed = borrowedBooks.some(b => b.id === book.id);
    if (isAlreadyBorrowed) {
      alert("You have already requested this book!");
      return;
    }

    const newBorrow = {
      ...book,
      borrowDate: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toLocaleDateString(), // 14 days
      status: "Approved - Ready for Gate Pickup"
    };

    setBorrowedBooks([newBorrow, ...borrowedBooks]);
    alert(`Borrow request submitted successfully for "${book.title}". Collect it from the Society Clubhouse Library (Shelf: ${book.location})!`);
  };

  const handleReturnBook = (id: string) => {
    setBorrowedBooks(borrowedBooks.filter(b => b.id !== id));
    alert("Return request submitted! Please drop the book in the Clubhouse Return box.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Book Borrowing 📚
        </h1>
        <p className="text-muted-foreground mt-1">
          Search the society community library, request books, and manage your borrowed book logs
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Library Catalog */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-11 text-xs"
            />
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <motion.div key={book.id} variants={fadeInUp}>
                <Card className="border-border/50 hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-1">
                      <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary text-[9px] font-semibold">
                        {book.category}
                      </Badge>
                      <h3 className="font-bold text-sm text-foreground pt-1.5 leading-snug line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground">by {book.author}</p>
                    </div>

                    <div className="space-y-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Copies Available:</span>
                        <span className="font-semibold text-foreground">{book.copies}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Library Location:</span>
                        <span className="font-semibold text-primary">{book.location}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      {book.available ? (
                        <Button
                          onClick={() => handleBorrowRequest(book)}
                          className="w-full rounded-xl h-8.5 text-xs font-semibold gradient-primary text-white border-0 shadow-sm"
                        >
                          Request Borrow
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="secondary"
                          className="w-full rounded-xl h-8.5 text-xs font-semibold"
                        >
                          Out of Stock (Due: {book.returnDate})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: Borrowed Items */}
        <Card className="lg:col-span-4 border-border/50 h-fit">
          <CardContent className="p-5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b pb-3 mb-4">
              <Bookmark className="w-4 h-4 text-primary" /> My Borrowed Books ({borrowedBooks.length})
            </h3>

            <div className="space-y-3">
              {borrowedBooks.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-tight line-clamp-1">{b.title}</h4>
                      <p className="text-[10px] text-muted-foreground">by {b.author}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] py-0.5">
                      Borrowed
                    </Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground flex flex-col space-y-0.5">
                    <span>Borrowed On: <strong>{b.borrowDate}</strong></span>
                    <span>Due Date: <strong className="text-red-500">{b.dueDate}</strong></span>
                    <span className="text-primary mt-1">Status: {b.status}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReturnBook(b.id)}
                    className="w-full rounded-lg h-7.5 text-[9px] mt-1 text-red-500 border-red-500/20 hover:bg-red-500/10"
                  >
                    Initiate Return
                  </Button>
                </div>
              ))}
              {borrowedBooks.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-8 h-8 text-muted-foreground/35" />
                  No books currently borrowed.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
