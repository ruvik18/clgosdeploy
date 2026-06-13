
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

import counsellingsData from "./counsellings.json";
import collegesData from "./colleges.json";
import roundsData from "./rounds.json";
import cutoffsData from "./cutoffs.json";
import placementsData from "./placements.json";
import hostelsData from "./hostels.json";
import departmentsData from "./departments.json";
import internshipsData from "./internships.json";

export const counsellings = counsellingsData as Counselling[];
export const colleges = collegesData as College[];
export const rounds = roundsData as Round[];
export const cutoffs = cutoffsData as Cutoff[];
export const placements = placementsData as Record<string, PlacementData>;
export const hostels = hostelsData as Record<string, HostelData>;
export const departments = departmentsData as Record<string, Department[]>;
export const internships = internshipsData as Record<string, InternshipData>;

export const counsellingBySlug = new Map(counsellings.map((c) => [c.slug, c]));
export const counsellingById = new Map(counsellings.map((c) => [c.id, c]));
export const collegeBySlug = new Map(colleges.map((c) => [c.slug, c]));
export const collegeById = new Map(colleges.map((c) => [c.id, c]));
