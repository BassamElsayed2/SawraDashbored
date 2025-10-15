"use client";

import React, { useState, useEffect } from "react";
import { deliveryApi, DeliveryFeeConfig } from "@/services/apiDelivery";
import toast from "react-hot-toast";

export default function DeliveryFeesPage() {
  const [configs, setConfigs] = useState<DeliveryFeeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DeliveryFeeConfig | null>(
    null
  );

  const [formData, setFormData] = useState({
    min_distance_km: 0,
    max_distance_km: 0,
    fee: 0,
  });

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await deliveryApi.getDeliveryFeeConfigs();
      if (error) {
        toast.error("فشل تحميل إعدادات رسوم التوصيل");
        console.error(error);
      } else {
        setConfigs(data || []);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.min_distance_km >= formData.max_distance_km) {
      toast.error("المسافة الدنيا يجب أن تكون أقل من المسافة القصوى");
      return;
    }

    try {
      if (editingConfig) {
        const { error } = await deliveryApi.updateDeliveryFeeConfig(
          editingConfig.id,
          formData
        );
        if (error) {
          toast.error("فشل تحديث الإعدادات");
        } else {
          toast.success("تم تحديث الإعدادات بنجاح");
          setShowAddModal(false);
          setEditingConfig(null);
          resetForm();
          fetchConfigs();
        }
      } else {
        const { error } = await deliveryApi.createDeliveryFeeConfig(formData);
        if (error) {
          toast.error("فشل إضافة الإعدادات");
        } else {
          toast.success("تم إضافة الإعدادات بنجاح");
          setShowAddModal(false);
          resetForm();
          fetchConfigs();
        }
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    }
  };

  const handleEdit = (config: DeliveryFeeConfig) => {
    setEditingConfig(config);
    setFormData({
      min_distance_km: config.min_distance_km,
      max_distance_km: config.max_distance_km,
      fee: config.fee,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعداد؟")) return;

    try {
      const { error } = await deliveryApi.deleteDeliveryFeeConfig(id);
      if (error) {
        toast.error("فشل حذف الإعداد");
      } else {
        toast.success("تم حذف الإعداد بنجاح");
        fetchConfigs();
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    }
  };

  const toggleActive = async (config: DeliveryFeeConfig) => {
    try {
      const { error } = await deliveryApi.updateDeliveryFeeConfig(config.id, {
        is_active: !config.is_active,
      });
      if (error) {
        toast.error("فشل تحديث الحالة");
      } else {
        toast.success("تم تحديث الحالة بنجاح");
        fetchConfigs();
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      min_distance_km: 0,
      max_distance_km: 0,
      fee: 0,
    });
  };

  // Calculate the maximum delivery distance from active configs
  const maxDeliveryDistance = configs
    .filter((c) => c.is_active)
    .reduce((max, c) => Math.max(max, c.max_distance_km), 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إعدادات رسوم التوصيل
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة رسوم التوصيل حسب المسافة
          </p>
        </div>
        <button
          onClick={() => {
            setEditingConfig(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          إضافة نطاق جديد
        </button>
      </div>

      {/* Max Delivery Distance Info */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
              أقصى مسافة توصيل حالياً
            </h3>
            <p className="text-blue-600 dark:text-blue-400 mt-1">
              {maxDeliveryDistance > 0
                ? `${maxDeliveryDistance} كم (يتم حسابها تلقائياً من أعلى نطاق نشط)`
                : "غير محدد (لا توجد نطاقات نشطة)"}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
              💡 أقصى مسافة توصيل تُحدد تلقائياً من أعلى قيمة &quot;إلى&quot; في
              النطاقات النشطة
            </p>
          </div>
        </div>
      </div>

      {/* Configs Table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#15203c] border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                من (كم)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                إلى (كم)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                الرسوم (ج.م)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {configs.map((config) => (
              <tr
                key={config.id}
                className="hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {config.min_distance_km} كم
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {config.max_distance_km} كم
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {config.fee} ج.م
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(config)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      config.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {config.is_active ? "نشط" : "غير نشط"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0c1427] rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingConfig ? "تعديل نطاق الرسوم" : "إضافة نطاق جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  من (كم)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.min_distance_km}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_distance_km: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  إلى (كم)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.max_distance_km}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_distance_km: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الرسوم (ج.م)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fee: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  {editingConfig ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
