import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FeedbackSurvey from "../../src/components/FeedbackSurvey";
import { apiCustomerFeedback } from "../../services/apiCustomerFeedback";
import { apiBranches } from "../../services/apiBranches";

// Mock the API services
jest.mock("../../services/apiCustomerFeedback");
jest.mock("../../services/apiBranches");
jest.mock("../../src/lib/feature-flags", () => ({
  isFeatureEnabled: jest.fn(() => true),
}));

const mockApiCustomerFeedback = apiCustomerFeedback as jest.Mocked<
  typeof apiCustomerFeedback
>;
const mockApiBranches = apiBranches as jest.Mocked<typeof apiBranches>;

describe("FeedbackSurvey", () => {
  const mockBranch = {
    id: "test-branch-id",
    name_ar: "فرع تجريبي",
    name_en: "Test Branch",
    address_ar: "الرياض",
    address_en: "Riyadh",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiBranches.getPublicBranch.mockResolvedValue(mockBranch);
    mockApiCustomerFeedback.submitFeedback.mockResolvedValue({
      id: "test-feedback-id",
      branch_id: "test-branch-id",
      customer_name: "Test Customer",
      phone_number: "+966501234567",
      overall_rating: 3,
      created_at: "2024-01-01T00:00:00Z",
    });
  });

  it("renders loading state initially", () => {
    render(<FeedbackSurvey branchId="test-branch-id" />);

    expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
  });

  it("renders branch information after loading", async () => {
    render(<FeedbackSurvey branchId="test-branch-id" />);

    await waitFor(() => {
      expect(screen.getByText("فرع تجريبي")).toBeInTheDocument();
    });
  });

  it("displays survey form with all required fields", async () => {
    render(<FeedbackSurvey branchId="test-branch-id" />);

    await waitFor(() => {
      expect(screen.getByText("معلومات العميل")).toBeInTheDocument();
      expect(screen.getByText("تقييم الخدمة")).toBeInTheDocument();
      expect(screen.getByLabelText(/الاسم الكامل/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/رقم الهاتف/i)).toBeInTheDocument();
    });
  });

  it("shows progress indicator", async () => {
    render(<FeedbackSurvey branchId="test-branch-id" />);

    await waitFor(() => {
      expect(screen.getByText("تقدم الاستطلاع")).toBeInTheDocument();
    });
  });

  it("displays rating categories", async () => {
    render(<FeedbackSurvey branchId="test-branch-id" />);

    await waitFor(() => {
      expect(screen.getByText("الاستقبال والترحيب")).toBeInTheDocument();
      expect(screen.getByText("طريقة تقديم الطلب")).toBeInTheDocument();
      expect(screen.getByText("سرعة الخدمة")).toBeInTheDocument();
      expect(screen.getByText("جودة الطعام")).toBeInTheDocument();
      expect(screen.getByText("مستوي النظافه")).toBeInTheDocument();
    });
  });

  it("allows rating selection", async () => {
    render(<FeedbackSurvey branchId="test-branch-id" />);

    await waitFor(() => {
      const ratingButtons = screen.getAllByRole("radio");
      expect(ratingButtons.length).toBeGreaterThan(0);
    });
  });

  it("shows error when branch is not found", async () => {
    mockApiBranches.getPublicBranch.mockResolvedValue(null);

    render(<FeedbackSurvey branchId="invalid-branch-id" />);

    await waitFor(() => {
      expect(
        screen.getByText("الفرع غير موجود أو غير متاح")
      ).toBeInTheDocument();
    });
  });

  it("shows error when API fails", async () => {
    mockApiBranches.getPublicBranch.mockRejectedValue(new Error("API Error"));

    render(<FeedbackSurvey branchId="test-branch-id" />);

    await waitFor(() => {
      expect(
        screen.getByText("خطأ في تحميل معلومات الفرع")
      ).toBeInTheDocument();
    });
  });

  it("displays feature disabled message when feature is disabled", () => {
    const { isFeatureEnabled } = require("../../src/lib/feature-flags");
    isFeatureEnabled.mockReturnValue(false);

    render(<FeedbackSurvey branchId="test-branch-id" />);

    expect(
      screen.getByText("استطلاع التقييم غير متاح حالياً")
    ).toBeInTheDocument();
  });
});
