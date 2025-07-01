"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";

import { getNews } from "../../services/apiNews";

const RecentProperty: React.FC = () => {
  const { data: news } = useQuery({
    queryKey: ["news"],
    queryFn: () => getNews(),
  });

  if (news?.news.length === 0) return <div>لا يوجد معارض</div>;

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[15px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">الأخبار الأخيرة</h5>
          </div>
        </div>

        <div className="trezo-card-content" id="recentPropertiesSlides">
          <Swiper
            slidesPerView={1}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: true,
            }}
            modules={[Autoplay, Pagination]}
          >
            {news?.news.slice(0, 3).map((news) => (
              <SwiperSlide key={news.id}>
                <div
                  className="rounded-[5px] h-[112px] bg-cover bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url(${news.images?.[0]})`,
                  }}
                ></div>

                <div className="flex items-center justify-between mb-[8px] mt-[15px]">
                  <h3 className="!text-lg !mb-0 !text-orange-500">
                    <Link href={`/dashboard/images-gallery`}>
                      {news.title_ar}
                    </Link>
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default RecentProperty;
