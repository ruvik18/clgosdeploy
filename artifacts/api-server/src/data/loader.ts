import { readFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data");

function loadJson<T>(filename: string): T {
  const candidates = [
    join(DATA_DIR, filename),
    join(__dirname, filename),
  ];
  for (const filePath of candidates) {
    try {
      return JSON.parse(readFileSync(filePath, "utf-8")) as T;
    } catch {
    }
  }
  throw new Error(`Cannot find data file: ${filename} (tried ${candidates.join(", ")})`);
}

interface Counselling {
  id: string;
  name: string;
  slug: string;
  type: string;
  level: string;
  states: string[];
  startMonth: string;
  endMonth: string;
  startYear: number;
  logoUrl: string | null;
  description: string;
  about?: string;
  totalColleges?: number;
  totalSeats?: number;
  rounds: number;
  importantDates?: Array<{ event: string; date: string }>;
}

interface College {
  id: string;
  name: string;
  slug: string;
  location: string;
  state: string;
  type: string;
  established: number;
  naacGrade: string | null;
  logoUrl: string | null;
  coverImageUrl?: string | null;
  tagline?: string | null;
  description: string;
  about?: string | null;
  admissionThrough: string;
  website?: string | null;
  avgPackageLPA: number | null;
  medianPackageLPA?: number | null;
  peakPackageCR: number | null;
  peakInternationalPackageCR?: number | null;
  cseCutoffRank: number | null;
  nirfRank: number | null;
  nirfRankCategory?: string | null;
  qsWorldRank?: number | null;
  placementPercent: number | null;
  totalOffers: number | null;
  linkedinAlumni?: number | null;
  totalFaculty?: number | null;
  totalStudents?: number | null;
  campusAreaAcres?: number | null;
  counsellings: string[];
  topRecruiters: string[];
  facilities: string[];
  labs: Array<{ name: string; description: string }>;
  tags: string[];
  featured: boolean;
}

interface Round {
  id: string;
  counsellingId: string;
  roundNumber: number;
  name: string;
  registrationStart: string;
  registrationEnd: string;
  resultDate: string;
  year: number;
  notes: string | null;
}

interface Cutoff {
  id: string;
  collegeId: string;
  counsellingId: string;
  year: number;
  round: number;
  branch: string;
  branchCode: string | null;
  category: string;
  quota: string | null;
  openRank: number;
  closeRank: number;
  gender: string | null;
}

interface PlacementData {
  collegeId: string;
  year: number;
  totalOffers: number;
  companiesRegistered: number;
  companiesOffered: number;
  internationalOffers: number;
  placementPercent: number;
  avgPackageLPA: number;
  medianPackageLPA: number;
  peakPackageCR: number;
  mbdPlacedPercent: number | null;
  topRecruiters: string[];
  sectorBreakdown: Array<{ sector: string; firms: number; percentage: number }>;
  yearWiseTrend: Array<{ year: number; avgPackageLPA: number; peakPackageCR: number; totalOffers: number; placementPercent: number }>;
}

interface HostelData {
  collegeId: string;
  totalHostels: number;
  boysHostels: number;
  girlsHostels: number;
  totalCapacity: number;
  boysCapacity: number | null;
  girlsCapacity: number | null;
  feePerYear: number | null;
  description: string | null;
  amenities: string[];
  hostels: Array<{ name: string; type: string; capacity: number; feePerYear: number | null; floors: number | null; amenities: string[] }>;
}

interface Department {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  seats: number;
  avgPackageLPA: number | null;
  peakPackageLPA: number | null;
  cseCutoffRank: number | null;
  duration: string;
  description: string | null;
}

interface InternshipData {
  collegeId: string;
  year: number;
  totalInterns: number;
  avgStipendPerMonth: number;
  peakStipendPerMonth: number | null;
  topCompanies: string[];
  internationalInternships: number;
  conversionToFullTime: number | null;
}

export const counsellings = loadJson<Counselling[]>("counsellings.json");
export const colleges = loadJson<College[]>("colleges.json");
export const rounds = loadJson<Round[]>("rounds.json");
export const cutoffs = loadJson<Cutoff[]>("cutoffs.json");
export const placements = loadJson<Record<string, PlacementData>>("placements.json");
export const hostels = loadJson<Record<string, HostelData>>("hostels.json");
export const departments = loadJson<Record<string, Department[]>>("departments.json");
export const internships = loadJson<Record<string, InternshipData>>("internships.json");

export const counsellingBySlug = new Map(counsellings.map((c) => [c.slug, c]));
export const counsellingById = new Map(counsellings.map((c) => [c.id, c]));
export const collegeBySlug = new Map(colleges.map((c) => [c.slug, c]));
export const collegeById = new Map(colleges.map((c) => [c.id, c]));
