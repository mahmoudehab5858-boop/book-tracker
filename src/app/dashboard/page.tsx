"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Book = {
  id: string;
  title: string;
  author: string;
  status: "reading" | "completed" | "wishlist";
  created_at: string;
};

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<Book["status"]>("reading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | Book["status"]>("All");
  const [shake, setShake] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const router = useRouter();

  // Get session and token
  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("You must log in to view your books.");
      router.push("/login");
    }
    return token;
  };

  // Fetch books from API
  const fetchBooks = async (filter?: Book["status"]) => {
    setError("");
    const token = await getToken();
    if (!token) return;

    const url = filter ? `/api/books?status=${filter}` : "/api/books";
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      setError("Failed to fetch books.");
      return;
    }

    const data: Book[] = await res.json();
    setBooks(data ?? []);
  };

  // Add a book
  const handleAdd = async () => {
    setError("");
    if (!title.trim() || !author.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const token = await getToken();
    if (!token) return;

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, author, status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to add book." }));
      setError(err.error || "Failed to add book.");
      return;
    }

    setTitle("");
    setAuthor("");
    setStatus("reading");
    fetchBooks(activeFilter === "All" ? undefined : activeFilter);
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Initial fetch
  useEffect(() => {
    fetchBooks().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading)
    return <div className="text-center mt-32 text-lg text-gray-500">Loading books...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/30 backdrop-blur-sm p-4 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600">
          📚 My Books
        </h1>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-pink-500 text-white font-semibold rounded-xl shadow-md hover:bg-pink-600 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto text-center mb-4 text-red-600 font-semibold">{error}</div>
      )}

      {/* Add Book Form */}
      <motion.div
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book Title"
          className="px-4 py-2 border border-purple-400 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-purple-500"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="px-4 py-2 border border-purple-400 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-purple-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Book["status"])}
          className="px-4 py-2 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black"
        >
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="wishlist">Wishlist</option>
        </select>
        <button
          onClick={handleAdd}
          className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow"
        >
          Add Book
        </button>
      </motion.div>

      {/* Filter Buttons */}
      <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center mb-6">
        {["All", "reading", "completed", "wishlist"].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              const f = filter === "All" ? undefined : (filter as Book["status"]);
              setActiveFilter(filter as "All" | Book["status"]);
              fetchBooks(f);
            }}
            className={`px-4 py-2 font-medium rounded-xl transition shadow
              ${activeFilter === filter
                ? "bg-purple-600 text-white"
                : "bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500"
              }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Books List */}
      <div className="max-w-4xl mx-auto grid gap-4">
        {books.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No books found. Add some to get started!</div>
        ) : (
          <AnimatePresence>
            {books.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-indigo-800 text-lg">{b.title}</div>
                  <div className="text-gray-600">
                    {b.author} • <span className="capitalize">{b.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => setBookToDelete(b)}
                  className="px-4 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

{/* Delete Confirmation Modal */}
<AnimatePresence>
  {bookToDelete && (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <div className="text-lg font-semibold mb-4 text-black">
          Are you sure you want to delete book?
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setBookToDelete(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setError("");
              const token = await getToken();
              if (!token) return;
              const res = await fetch(`/api/books/${bookToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) {
                setError("Failed to delete book.");
              }
              setBookToDelete(null);
              fetchBooks(activeFilter === "All" ? undefined : activeFilter);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* Delete Confirmation Modal */}
<AnimatePresence>
  {bookToDelete && (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <div className="text-lg font-semibold mb-4 text-black">
          Are you sure you want to delete book?
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setBookToDelete(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setError("");
              const token = await getToken();
              if (!token) return;
              const res = await fetch(`/api/books/${bookToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) {
                setError("Failed to delete book.");
              }
              setBookToDelete(null);
              fetchBooks(activeFilter === "All" ? undefined : activeFilter);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
