"use client";

import React, { useState, useEffect } from "react";
import { apiBranchQR } from "../../services/apiBranchQR";
import { apiBranches } from "../../services/apiBranches";
import { Branch, BranchQRCode } from "../types/feedback";
import { QRCodeOptions } from "../lib/qr-code-generator";
import { isFeatureEnabled } from "../lib/feature-flags";

interface QRCodeManagementProps {
  className?: string;
}

export const QRCodeManagement: React.FC<QRCodeManagementProps> = ({
  className = "",
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [qrCodes, setQRCodes] = useState<
    (BranchQRCode & { branch?: Branch })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [qrOptions, setQROptions] = useState<Partial<QRCodeOptions>>({
    width: 300,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
  const [analytics, setAnalytics] = useState({
    total_qr_codes: 0,
    branches_with_qr: 0,
    total_branches: 0,
    qr_generation_stats: { today: 0, this_week: 0, this_month: 0 },
  });

  // Check if feature is enabled
  if (!isFeatureEnabled("ENABLE_QR_CODE_GENERATION")) {
    return (
      <div
        className={`p-6 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              QR Code Generation Feature Disabled
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This feature is currently disabled. Please enable the QR code
                generation feature flag to use this functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [branchesData, qrCodesData, analyticsData] = await Promise.all([
        apiBranches.getBranches(),
        apiBranchQR.getBranchQRCodes(),
        apiBranchQR.getQRCodeAnalytics(),
      ]);

      setBranches(branchesData);
      setQRCodes(qrCodesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading QR code data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCode = async (branchId: string) => {
    setLoading(true);
    try {
      const newQRCode = await apiBranchQR.generateQRCode(branchId, qrOptions);
      setQRCodes((prev) => {
        const existing = prev.find((qr) => qr.branch_id === branchId);
        if (existing) {
          return prev.map((qr) => (qr.branch_id === branchId ? newQRCode : qr));
        }
        return [...prev, newQRCode];
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedBranches.length === 0) return;

    setLoading(true);
    try {
      const newQRCodes = await apiBranchQR.bulkGenerateQRCodes(
        selectedBranches,
        qrOptions
      );
      setQRCodes((prev) => {
        const updated = [...prev];
        newQRCodes.forEach((newQR) => {
          const existingIndex = updated.findIndex(
            (qr) => qr.branch_id === newQR.branch_id
          );
          if (existingIndex >= 0) {
            updated[existingIndex] = newQR;
          } else {
            updated.push(newQR);
          }
        });
        return updated;
      });
      setSelectedBranches([]);
    } catch (error) {
      console.error("Error bulk generating QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQRCode = async (
    branchId: string,
    format: "png" | "svg"
  ) => {
    try {
      if (format === "svg") {
        const { svg, metadata } = await apiBranchQR.generateQRCodeSVG(
          branchId,
          qrOptions
        );
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-code-${branchId}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const { buffer, metadata } = await apiBranchQR.generateQRCodeBuffer(
          branchId,
          qrOptions
        );
        const blob = new Blob([buffer], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-code-${branchId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const handleRegenerateQRCode = async (branchId: string) => {
    setLoading(true);
    try {
      const newQRCode = await apiBranchQR.regenerateQRCode(branchId, qrOptions);
      setQRCodes((prev) =>
        prev.map((qr) => (qr.branch_id === branchId ? newQRCode : qr))
      );
    } catch (error) {
      console.error("Error regenerating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQRCode = async (branchId: string) => {
    try {
      await apiBranchQR.deleteBranchQRCode(branchId);
      setQRCodes((prev) => prev.filter((qr) => qr.branch_id !== branchId));
    } catch (error) {
      console.error("Error deleting QR code:", error);
    }
  };

  const toggleBranchSelection = (branchId: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">QR Code Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.total_qr_codes}
            </div>
            <div className="text-sm text-gray-600">Total QR Codes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.branches_with_qr}
            </div>
            <div className="text-sm text-gray-600">Branches with QR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.total_branches}
            </div>
            <div className="text-sm text-gray-600">Total Branches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.qr_generation_stats.today}
            </div>
            <div className="text-sm text-gray-600">Generated Today</div>
          </div>
        </div>
      </div>

      {/* QR Code Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">QR Code Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width (pixels)
            </label>
            <input
              type="number"
              min="100"
              max="1000"
              value={qrOptions.width}
              onChange={(e) =>
                setQROptions((prev) => ({
                  ...prev,
                  width: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margin
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={qrOptions.margin}
              onChange={(e) =>
                setQROptions((prev) => ({
                  ...prev,
                  margin: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Error Correction Level
            </label>
            <select
              value={qrOptions.errorCorrectionLevel}
              onChange={(e) =>
                setQROptions((prev) => ({
                  ...prev,
                  errorCorrectionLevel: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Generation */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Bulk QR Code Generation</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {branches.map((branch) => (
              <label
                key={branch.id}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBranches.includes(branch.id)}
                  onChange={() => toggleBranchSelection(branch.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {branch.name_en || branch.name_ar}
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={handleBulkGenerate}
            disabled={selectedBranches.length === 0 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate QR Codes for Selected Branches ({selectedBranches.length})
          </button>
        </div>
      </div>

      {/* QR Codes List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Generated QR Codes</h2>
        <div className="space-y-4">
          {qrCodes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No QR codes generated yet.
            </p>
          ) : (
            qrCodes.map((qrCode) => {
              const branch = branches.find((b) => b.id === qrCode.branch_id);
              return (
                <div
                  key={qrCode.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={qrCode.qr_code_url}
                        alt={`QR Code for ${
                          branch?.name_en || branch?.name_ar
                        }`}
                        className="w-16 h-16 border border-gray-200 rounded"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {branch?.name_en || branch?.name_ar}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Generated:{" "}
                          {new Date(
                            qrCode.created_at || ""
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleDownloadQRCode(qrCode.branch_id, "png")
                        }
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        PNG
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadQRCode(qrCode.branch_id, "svg")
                        }
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        SVG
                      </button>
                      <button
                        onClick={() => handleRegenerateQRCode(qrCode.branch_id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={() => handleDeleteQRCode(qrCode.branch_id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
