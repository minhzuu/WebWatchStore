import { useState, useEffect } from "react";
import { getGeneralSettings, updateGeneralSettings } from "@/api/settingsAPI";
import {
  uploadLogo,
  deleteLogo,
  uploadPaymentMethodImages,
  deletePaymentMethodImage,
  uploadSocialMediaImages,
  deleteSocialMediaImage,
} from "@/api/uploadAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  SaveIcon,
  Loader2,
  Upload,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Copyright,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "",
    logo: "",
    slogan: "",
    address: "",
    copyright: "",
    email: "",
    hotline: "",
    paymentMethods: "[]",
    socialMedia: "[]",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]); // [{name, imageUrl, url, file?, preview?}]

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getGeneralSettings();
      setSettings(data);

      // Parse payment methods
      try {
        const methods = JSON.parse(data.paymentMethods || "[]");
        setPaymentMethods(methods);
      } catch (e) {
        console.error("Failed to parse payment methods:", e);
        setPaymentMethods([]);
      }

      // Parse social media
      try {
        const social = JSON.parse(data.socialMedia || "[]");
        setSocialMedia(social);
      } catch (e) {
        console.error("Failed to parse social media:", e);
        setSocialMedia([]);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File không được vượt quá 5MB");
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setSelectedLogo({ file, preview });
    toast.success("Đã chọn logo (sẽ upload khi Save)");
  };

  const handleRemoveLogo = () => {
    if (selectedLogo?.preview) {
      URL.revokeObjectURL(selectedLogo.preview);
    }
    setSelectedLogo(null);
    // Clear logo from settings to delete it
    setSettings((prev) => ({ ...prev, logo: "" }));
    toast.success("Logo sẽ bị xóa khi Save");
  };

  // Payment Methods handlers
  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { name: "", imageUrl: "" }]);
  };

  const removePaymentMethod = (index) => {
    const method = paymentMethods[index];
    if (method.preview) {
      URL.revokeObjectURL(method.preview);
    }
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const updatePaymentMethodName = (index, name) => {
    const updated = [...paymentMethods];
    updated[index] = { ...updated[index], name };
    setPaymentMethods(updated);
  };

  const handlePaymentMethodImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    const updated = [...paymentMethods];
    updated[index] = { ...updated[index], file, preview };
    setPaymentMethods(updated);
    toast.success("Đã chọn ảnh (upload khi Save)");
  };

  // Social Media handlers
  const addSocialMedia = () => {
    setSocialMedia([...socialMedia, { name: "", imageUrl: "", url: "" }]);
  };

  const removeSocialMedia = (index) => {
    const social = socialMedia[index];
    if (social.preview) {
      URL.revokeObjectURL(social.preview);
    }
    setSocialMedia(socialMedia.filter((_, i) => i !== index));
  };

  const updateSocialMediaField = (index, field, value) => {
    const updated = [...socialMedia];
    updated[index] = { ...updated[index], [field]: value };
    setSocialMedia(updated);
  };

  const handleSocialMediaImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    const updated = [...socialMedia];
    updated[index] = { ...updated[index], file, preview };
    setSocialMedia(updated);
    toast.success("Đã chọn ảnh (upload khi Save)");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);

    try {
      let finalLogoUrl = settings.logo;

      // Handle logo changes
      if (selectedLogo?.file) {
        // Delete old logo from Cloudinary if exists
        if (settings.logo) {
          try {
            await deleteLogo(settings.logo);
            console.log("✅ Deleted old logo:", settings.logo);
          } catch (err) {
            console.error("⚠️ Error deleting old logo:", err);
          }
        }

        // Upload new logo to settings/logos folder
        const result = await uploadLogo([selectedLogo.file]);
        if (result.success && result.fileNames.length > 0) {
          finalLogoUrl = result.fileNames[0];
        }
      } else if (!settings.logo) {
        // User removed logo without uploading a new one
        finalLogoUrl = "";

        // Delete old logo from Cloudinary if it was there before
        const originalSettings = await getGeneralSettings();
        if (originalSettings.logo) {
          try {
            await deleteLogo(originalSettings.logo);
            console.log("✅ Deleted logo from Cloudinary");
          } catch (err) {
            console.error("⚠️ Error deleting logo:", err);
          }
        }
      }

      // Handle payment methods images
      const finalPaymentMethods = [];
      for (let i = 0; i < paymentMethods.length; i++) {
        const method = paymentMethods[i];
        let imageUrl = method.imageUrl;

        // Upload new image if selected
        if (method.file) {
          // Delete old image if exists
          if (method.imageUrl) {
            try {
              await deletePaymentMethodImage(method.imageUrl);
              console.log("✅ Deleted old payment method image");
            } catch (err) {
              console.error("⚠️ Error deleting old payment image:", err);
            }
          }

          // Upload new image to settings/payment-methods folder
          const result = await uploadPaymentMethodImages([method.file]);
          if (result.success && result.fileNames.length > 0) {
            imageUrl = result.fileNames[0];
          }
        }

        finalPaymentMethods.push({
          name: method.name,
          imageUrl: imageUrl,
        });
      }

      // Handle social media images
      const finalSocialMedia = [];
      for (let i = 0; i < socialMedia.length; i++) {
        const social = socialMedia[i];
        let imageUrl = social.imageUrl;

        // Upload new image if selected
        if (social.file) {
          // Delete old image if exists
          if (social.imageUrl) {
            try {
              await deleteSocialMediaImage(social.imageUrl);
              console.log("✅ Deleted old social media image");
            } catch (err) {
              console.error("⚠️ Error deleting old social image:", err);
            }
          }

          // Upload new image
          const result = await uploadSocialMediaImages([social.file]);
          if (result.success && result.fileNames.length > 0) {
            imageUrl = result.fileNames[0];
          }
        }

        finalSocialMedia.push({
          name: social.name,
          imageUrl: imageUrl,
          url: social.url,
        });
      }

      // Save settings
      const dataToSave = {
        ...settings,
        logo: finalLogoUrl,
        paymentMethods: JSON.stringify(finalPaymentMethods),
        socialMedia: JSON.stringify(finalSocialMedia),
      };
      await updateGeneralSettings(dataToSave);

      toast.success("Lưu cài đặt thành công");
      setSelectedLogo(null);
      loadSettings(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Lỗi khi lưu cài đặt");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cài đặt chung
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý thông tin chung của website
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="size-5" />
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="siteName">Tên website *</Label>
              <Input
                id="siteName"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                placeholder="Watch Store"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slogan">Slogan</Label>
              <Input
                id="slogan"
                name="slogan"
                value={settings.slogan}
                onChange={handleChange}
                placeholder="Đồng hồ chính hãng - Uy tín hàng đầu"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Logo</Label>
              <div className="mt-2 space-y-3">
                {/* Current or Preview Logo */}
                {(selectedLogo?.preview || settings.logo) && (
                  <div className="relative inline-block">
                    <img
                      src={selectedLogo?.preview || settings.logo}
                      alt="Logo"
                      className="h-24 w-auto object-contain border rounded-lg bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                    <Upload className="size-4" />
                    <span className="text-sm font-medium">
                      {selectedLogo || settings.logo
                        ? "Thay đổi logo"
                        : "Upload logo"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG tối đa 5MB. Upload khi Save.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Phone className="size-5" />
            Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="contact@watchstore.com"
              />
            </div>

            <div>
              <Label htmlFor="hotline" className="flex items-center gap-2">
                <Phone className="size-4" />
                Hotline
              </Label>
              <Input
                id="hotline"
                name="hotline"
                value={settings.hotline}
                onChange={handleChange}
                placeholder="1900 xxxx"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="size-4" />
                Địa chỉ
              </Label>
              <Textarea
                id="address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mạng xã hội
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialMedia}
            >
              + Thêm mạng xã hội
            </Button>
          </div>

          <div className="space-y-4">
            {socialMedia.map((social, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                {/* Image Upload */}
                <div className="flex-shrink-0">
                  {social.preview || social.imageUrl ? (
                    <div className="relative">
                      <img
                        src={social.preview || social.imageUrl}
                        alt={social.name}
                        className="w-20 h-12 object-contain border rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...socialMedia];
                          if (updated[index].preview) {
                            URL.revokeObjectURL(updated[index].preview);
                          }
                          updated[index] = {
                            ...updated[index],
                            imageUrl: "",
                            file: null,
                            preview: null,
                          };
                          setSocialMedia(updated);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-20 h-12 border-2 border-dashed rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Upload className="size-5 text-gray-400" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleSocialMediaImageUpload(index, e)}
                      />
                    </label>
                  )}
                </div>

                {/* Name & URL Inputs */}
                <div className="flex-1 space-y-2">
                  <Input
                    value={social.name}
                    onChange={(e) =>
                      updateSocialMediaField(index, "name", e.target.value)
                    }
                    placeholder="Tên (VD: Facebook, Instagram, ...)"
                    className="text-sm"
                  />
                  <Input
                    value={social.url}
                    onChange={(e) =>
                      updateSocialMediaField(index, "url", e.target.value)
                    }
                    placeholder="URL (https://...)"
                    className="text-sm"
                  />
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialMedia(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}

            {socialMedia.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có mạng xã hội nào. Nhấn "Thêm mạng xã hội" để bắt đầu.
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Phương thức thanh toán
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPaymentMethod}
            >
              + Thêm phương thức
            </Button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                {/* Image Upload */}
                <div className="flex-shrink-0">
                  {method.preview || method.imageUrl ? (
                    <div className="relative">
                      <img
                        src={method.preview || method.imageUrl}
                        alt={method.name}
                        className="w-20 h-12 object-contain border rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...paymentMethods];
                          if (updated[index].preview) {
                            URL.revokeObjectURL(updated[index].preview);
                          }
                          updated[index] = {
                            ...updated[index],
                            imageUrl: "",
                            file: null,
                            preview: null,
                          };
                          setPaymentMethods(updated);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-20 h-12 border-2 border-dashed rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Upload className="size-5 text-gray-400" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          handlePaymentMethodImageUpload(index, e)
                        }
                      />
                    </label>
                  )}
                </div>

                {/* Name Input */}
                <div className="flex-1">
                  <Input
                    value={method.name}
                    onChange={(e) =>
                      updatePaymentMethodName(index, e.target.value)
                    }
                    placeholder="Tên phương thức (VD: VNPay, MoMo, ...)"
                  />
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePaymentMethod(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}

            {paymentMethods.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có phương thức thanh toán nào. Nhấn "Thêm phương thức" để
                bắt đầu.
              </p>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Copyright className="size-5" />
            Bản quyền
          </h2>

          <div>
            <Label htmlFor="copyright">Copyright text</Label>
            <Textarea
              id="copyright"
              name="copyright"
              value={settings.copyright}
              onChange={handleChange}
              placeholder="© 2025 Watch Store. All rights reserved."
              rows={2}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={saving}
            className="min-w-32  bg-brand-primary"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <SaveIcon className="size-4 mr-2" />
                Lưu cài đặt
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
