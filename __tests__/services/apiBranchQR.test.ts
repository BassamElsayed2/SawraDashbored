import { apiBranchQR } from "../../services/apiBranchQR";
import { isFeatureEnabled } from "../../src/lib/feature-flags";

// Mock the feature flags
jest.mock("../../src/lib/feature-flags", () => ({
  isFeatureEnabled: jest.fn(),
}));

// Mock Supabase
jest.mock("../../services/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
        in: jest.fn(() => ({
          data: null,
          error: null,
        })),
        order: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

describe("apiBranchQR", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateQRCode", () => {
    it("should throw error when feature is disabled", async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);

      await expect(
        apiBranchQR.generateQRCode("test-branch-id")
      ).rejects.toThrow("QR code generation feature is disabled");
    });

    it("should generate QR code when feature is enabled", async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(true);

      // Mock successful branch fetch
      const mockSupabase = require("../../services/supabase").default;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "test-branch-id", name_en: "Test Branch" },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "qr-id", branch_id: "test-branch-id" },
              error: null,
            }),
          }),
        }),
      });

      const result = await apiBranchQR.generateQRCode("test-branch-id");

      expect(result).toBeDefined();
      expect(result.branch_id).toBe("test-branch-id");
    });
  });

  describe("getBranchQRCode", () => {
    it("should return null when feature is disabled", async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);

      const result = await apiBranchQR.getBranchQRCode("test-branch-id");
      expect(result).toBeNull();
    });
  });

  describe("getBranchQRCodes", () => {
    it("should return empty array when feature is disabled", async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);

      const result = await apiBranchQR.getBranchQRCodes();
      expect(result).toEqual([]);
    });
  });

  describe("deleteBranchQRCode", () => {
    it("should throw error when feature is disabled", async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);

      await expect(
        apiBranchQR.deleteBranchQRCode("test-branch-id")
      ).rejects.toThrow("QR code generation feature is disabled");
    });
  });

  describe("getQRCodesForBranches", () => {
    it("should return empty array when feature is disabled", async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);

      const result = await apiBranchQR.getQRCodesForBranches([
        "branch1",
        "branch2",
      ]);
      expect(result).toEqual([]);
    });
  });
});
