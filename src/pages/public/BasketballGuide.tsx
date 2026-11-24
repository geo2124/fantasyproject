import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Printer, ArrowLeft, FileText, ShieldCheck, Globe } from 'lucide-react';
import { downloadBasketballGuidePdf } from '../../lib/downloadGuide';

export default function BasketballGuide() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadBasketballGuidePdf();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border print:hidden">
          <div className="flex items-center gap-3">
            <Link
              to="/basketball"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest border border-border px-3 py-2 bg-surface hover:border-amber-500 hover:text-amber-500 transition-colors"
            >
              <ArrowLeft size={14} /> Back to LBFL
            </Link>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500">
              // OFFICIAL DOCUMENTATION
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors disabled:opacity-60"
            >
              <Download size={14} />
              {downloading ? 'Preparing PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 border border-border bg-surface px-4 py-2 text-xs font-mono font-semibold uppercase tracking-widest hover:border-text-primary transition-colors"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="py-8 border-b border-border">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-500 mb-2">
            LBFL // LEBANESE BASKETBALL FANTASY LEAGUE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-3">
            Basketball Fantasy Platform Guide
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-3xl leading-relaxed">
            A direct, page-by-page reference covering the core game concept, Classic Fantasy rules,
            live Draft leagues (Auction &amp; Snake), scoring formulas, and the exact purpose of every
            public and authenticated page.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-text-secondary print:hidden">
            <span>File: LBFL-Basketball-Fantasy-Guide.pdf (8 Pages)</span>
            <span>•</span>
            <a
              href="/download/basketball-guide.pdf"
              download="LBFL-Basketball-Fantasy-Guide.pdf"
              className="text-amber-500 underline hover:text-amber-400"
            >
              Direct Link
            </a>
          </div>
        </div>

        {/* Embedded PDF Preview */}
        <div className="my-8 border border-border bg-surface print:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg/60">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-secondary">
              <FileText size={14} className="text-amber-500" />
              <span>PDF Preview — LBFL-Basketball-Fantasy-Guide.pdf</span>
            </div>
            <a
              href="/download/basketball-guide.pdf?inline=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono uppercase tracking-widest text-amber-500 hover:underline"
            >
              Open Raw PDF →
            </a>
          </div>
          <iframe
            src="/download/basketball-guide.pdf?inline=1"
            title="LBFL Basketball Fantasy Guide PDF"
            className="w-full h-[640px] bg-white"
          />
        </div>

        {/* Print-Friendly Summary Reference */}
        <div className="space-y-8 py-4">
          <section className="border border-border bg-surface p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-amber-500 mb-3">
              1. Core Game Modes &amp; Rules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-text-secondary leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider mb-2">
                  Classic Salary-Cap Mode
                </h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>10-Player Roster:</strong> 5 Starters (PG, SG, SF, PF, C) + 5 Bench slots (max 2 per primary position; dual-position eligibility supported).</li>
                  <li><strong>Budget &amp; Club Limits:</strong> €100.0m cap. Select a Favorite Club first (up to 5 players allowed from it; max 3 from any other club).</li>
                  <li><strong>Captaincy &amp; Locks:</strong> 1 Captain (2× points, no Vice Captain). Lineups lock 1 hour before Gameweek tip-off.</li>
                  <li><strong>Transfers &amp; Scoring:</strong> Free while building (&lt;10 players), -4 pts per extra transfer once full. Only starters score via FIBA LiveStats box-score formulas.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-text-primary uppercase text-xs tracking-wider mb-2">
                  Live Draft Mode (Closed Leagues)
                </h3>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>League Setup:</strong> 8–12 teams (max 3 active drafts per user per sport), Public or Password-Private, 0–11 AI bots.</li>
                  <li><strong>Formats:</strong> Live Auction ($50–$200 budget, $1/slot reserve, +1/+5/Custom/Max/Fold, Idle Auto-Bid &amp; Shortlist) or Snake Draft (randomized Round 1 + alternating reverse order).</li>
                  <li><strong>Roster &amp; Rules:</strong> Consistent (max 3/position) or Open, max 3 Imports (IMP), max 3 per club. H2H (38-GW round-robin) or Rotisserie.</li>
                  <li><strong>Waivers &amp; Trades:</strong> 0-pt Waiver Wire claims and Trade Fairness Engine (&gt;30% gap auto-rejected, &gt;5% triggers 75% league vote, -25 season deficit cap).</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-amber-500 mb-3">
                <Globe size={16} />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  2. Public Pages (Before Login)
                </h2>
              </div>
              <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                <li><strong>/ (Portal):</strong> Sport selector routing cleanly into Lebanese Football (LFFL) or Basketball (LBFL).</li>
                <li><strong>/basketball (Home):</strong> Hero, Gameweek countdown, 5-player preview court, rules, and signup funnel.</li>
                <li><strong>/basketball/league (Tournament Hub):</strong> Official standings, top scorers, and division context without logging in.</li>
                <li><strong>/basketball/players &amp; /match-center:</strong> Public player scouting database and live/historical box scores.</li>
                <li><strong>/basketball/fixtures, /standings &amp; /leagues:</strong> Schedule planner, league tables, and public league discovery.</li>
                <li><strong>/basketball/login &amp; /register:</strong> Authentication gateway unlocking squad management and live drafts.</li>
              </ul>
            </div>

            <div className="border border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-amber-500 mb-3">
                <ShieldCheck size={16} />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  3. Authenticated Pages (After Login)
                </h2>
              </div>
              <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                <li><strong>/dashboard:</strong> Manager command center showing GW lock countdown, active starting 5, rank, and form snapshot.</li>
                <li><strong>/dashboard/squad:</strong> Interactive court &amp; bench manager for starters, position swaps, and Captain assignment.</li>
                <li><strong>/dashboard/transfers:</strong> Transfer market enforcing €100m budget, Favorite Club cap, and -4 pt hit confirmation.</li>
                <li><strong>/dashboard/drafts:</strong> Create or join 8–12 manager Auction/Snake Draft leagues with AI bot backfill.</li>
                <li><strong>/dashboard/draft/:id &amp; /draft/:id/dashboard:</strong> Real-time WebSocket draft room plus post-draft roster, waivers, H2H schedule, and trade proposals.</li>
                <li><strong>/dashboard/leagues &amp; /profile:</strong> Private/public mini-leagues, Favorite Club settings, and manager account metrics.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
