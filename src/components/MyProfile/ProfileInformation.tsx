"use client";

import React from "react";
import { ProfileTypes } from "./profileType";

interface ProfileIntroProps {
  profile?: ProfileTypes;
}

const ProfileInformation: React.FC<ProfileIntroProps> = ({ profile }) => {
  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">معلومات الملف الشخصي</h5>
          </div>
        </div>
        <div className="trezo-card-content">
          <ul>
            <li className="mb-[12.5px] last:mb-0">
              الاسم الكامل:
              <span className="text-black dark:text-white font-medium">
                {"  "}
                {profile?.full_name}
              </span>
            </li>
            <li className="mb-[12.5px] last:mb-0">
              البريد الإلكتروني:
              <span className="text-black dark:text-white font-medium">
                {"  "}
                {profile?.email}
              </span>
            </li>

            <li className="mb-[12.5px] last:mb-0">
              تاريخ الانضمام:
              <span className="text-black dark:text-white font-medium">
                {"  "}
                {profile?.joined_at
                  ? new Date(profile.joined_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}{" "}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ProfileInformation;
