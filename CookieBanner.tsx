import React, { useState } from 'react';
import { Copy, Check, FileCode, Database, Terminal, FileJson, Sparkles } from 'lucide-react';

export default function DeveloperTab() {
  const [activeTab, setActiveTab] = useState<'postgres' | 'prisma' | 'utility'>('postgres');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const postgresSchema = `-- Database Schema for SaaShelf
-- Run this directly in Supabase or any standard PostgreSQL instance
CREATE TABLE IF NOT EXISTS startup_listings (
    id SERIAL PRIMARY KEY,
    startup_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    short_description TEXT NOT NULL,
    revenue_30d VARCHAR(50) NOT NULL,          -- Formatted string, e.g. "$6.2k"
    asking_price VARCHAR(50) NOT NULL,         -- Formatted string, e.g. "$130k"
    multiple VARCHAR(20) NOT NULL,             -- Multiple, e.g. "1.7x"
    source_platform VARCHAR(100) DEFAULT 'trustmrr' NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Optimize listings queries by indexing key search parameters
CREATE INDEX IF NOT EXISTS idx_listings_platform ON startup_listings(source_platform);
CREATE INDEX IF NOT EXISTS idx_listings_category ON startup_listings(category);`;

  const postgresSeed = `-- Run this query to seed premium TrustMRR listings (price >= $10,000)
INSERT INTO startup_listings (
  startup_name, category, short_description, revenue_30d, asking_price, multiple, source_platform, original_url
) VALUES
('Outstand.so', 'Developer Tools', 'Unified social media API - the only usage-based pricing API in this market. For developers, agents and content management automations.', '$6.2k', '$130k', '1.7x', 'trustmrr', 'https://trustmrr.com/startup/outstand-so'),
('Backlinker AI', 'Marketing', 'Backlinker AI automates backlink acquisition through AI-powered reporter and editorial outreach. Built for agencies, founders, and SEO teams.', '$23k', '$350k', '1.3x', 'trustmrr', 'https://trustmrr.com/startup/backlinker-ai'),
('NextjobConnect LLC', 'SaaS', 'Real-time job leads for home service contractors. Monitors neighborhood platforms, AI-classifies posts by trade, and alerts subscribers.', '$5.8k', '$100k', '1.4x', 'trustmrr', 'https://trustmrr.com/startup/nextjobconnect-llc'),
('Atlas', 'Artificial Intelligence', 'Atlas is a personalized learning platform for students. Atlas\\'s AI studies your class materials to help you nail your homework and ace your tests.', '$22k', '$1.3M', '4.7x', 'trustmrr', 'https://trustmrr.com/startup/atlas'),
('Fiddl.art', 'Content Creation', 'Fiddl.art is a creative platform for high quality AI images and videos using models like Nano Banana Pro, Flux 2 and Sora.', '$28k', '$1.1M', '3.4x', 'trustmrr', 'https://trustmrr.com/startup/fiddl-art'),
('Chatwith', 'Customer Support', 'AI chatbots for agencies. Trained on website & files, fully white labeled, and with AI tool use.', '$4.2k', '$147k', '2.9x', 'trustmrr', 'https://trustmrr.com/startup/chatwith'),
('POST BRIDGE', 'Social Media', 'Post your content to multiple social media platforms at the same time, all-in one place.', '$41k', '$4.2M', '8.6x', 'trustmrr', 'https://trustmrr.com/startup/post-bridge'),
('VoiceType.com', 'Artificial Intelligence', 'VoiceType is an AI-driven voice dictation software designed to increase productivity by replacing typing with speech.', '$6.5k', '$219k', '2.8x', 'trustmrr', 'https://trustmrr.com/startup/voicetype-com'),
('RunAds.ai', 'Marketing', 'Fully autonomous AI google ads agent for all businesses! Ecommerce, lead gen, retail, local service based!', '$11k', '$200k', '1.5x', 'trustmrr', 'https://trustmrr.com/startup/runads-ai');`;

  const prismaSchema = `// Paste into schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model StartupListing {
  id                Int      @id @default(autoincrement())
  startup_name      String   @map("startup_name")
  category          String   @map("category")
  short_description String   @map("short_description")
  revenue_30d       String   @map("revenue_30d")
  asking_price      String   @map("asking_price")
  multiple          String   @map("multiple")
  source_platform   String   @default("trustmrr") @map("source_platform")
  original_url      String   @map("original_url")
  created_at        DateTime @default(now()) @map("created_at")

  @@map("startup_listings")
}`;

  const prismaSeeder = `// Paste into prisma/seed.ts:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const listings = [
  { startup_name: "Outstand.so", category: "Developer Tools", short_description: "Unified social media API...", revenue_30d: "$6.2k", asking_price: "$130k", multiple: "1.7x", original_url: "https://trustmrr.com/startup/outstand-so" },
  { startup_name: "Backlinker AI", category: "Marketing", short_description: "Backlinker AI automates...", revenue_30d: "$23k", asking_price: "$350k", multiple: "1.3x", original_url: "https://trustmrr.com/startup/backlinker-ai" }
  // ... Paste other listings from seeder file!
];

async function main() {
  for (const item of listings) {
    await prisma.startupListing.create({ data: item });
  }
}
main().finally(() => prisma.$disconnect());`;

  const affiliateCodeSnippet = `/**
 * Modular Link Generator (Strategy Pattern based)
 * Easily add Flippa, EmpireFlippers later
 */

export const PLATFORM_CONFIGS = {
  trustmrr: {
    platform: 'trustmrr',
    defaultRefCode: 'YOUR_CODE',
    generateUrl: (originalUrl, refCode) => {
      try {
        const url = new URL(originalUrl);
        url.searchParams.set('ref', refCode);
        return url.toString();
      } catch {
        const separator = originalUrl.includes('?') ? '&' : '?';
        return \`\${originalUrl\}\${separator\}ref=\${refCode\}\`;
      }
    }
  },
  flippa: {
    platform: 'flippa',
    defaultRefCode: 'flippa_partner',
    generateUrl: (originalUrl, refCode) => {
      try {
        const url = new URL(originalUrl);
        url.searchParams.set('aff', refCode);
        return url.toString();
      } catch {
        const separator = originalUrl.includes('?') ? '&' : '?';
        return \`\${originalUrl\}\${separator\}aff=\${refCode\}\`;
      }
    }
  }
};

export function generateAffiliateLink(originalUrl, platform = 'trustmrr', customRef) {
  const config = PLATFORM_CONFIGS[platform.toLowerCase()];
  if (!config) return originalUrl;
  return config.generateUrl(originalUrl, customRef || config.defaultRefCode);
}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            For Developers & Builders
          </span>
          <h2 className="font-display text-2xl font-bold text-slate-800 tracking-tight mt-2 flex items-center gap-1.5">
            SaaShelf Modular Assembly Kit
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            "We assemble applications by combining working parts." Fast, zero-overhead code snippets.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            id="tab-postgres-btn"
            onClick={() => setActiveTab('postgres')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'postgres' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> PostgreSQL
          </button>
          <button
            id="tab-prisma-btn"
            onClick={() => setActiveTab('prisma')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'prisma' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Prisma DB
          </button>
          <button
            id="tab-utility-btn"
            onClick={() => setActiveTab('utility')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'utility' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Link Utility
          </button>
        </div>
      </div>

      {/* Copyable Workspace Card */}
      {activeTab === 'postgres' && (
        <div className="space-y-6">
          <div className="border border-slate-200/65 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" /> schema.sql
              </span>
              <button
                id="copy-pg-schema"
                onClick={() => copyToClipboard(postgresSchema, 'pg-schema')}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors font-mono active:scale-95"
              >
                {copiedSection === 'pg-schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'pg-schema' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[220px] scrollbar-thin">
              {postgresSchema}
            </pre>
          </div>

          <div className="border border-slate-200/65 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" /> seeder.sql
              </span>
              <button
                id="copy-pg-seed"
                onClick={() => copyToClipboard(postgresSeed, 'pg-seed')}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors font-mono active:scale-95"
              >
                {copiedSection === 'pg-seed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'pg-seed' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[220px] scrollbar-thin">
              {postgresSeed}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'prisma' && (
        <div className="space-y-6">
          <div className="border border-slate-200/65 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" /> schema.prisma
              </span>
              <button
                id="copy-prisma-schema"
                onClick={() => copyToClipboard(prismaSchema, 'prisma-schema')}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors font-mono active:scale-95"
              >
                {copiedSection === 'prisma-schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'prisma-schema' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[220px] scrollbar-thin">
              {prismaSchema}
            </pre>
          </div>

          <div className="border border-slate-200/65 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-purple-400" /> seed.ts
              </span>
              <button
                id="copy-prisma-seed"
                onClick={() => copyToClipboard(prismaSeeder, 'prisma-seed')}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors font-mono active:scale-95"
              >
                {copiedSection === 'prisma-seed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'prisma-seed' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[220px] scrollbar-thin">
              {prismaSeeder}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'utility' && (
        <div className="space-y-4">
          <div className="border border-slate-200/65 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" /> utils/affiliateLinks.js (Strategy Pattern)
              </span>
              <button
                id="copy-util-snippet"
                onClick={() => copyToClipboard(affiliateCodeSnippet, 'util-snippet')}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors font-mono active:scale-95"
              >
                {copiedSection === 'util-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'util-snippet' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[380px] scrollbar-thin">
              {affiliateCodeSnippet}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
