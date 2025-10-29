"use client";

import { useEffect, useState } from "react";
import { getBranches, Branch } from "@/services/apiBranchQR";

interface BranchSelectorProps {
  selectedBranches: string[];
  onChange: (branchIds: string[]) => void;
  label?: string;
  description?: string;
  required?: boolean;
}

export function BranchSelector({
  selectedBranches,
  onChange,
  label = "اختر الفروع",
  description = "اختر الفروع التي سيكون هذا العنصر متاحاً فيها",
  required = false,
}: BranchSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    // Check if all branches are selected
    if (branches.length > 0 && selectedBranches.length === branches.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedBranches, branches]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches({ is_active: true });
      // Filter out branches without IDs
      setBranches(data.filter((b) => b.id));
    } catch (error) {
      console.error("Failed to load branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBranch = (branchId: string | undefined) => {
    if (!branchId) return;
    if (selectedBranches.includes(branchId)) {
      onChange(selectedBranches.filter((id) => id !== branchId));
    } else {
      onChange([...selectedBranches, branchId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onChange([]);
    } else {
      onChange(branches.map((b) => b.id).filter((id): id is string => !!id));
    }
    setSelectAll(!selectAll);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-gray-600 text-sm mb-3">{description}</p>
      )}

      {branches.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="text-sm">لا توجد فروع نشطة حالياً</p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          {/* Select All Option */}
          <div className="mb-3 pb-3 border-b border-gray-300">
            <label className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <span className="mr-3 text-sm font-semibold text-gray-800">
                تحديد الكل ({branches.length})
              </span>
            </label>
          </div>

          {/* Branches List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {branches.map((branch) => {
              if (!branch.id) return null;
              return (
                <label
                  key={branch.id}
                  className="flex items-center cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedBranches.includes(branch.id)}
                    onChange={() => handleToggleBranch(branch.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="mr-3 text-sm text-gray-700">
                    {branch.name_ar}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Selected Count */}
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              تم اختيار {selectedBranches.length} من {branches.length} فرع
            </p>
          </div>

          {/* Warning if no branches selected */}
          {selectedBranches.length === 0 && required && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
              <p className="text-xs text-red-600">
                ⚠️ يرجى اختيار فرع واحد على الأقل
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
