// Branches API Service - Re-exports from the main service file
export * from "./apiBranchQR";
export { default } from "./apiBranchQR";
import apiBranchQR from "./apiBranchQR";
export const apiBranches = apiBranchQR;
