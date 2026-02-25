import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentUser, updateCurrentUser } from "@/api/userAPI";
import { uploadAvatar } from "@/api/uploadAPI";
import { toast } from "sonner";
import Header from "@/components/Header.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export const User = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    avatarUrl: "",
    dateOfBirth: "",
  });
  const [localPreview, setLocalPreview] = useState(null);
  const fileInputRef = useRef(null);
  const prevObjectUrlRef = useRef(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const [street, setStreet] = useState("");

  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const json = await res.json();
      setProvinces(json || []);
      return json || [];
    } catch (err) {
      console.error("Failed to load provinces", err);
      setProvinces([]);
      return [];
    }
  };

  const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      return [];
    }
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const json = await res.json();
      const list = (json && json.districts) || [];
      setDistricts(list);
      return list;
    } catch (err) {
      console.error("Failed to load districts", err);
      setDistricts([]);
      return [];
    }
  };
  useEffect(() => {
    const init = async () => {
      try {
        const provs = await fetchProvinces();

        const res = await getCurrentUser();
        const data = res?.data?.data || res?.data || res;
        if (data) {
          const addr = data.address || "";
          const parts = addr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const streetPart = parts.length > 0 ? parts[0] : "";
          const provinceName =
            parts.length > 0 ? parts[parts.length - 1] : data.city || "";
          const prov = provs.find(
            (p) =>
              p.name &&
              p.name.toLowerCase() === (provinceName || "").toLowerCase()
          );

          let cityName = data.city || "";
          if (prov) {
            setSelectedProvinceCode(prov.code);
            cityName = prov.name;
            const dists = await fetchDistricts(prov.code);
            const districtName =
              parts.length > 1 ? parts[parts.length - 2] : "";
            const dist = dists.find(
              (d) =>
                d.name &&
                d.name.toLowerCase() === (districtName || "").toLowerCase()
            );
            if (dist) {
              setSelectedDistrictCode(dist.code);
              const wardsList = await fetchWards(dist.code);
              const wardName = parts.length > 2 ? parts[parts.length - 3] : "";
              const wardObj = wardsList.find(
                (w) =>
                  w.name &&
                  w.name.toLowerCase() === (wardName || "").toLowerCase()
              );
              if (wardObj) {
                setSelectedWardCode(wardObj.code);
              }
            }
          }

          setProfile({
            username: data.username || "",
            email: data.email || "",
            fullName: data.fullName || "",
            phone: data.phone || "",
            address: data.address || "",
            city: cityName || "",
            country: data.country || "",
            postalCode: data.postalCode || "",
            avatarUrl: data.avatarUrl || "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth : "",
          });
          setStreet(streetPart);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      try {
        if (prevObjectUrlRef.current) {
          URL.revokeObjectURL(prevObjectUrlRef.current);
          prevObjectUrlRef.current = null;
        }
      } catch (err) {
        // ignore
      }
    };
  }, []);
  // generic profile field updater
  const handleChange = (e) => {
    const name = e?.target?.name;
    const value = e?.target?.value;
    if (!name) return;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  const fetchWards = async (districtCode) => {
    if (!districtCode) return setWards([]);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const json = await res.json();
      const list = (json && json.wards) || [];
      setWards(list);
      return list;
    } catch (err) {
      console.error("Failed to load wards", err);
      setWards([]);
      return [];
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        postalCode: profile.postalCode,
        avatarUrl: profile.avatarUrl,
        dateOfBirth: profile.dateOfBirth || null,
      };
      const res = await updateCurrentUser(payload);
      const data = res?.data?.data || res?.data || res;
      toast.success("Cập nhật thông tin thành công");
      setProfile({
        username: data.username || "",
        email: data.email || "",
        fullName: data.fullName || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        postalCode: data.postalCode || "",
        avatarUrl: data.avatarUrl || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth : "",
      });
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            phone: data.phone || null,
            address: data.address || null,
            city: data.city || null,
            country: data.country || null,
            postalCode: data.postalCode || null,
            avatarUrl: data.avatarUrl || null,
            dateOfBirth: data.dateOfBirth || null,
          })
        );
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: data }));
      } catch (e) {
        console.warn("Failed to persist updated user:", e);
      }
    } catch (err) {
      console.error("Update profile error", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumb items={[{ label: "Hồ sơ", isCurrent: true }]} />
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Hồ sơ của tôi</h1>
              <p className="text-sm text-muted-foreground">
                Xem và chỉnh sửa thông tin tài khoản
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column: avatar & quick actions */}
            <div className="col-span-1 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
              {localPreview || profile.avatarUrl ? (
                <img
                  src={localPreview || profile.avatarUrl}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-white shadow-sm">
                  {profile.fullName
                    ? profile.fullName.charAt(0).toUpperCase()
                    : profile.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <h3 className="mt-4 font-medium text-lg text-gray-900">
                {profile.fullName || profile.username}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>

              {profile.phone && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.phone}
                </p>
              )}
              {(profile.address || profile.city || profile.country) && (
                <p className="text-sm text-muted-foreground text-center mt-1 px-4">
                  {[profile.address, profile.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              {/* Responsive Buttons: Stack on mobile, Row on tablet/desktop if space permits */}
              <div className="mt-6 w-full flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => (window.location.href = "/change-password")}
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn đăng xuất?")) {
                      localStorage.removeItem("accessToken");
                      localStorage.removeItem("refreshToken");
                      window.location.href = "/login";
                    }
                  }}
                >
                  Đăng xuất
                </Button>
              </div>

              {/* Styled file chooser for avatar */}
              <div className="mt-4 w-full flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    try {
                      if (prevObjectUrlRef.current) {
                        URL.revokeObjectURL(prevObjectUrlRef.current);
                        prevObjectUrlRef.current = null;
                      }
                    } catch (err) {
                      /* ignore */
                    }

                    let objectUrl = null;
                    try {
                      objectUrl = URL.createObjectURL(f);
                      prevObjectUrlRef.current = objectUrl;
                      setLocalPreview(objectUrl);
                    } catch (err) {
                      console.warn("preview error", err);
                    }

                    try {
                      const resp = await uploadAvatar(f);
                      const url =
                        resp?.url ||
                        (resp?.fileNames &&
                          `/images/avatars/${resp.fileNames[0]}`);
                      if (url) {
                        setProfile((p) => ({ ...p, avatarUrl: url }));
                        toast.success("Upload ảnh đại diện thành công");
                      } else {
                        toast.error("Không nhận được URL ảnh từ server");
                      }
                    } catch (err) {
                      console.error("Upload avatar failed", err);
                      toast.error("Upload ảnh thất bại");
                    }
                  }}
                />

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current && fileInputRef.current.click()
                    }
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Thay đổi ảnh đại diện
                  </button>
                  <span className="text-xs text-muted-foreground text-center">
                    Tối đa 5MB. Định dạng: JPG/PNG/WEBP
                  </span>
                </div>
              </div>
            </div>

            {/* Right column: editable form */}
            <div className="col-span-1 md:col-span-2">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tên đăng nhập
                      </label>
                      <Input
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Họ và tên
                      </label>
                      <Input
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <Input
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Picker Component */}
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !profile.dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            {profile.dateOfBirth ? (
                              format(
                                new Date(profile.dateOfBirth),
                                "dd/MM/yyyy"
                              )
                            ) : (
                              <span>Chọn ngày sinh</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              profile.dateOfBirth
                                ? new Date(profile.dateOfBirth)
                                : undefined
                            }
                            onSelect={(date) => {
                              setProfile((prev) => ({
                                ...prev,
                                dateOfBirth: date
                                  ? format(date, "yyyy-MM-dd")
                                  : "",
                              }));
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quốc gia
                      </label>
                      <Input
                        name="country"
                        value={profile.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Địa chỉ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Tỉnh/Thành */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tỉnh/Thành
                        </label>
                        <Select
                          value={
                            selectedProvinceCode
                              ? String(selectedProvinceCode)
                              : ""
                          }
                          onValueChange={async (value) => {
                            const code = value;
                            setSelectedProvinceCode(code);
                            setSelectedDistrictCode("");
                            setSelectedWardCode("");
                            setDistricts([]);
                            setWards([]);
                            if (code) {
                              await fetchDistricts(code);
                              const prov = provinces.find(
                                (p) => String(p.code) === String(code)
                              );
                              setProfile((p) => ({
                                ...p,
                                city: prov?.name || p.city,
                                country: "Việt Nam",
                              }));
                            }
                            const provinceObj = provinces.find(
                              (p) => String(p.code) === String(code)
                            );
                            const composed = [street, provinceObj?.name]
                              .filter(Boolean)
                              .join(", ");
                            setProfile((p) => ({ ...p, address: composed }));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn Tỉnh/Thành" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((prov) => (
                              <SelectItem
                                key={prov.code}
                                value={String(prov.code)}
                              >
                                {prov.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quận/Huyện */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Quận/Huyện
                        </label>
                        <Select
                          disabled={districts.length === 0}
                          value={
                            selectedDistrictCode
                              ? String(selectedDistrictCode)
                              : ""
                          }
                          onValueChange={async (value) => {
                            const code = value;
                            setSelectedDistrictCode(code);
                            setSelectedWardCode("");
                            setWards([]);
                            if (code) {
                              await fetchWards(code);
                              const dist = districts.find(
                                (d) => String(d.code) === String(code)
                              );
                              const provinceObj = provinces.find(
                                (p) =>
                                  String(p.code) ===
                                  String(selectedProvinceCode)
                              );
                              const composed = [
                                street,
                                dist?.name,
                                provinceObj?.name,
                              ]
                                .filter(Boolean)
                                .join(", ");
                              setProfile((p) => ({ ...p, address: composed }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn Quận/Huyện" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d.code} value={String(d.code)}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Phường/Xã */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Phường/Xã
                        </label>
                        <Select
                          disabled={wards.length === 0}
                          value={
                            selectedWardCode ? String(selectedWardCode) : ""
                          }
                          onValueChange={(value) => {
                            const code = value;
                            setSelectedWardCode(code);
                            const wardObj = wards.find(
                              (w) => String(w.code) === String(code)
                            );
                            const districtObj = districts.find(
                              (d) =>
                                String(d.code) === String(selectedDistrictCode)
                            );
                            const provinceObj = provinces.find(
                              (p) =>
                                String(p.code) === String(selectedProvinceCode)
                            );
                            const composed = [
                              street,
                              wardObj?.name,
                              districtObj?.name,
                              provinceObj?.name,
                            ]
                              .filter(Boolean)
                              .join(", ");
                            setProfile((p) => ({ ...p, address: composed }));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn Phường/Xã" />
                          </SelectTrigger>
                          <SelectContent>
                            {wards.map((w) => (
                              <SelectItem key={w.code} value={String(w.code)}>
                                {w.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Số nhà, tên đường
                      </label>
                      <Input
                        name="street"
                        placeholder="Ví dụ: 12 Nguyễn Văn Bảo"
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                          const wardObj = wards.find(
                            (w) => String(w.code) === String(selectedWardCode)
                          );
                          const districtObj = districts.find(
                            (d) =>
                              String(d.code) === String(selectedDistrictCode)
                          );
                          const provinceObj = provinces.find(
                            (p) =>
                              String(p.code) === String(selectedProvinceCode)
                          );
                          const composed = [
                            e.target.value,
                            wardObj?.name,
                            districtObj?.name,
                            provinceObj?.name,
                          ]
                            .filter(Boolean)
                            .join(", ");
                          setProfile((p) => ({ ...p, address: composed }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
