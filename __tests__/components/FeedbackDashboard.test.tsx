import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedbackDashboard } from "../../src/components/FeedbackDashboard";
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

// Create a new QueryClient for testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("FeedbackDashboard", () => {
  const mockFeedbackData = {
    feedback: [
      {
        id: "1",
        customer_name: "أحمد محمد",
        phone_number: "+966501234567",
        email: "ahmed@example.com",
        overall_rating: 4,
        created_at: "2024-12-01T10:00:00Z",
        branch: {
          id: "branch-1",
          name_ar: "فرع الرياض",
          name_en: "Riyadh Branch",
          address_ar: "الرياض، المملكة العربية السعودية",
        },
        ratings: [
          { category: "reception", rating: 4 },
          { category: "order_delivery", rating: 3 },
          { category: "service_speed", rating: 4 },
          { category: "food_quality", rating: 4 },
          { category: "cleanliness", rating: 4 },
        ],
      },
    ],
    total: 1,
  };

  const mockBranches = [
    {
      id: "branch-1",
      name_ar: "فرع الرياض",
      name_en: "Riyadh Branch",
      address_ar: "الرياض، المملكة العربية السعودية",
    },
    {
      id: "branch-2",
      name_ar: "فرع جدة",
      name_en: "Jeddah Branch",
      address_ar: "جدة، المملكة العربية السعودية",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    mockApiCustomerFeedback.getFeedbackData.mockResolvedValue(mockFeedbackData);
    mockApiBranches.getBranches.mockResolvedValue(mockBranches);
  });

  it("renders feedback dashboard with statistics", async () => {
    renderWithQueryClient(<FeedbackDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("إجمالي التقييمات")).toBeInTheDocument();
    });

    // Check if statistics are displayed
    expect(screen.getByText("1")).toBeInTheDocument(); // Total feedback count
    expect(screen.getByText("4.0")).toBeInTheDocument(); // Average rating
  });

  it("renders feedback table with data", async () => {
    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      expect(screen.getByText("أحمد محمد")).toBeInTheDocument();
    });

    // Check if customer information is displayed
    expect(screen.getByText("+966501234567")).toBeInTheDocument();
    expect(screen.getByText("فرع الرياض")).toBeInTheDocument();
    expect(screen.getByText("4 ⭐ ممتاز")).toBeInTheDocument();
  });

  it("handles filter changes", async () => {
    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      expect(screen.getByText("تصفية النتائج")).toBeInTheDocument();
    });

    // Check if filters are rendered
    expect(screen.getByText("البحث")).toBeInTheDocument();
    expect(screen.getByText("الفرع")).toBeInTheDocument();
    expect(screen.getByText("التقييم")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    // Mock loading state
    mockApiCustomerFeedback.getFeedbackData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithQueryClient(<FeedbackDashboard />);

    // Check if loading skeleton is displayed
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("shows empty state when no feedback", async () => {
    mockApiCustomerFeedback.getFeedbackData.mockResolvedValue({
      feedback: [],
      total: 0,
    });

    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      expect(screen.getByText("لا توجد تقييمات")).toBeInTheDocument();
    });
  });

  it("handles export functionality", async () => {
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
    const mockLink = {
      href: "",
      download: "",
      style: {},
      click: jest.fn(),
    };

    global.URL.createObjectURL = mockCreateObjectURL;
    global.document.createElement = jest.fn(() => mockLink as any);
    global.document.body.appendChild = jest.fn();
    global.document.body.removeChild = jest.fn();

    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      expect(screen.getByText("تصدير البيانات")).toBeInTheDocument();
    });

    const exportButton = screen.getByText("تصدير البيانات");
    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
  });

  it("handles feedback deletion", async () => {
    mockApiCustomerFeedback.deleteFeedback.mockResolvedValue(undefined);

    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      expect(screen.getByText("أحمد محمد")).toBeInTheDocument();
    });

    // Mock confirm dialog
    global.confirm = jest.fn(() => true);

    const deleteButton = screen.getByText("حذف");
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockApiCustomerFeedback.deleteFeedback).toHaveBeenCalledWith("1");
  });

  it("shows error state when API fails", async () => {
    mockApiCustomerFeedback.getFeedbackData.mockRejectedValue(
      new Error("API Error")
    );

    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      expect(screen.getByText("خطأ في تحميل البيانات")).toBeInTheDocument();
    });
  });

  it("disables export button when no data", async () => {
    mockApiCustomerFeedback.getFeedbackData.mockResolvedValue({
      feedback: [],
      total: 0,
    });

    renderWithQueryClient(<FeedbackDashboard />);

    await waitFor(() => {
      const exportButton = screen.getByText("تصدير البيانات");
      expect(exportButton).toBeDisabled();
    });
  });
});
