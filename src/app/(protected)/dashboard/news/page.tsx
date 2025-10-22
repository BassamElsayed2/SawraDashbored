"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, getProducts } from "@/services/apiProducts";
import { getCategories } from "@/services/apiCategories";
import toast from "react-hot-toast";

const ProductListTable: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { isPending, data } = useQuery({
    queryKey: [
      "products",
      currentPage,
      selectedCategory,
      debouncedSearchQuery,
      dateFilter,
    ],
    queryFn: () =>
      getProducts(currentPage, pageSize, {
        categoryId: selectedCategory,
        search: debouncedSearchQuery,
        date: dateFilter,
      }),
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const [categoriesMap, setCategoriesMap] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        const categories = await getCategories();
        // نبني خريطة id => category name
        const map: Record<string, string> = {};
        categories.forEach((cat) => {
          if (cat.id) {
            map[cat.id.toString()] = cat.name_ar;
          }
        });
        setCategoriesMap(map);
      } catch {
        // Error fetching categories
      }
    }

    fetchCategories();
  }, []);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("تم حذف المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف المنتج");
    },
  });

  const endIndex = Math.min(currentPage * pageSize, total);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, dateFilter]);

  // Helper function to get price range for a product
  const getPriceRange = (product: {
    types?: Array<{ sizes?: Array<{ price: number }> }>;
  }) => {
    if (!product.types || product.types.length === 0) {
      return "غير محدد";
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    product.types.forEach((type) => {
      if (type.sizes && type.sizes.length > 0) {
        type.sizes.forEach((size) => {
          if (size.price < minPrice) minPrice = size.price;
          if (size.price > maxPrice) maxPrice = size.price;
        });
      }
    });

    if (minPrice === Infinity || maxPrice === -Infinity) {
      return "غير محدد";
    }

    if (minPrice === maxPrice) {
      return `${minPrice}$`;
    }

    return `${minPrice}$ - ${maxPrice}$`;
  };

  // Helper function to get types count
  const getTypesCount = (product: { types?: Array<unknown> }) => {
    if (!product.types) return 0;
    return product.types.length;
  };

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h3 className="!mb-0 text-lg font-semibold text-gray-800 dark:text-white">قائمة المنتجات</h3>

        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-600 text-gray-600 dark:text-gray-300"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              الرئيسية
            </Link>
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0 text-gray-500 dark:text-gray-400">
            المنتجات
          </li>
        </ol>
      </div>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md border border-gray-100 dark:border-[#172036]">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
          <div className="trezo-card-subtitle mt-[15px] sm:mt-0">
            <Link
              href="/dashboard/news/create-news/"
              className="inline-block transition-all rounded-md font-medium px-[15px] py-[8px] text-sm text-white bg-primary-500 hover:bg-primary-600"
            >
              <span className="inline-block relative ltr:pl-[20px] rtl:pr-[20px]">
                <i className="material-symbols-outlined !text-[20px] absolute ltr:-left-[2px] rtl:-right-[2px] top-1/2 -translate-y-1/2">
                  add
                </i>
                أضف منتج جديد
              </span>
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 hover:border-primary-300 focus:border-primary-500 transition-all rounded-md outline-none dark:border-[#172036] dark:hover:border-primary-600 dark:focus:border-primary-500 dark:bg-[#0c1427] dark:text-white"
            />
            <i className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 !text-[18px]">
              search
            </i>
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 hover:border-primary-300 focus:border-primary-500 transition-all rounded-md outline-none dark:border-[#172036] dark:hover:border-primary-600 dark:focus:border-primary-500 dark:bg-[#0c1427] dark:text-white cursor-pointer"
          >
            <option value="">كل التواريخ</option>
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 hover:border-primary-300 focus:border-primary-500 transition-all rounded-md outline-none dark:border-[#172036] dark:hover:border-primary-600 dark:focus:border-primary-500 dark:bg-[#0c1427] dark:text-white cursor-pointer"
          >
            <option value="">جميع التصنيفات</option>
            {Object.entries(categoriesMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="trezo-card-content">
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead className="text-gray-800 dark:text-white">
                <tr>
                  {[
                    "المنتج",
                    "تاريخ الانشاء",
                    "التصنيف",
                    "الأنواع",
                    "نطاق السعر",
                    "الاجرائات",
                  ].map((header) => (
                    <th
                      key={header}
                      className="font-medium text-sm ltr:text-left rtl:text-right px-[20px] py-[12px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-gray-700 dark:text-gray-200">
                {products?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      لا توجد منتجات متاحة
                    </td>
                  </tr>
                ) : (
                  products?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex items-center text-gray-800 dark:text-white">
                          <div className="relative w-[40px] h-[40px] rounded-md overflow-hidden">
                            <Image
                              className="rounded-md object-cover w-full h-full"
                              alt="product-image"
                              src={item?.image_url || "/placeholder.png"}
                              width={40}
                              height={40}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.png";
                              }}
                            />
                          </div>
                          <span className="block text-sm font-medium ltr:ml-[12px] rtl:mr-[12px]">
                            {item.title_ar.length > 30
                              ? item.title_ar.slice(0, 30) + "..."
                              : item.title_ar}
                          </span>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(item.created_at as string).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {categoriesMap[item.category_id] || "غير معروف"}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                          {getTypesCount(item)} نوع
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {getPriceRange(item)}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex items-center gap-[8px]">
                          <Link
                            href={`/dashboard/news/${item.id}`}
                            className="text-gray-500 hover:text-primary-500 leading-none transition-colors"
                            type="button"
                          >
                            <i className="material-symbols-outlined !text-[20px]">
                              edit
                            </i>
                          </Link>

                          <button
                          onClick={() =>
                            toast(
                              (t) => (
                                <span>
                                  هل أنت متأكد أنك تريد حذف هذا المنتج؟
                                  <div className="mt-2 flex gap-2">
                                    <button
                                      onClick={() => {
                                        mutate(item.id as string);
                                        toast.dismiss(t.id);
                                      }}
                                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                      نعم
                                    </button>
                                    <button
                                      onClick={() => toast.dismiss(t.id)}
                                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </span>
                              ),
                              { duration: 6000 }
                            )
                          }
                          className="text-red-500 hover:text-red-600"
                          >
                          <i className="material-symbols-outlined !text-[20px] font-normal">
                          delete
                          </i>
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-[#172036]">
              {/* Results Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <i className="material-symbols-outlined !text-lg text-primary-500">
                  info
                </i>
                <span>
                  عرض <span className="font-semibold text-primary-600 dark:text-primary-400">{endIndex}</span> من <span className="font-semibold text-primary-600 dark:text-primary-400">{total}</span> منتج
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0c1427] border border-gray-300 dark:border-[#172036] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#15203c] hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                >
                  <i className="material-symbols-outlined !text-base">
                    chevron_right
                  </i>
                  السابق
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNumber = i + 1;
                    const isCurrentPage = currentPage === pageNumber;
                    const isNearCurrentPage = Math.abs(pageNumber - currentPage) <= 2;
                    const isFirstPage = pageNumber === 1;
                    const isLastPage = pageNumber === totalPages;
                    
                    // Show page number if it's current page, near current page, first page, or last page
                    if (isCurrentPage || isNearCurrentPage || isFirstPage || isLastPage) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isCurrentPage
                              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
                              : "text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0c1427] border border-gray-300 dark:border-[#172036] hover:bg-gray-50 dark:hover:bg-[#15203c] hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                      // Show ellipsis for gaps
                      return (
                        <span key={pageNumber} className="px-2 text-gray-400 dark:text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0c1427] border border-gray-300 dark:border-[#172036] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#15203c] hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                >
                  التالي
                  <i className="material-symbols-outlined !text-base">
                    chevron_left
                  </i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListTable;
