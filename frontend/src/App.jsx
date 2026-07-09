import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Subject from "./pages/Subject";
import NotFound from "./pages/NotFound";

function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
        <p className="font-mono text-xs text-ink-faint">
          GTU PYQ Analyzer — built for students, by students.
        </p>
        <p className="text-xs text-ink-faint">
          Not affiliated with Gujarat Technological University.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-void">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subject/:subjectCode" element={<Subject />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}