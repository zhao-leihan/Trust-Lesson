/**
 * Trust lesson - Local Database Schemas
 * Defines data structures and validation schemas for local storage & IndexedDB.
 * Note: Video files are excluded from DB storage per requirement and handled via client runtime.
 */

export const UserSchema = {
  id: "string",             // unique ID or email
  name: "string",           // display name
  email: "string",          // email
  role: "mentor | student", // platform role
  avatar: "string",         // avatar initial or URL
  domain: "string",         // professional domain
  bio: "string",            // biography
  linkedin: "string",       // LinkedIn URL
  instagram: "string",      // Instagram handle
  twitter: "string",        // X / Twitter handle
  portfolio: "string",      // Portfolio URL
  hourlyRate: "string",     // hourly rate in USD
  createdAt: "string",      // ISO timestamp
};

export const GigSchema = {
  id: "string",             // unique gig id (e.g. gig-1729000000000)
  title: "string",          // gig or course title
  mentorName: "string",     // mentor name
  mentorEmail: "string",    // mentor email reference
  category: "string",       // category (e.g., Coding, Design, Web3, Career)
  price: "number",          // total price in USD
  duration: "string",       // duration (e.g. 4 Weeks)
  description: "string",    // detailed gig description
  level: "string",          // Beginner | Intermediate | Advanced | All levels
  color: "string",          // visual accent color theme
  milestones: "array",      // array of { title: string, amount: number }
  hasVideoIntro: "boolean", // flag confirming required video was uploaded
  videoFileName: "string",  // original video file name (binary video excluded from DB)
  videoDuration: "string",  // video duration/type label
  createdAt: "string",      // ISO timestamp
};

export const SessionSchema = {
  id: "string",             // booking session id
  type: "session | course", // 1-on-1 session or milestone course
  skill: "string",          // course/session skill title
  mentor: "string",         // mentor name
  mentorEmail: "string",    // mentor email reference
  studentName: "string",    // student name
  studentEmail: "string",   // student email
  date: "string",           // session date
  time: "string",           // session time
  price: "number",          // escrow locked amount in USD
  status: "locked | in-session | released | disputed",
  escrowStatus: "string",   // Escrow Secured | In Progress | Released | Disputed
  milestones: "array",      // milestone tracking array
  createdAt: "string",      // ISO timestamp
};

export const PortfolioItemSchema = {
  id: "string",             // portfolio item id
  mentorEmail: "string",    // mentor owner email
  title: "string",          // project title
  description: "string",    // project description
  projectUrl: "string",     // live demo URL
  githubUrl: "string",      // repository or case study URL
  tags: "array",            // array of skill tags (e.g. ["React", "Solidity", "Node.js"])
  featured: "boolean",      // featured highlight flag
  createdAt: "string",      // ISO timestamp
};

export const WalletSchema = {
  address: "string",        // Web3 address (0x...)
  network: "string",        // Arbitrum One
  balanceUSDC: "number",    // available balance
  lockedEscrow: "number",   // amount locked in smart contracts
  transactions: "array",    // array of { id, type, amount, status, date, txHash }
};
