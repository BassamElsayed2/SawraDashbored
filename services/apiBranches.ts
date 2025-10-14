// Branches API Service - Wrapper for apiBranchQR for backward compatibility
import {
  getBranches,
  getBranchById,
  getPublicBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  Branch,
} from "./apiBranchQR";

export type { Branch };

export const apiBranches = {
  getBranches,
  getBranchById,
  getPublicBranch,
  createBranch,
  updateBranch,
  deleteBranch,
};

export default apiBranches;
