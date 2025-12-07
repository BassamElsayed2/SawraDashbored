"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

// Default center - Riyadh, Saudi Arabia
const defaultCenter = {
  lat: 24.7136,
  lng: 46.6753,
};

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng }
      : defaultCenter
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "ar",
  });

  const onMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setSelectedPosition({ lat, lng });
        setMapCenter({ lat, lng });
        onLocationSelect(lat, lng);
      }
    },
    [onLocationSelect]
  );

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setSelectedPosition({ lat, lng });
        setMapCenter({ lat, lng });
        onLocationSelect(lat, lng);
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "فشل في الحصول على موقعك الحالي";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "تم رفض الإذن للوصول إلى الموقع";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "موقعك غير متاح حالياً";
            break;
          case error.TIMEOUT:
            errorMessage = "انتهت مهلة طلب الموقع";
            break;
        }

        alert(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationSelect]);

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
        <div className="text-center">
          <i className="material-symbols-outlined text-4xl text-red-500 mb-2">
            error
          </i>
          <p className="text-red-500 font-medium">فشل في تحميل الخريطة</p>
          <p className="text-sm text-gray-500 mt-1">
            تأكد من إضافة Google Maps API Key
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل الخريطة...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {selectedPosition && <Marker position={selectedPosition} />}
        </GoogleMap>

        {/* زر الموقع الحالي */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loadingLocation}
          className="absolute top-3 right-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="تحديد موقعي الحالي"
        >
          {loadingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          ) : (
            <i className="material-symbols-outlined text-primary-600 dark:text-primary-400 text-xl">
              my_location
            </i>
          )}
        </button>
      </div>

      {selectedPosition && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
          <div className="flex items-start gap-2">
            <i className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">
              location_on
            </i>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                تم اختيار الموقع
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Latitude: {selectedPosition.lat.toFixed(6)}
                <br />
                Longitude: {selectedPosition.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
        <div className="flex items-start gap-2">
          <i className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">
            info
          </i>
          <div className="flex-1">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 اضغط على أي مكان في الخريطة لتحديد موقع الفرع
              <br />
              📍 أو اضغط على زر الموقع الحالي (أعلى اليسار) لتحديد موقعك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapPicker;
