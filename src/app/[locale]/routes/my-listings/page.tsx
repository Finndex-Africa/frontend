"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

import { propertiesApi, buySellApi } from "@/services/api";
import { Property as ApiProperty } from "@/types/dashboard";
import type { BuySellListing } from "@/types/buy-sell";
import Image from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import { MIN_PROPERTY_LISTING_IMAGES } from "@/lib/property-images";
import { showToast } from "@/lib/toast";
import { useErrorMessage } from "@/lib/error-messages";
import { trackListingEdited, trackListingUnpublished } from "@/lib/analytics";
import { geocodeAddress } from "@/lib/google-maps";
import { isAgentLikeUserType } from "@/lib/agent-user-types";
import { getUserDisplayName } from "@/lib/display-name";

import { Link, useRouter } from "@/i18n/navigation";
import CurrencySelect from "@/components/ui/CurrencySelect";
import { CURRENCY_META, DEFAULT_CURRENCY, isCurrency, type Currency } from "@/lib/currency/config";
import { useMoney } from "@/lib/currency/CurrencyProvider";
function getBedroomDisplay(p: ApiProperty): string {
  const n = p.bedrooms ?? p.rooms;
  return n != null ? `${n} Bedroom${n !== 1 ? "s" : ""}` : "Not specified";
}
function getBedShortDisplay(p: ApiProperty): string {
  const n = p.bedrooms ?? p.rooms;
  return n != null ? `${n} bed${n !== 1 ? "s" : ""}` : "Not specified";
}

function getPropertyTypeLabel(p: ApiProperty): string {
  return (p.propertyType || p.type || "").trim() || "—";
}

function getStatusLabel(status: string): string {
  if (status === "pending") return "Under Review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Amenity rows from API (objects with label, optional icon); skips empty arrays / invalid items. */
function getAmenityRowsFromApi(
  property: ApiProperty,
): { icon: string; label: string; description?: string | null }[] {
  const rows: { icon: string; label: string; description?: string | null }[] =
    [];
  const raw: unknown = property.amenities;
  if (!Array.isArray(raw)) return rows;
  for (const a of raw) {
    if (a == null) continue;
    if (Array.isArray(a)) continue;
    if (typeof a === "string") {
      const label = a.trim();
      if (label) rows.push({ icon: "🏷️", label });
      continue;
    }
    if (typeof a === "object") {
      const o = a as Record<string, unknown>;
      const labelRaw = o.label ?? o.name ?? o.title ?? o.amenity ?? o.value;
      const label = typeof labelRaw === "string" ? labelRaw.trim() : "";
      if (!label) continue;
      const iconRaw = o.icon;
      const icon =
        typeof iconRaw === "string" && iconRaw.trim() && iconRaw !== "•"
          ? iconRaw.trim()
          : "🏷️";
      const description =
        o.description != null &&
        typeof o.description === "string" &&
        o.description.trim()
          ? o.description.trim()
          : null;
      rows.push({ icon, label, description });
    }
  }
  return rows;
}

// Property edit modal component
function EditPropertyModal({
  property,
  isOpen,
  onClose,
  onSave,
  canSetAgentFee,
}: {
  property: ApiProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ApiProperty>) => Promise<void>;
  canSetAgentFee?: boolean;
}) {
  const t_hints = useTranslations("hints");
  const errorMessage = useErrorMessage();
  const t = useTranslations("myListings");
  const [formData, setFormData] = useState<Partial<ApiProperty>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    setFormError(null);
  }, [property]);

  useEffect(() => {
    if (property) {
      // Format dates for input fields (YYYY-MM-DD format)
      const formatDate = (date: any) => {
        if (!date) return "";
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) return "";

          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch (e) {
          console.error("Date formatting error:", e);
          return "";
        }
      };

      const formattedAvailableFrom = formatDate(property.availableFrom);
      const formattedAvailableTo = formatDate(property.availableTo);

      console.log("Property data:", property);
      console.log("Property type field:", property.type);
      console.log("Property propertyType field:", property.propertyType);
      console.log("Formatted dates:", {
        availableFrom: property.availableFrom,
        availableTo: property.availableTo,
        formattedFrom: formattedAvailableFrom,
        formattedTo: formattedAvailableTo,
      });

      setFormData({
        title: property.title || "",
        description: property.description || "",
        location: property.location || "",
        price: property.price || 0,
        currency: isCurrency(property.currency)
          ? property.currency
          : DEFAULT_CURRENCY,
        propertyType: property.propertyType || property.type || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || 0,
        furnished: property.furnished || false,
        availableFrom: formattedAvailableFrom,
        availableTo: formattedAvailableTo,
        agentFee: property.agentFee,
      });
      setImages(property.images || []);
      setNewImageFiles([]);
      setImagePreviews([]);
    }
  }, [property]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type: inputType } = e.target;
    const val =
      inputType === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : inputType === "number"
          ? value === ""
            ? undefined
            : Number(value)
          : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + newImageFiles.length + files.length;

    if (totalImages > 10) {
      showToast.warning(t("maxImages"));
      return;
    }

    setNewImageFiles((prev) => [...prev, ...files]);

    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const listingImageTotal = images.length + newImageFiles.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (listingImageTotal < MIN_PROPERTY_LISTING_IMAGES) {
      showToast.error(
        `Please add at least ${MIN_PROPERTY_LISTING_IMAGES} images before saving your listing.`,
      );
      return;
    }

    if (formData.bedrooms === undefined || formData.bedrooms === null) {
      showToast.error(t("bedroomsRequired"));
      return;
    }

    if (formData.bathrooms === undefined || formData.bathrooms === null) {
      showToast.error(t("bathroomsRequired"));
      return;
    }

    if (canSetAgentFee && (formData.agentFee === undefined || formData.agentFee === null)) {
      showToast.error(t("agentFeeRequired"));
      return;
    }

    setLoading(true);
    try {
      // Upload new images if any
      let finalImages = [...images];
      if (newImageFiles.length > 0) {
        // Import mediaApi for image upload
        const { mediaApi } = await import("@/services/api/media.api");

        const uploadedResponses = await Promise.all(
          newImageFiles.map((file) => mediaApi.upload(file, "properties")),
        );
        const uploadedUrls = uploadedResponses.map((response) => response.url);
        finalImages = [...finalImages, ...uploadedUrls];
      }

      // Prepare data for submission - map field names to backend expectations
      // IMPORTANT: Always include these required fields:
      // title, description, location, price, propertyType, furnished
      const submitData: Record<string, any> = {
        title: formData.title || "",
        description: formData.description || "",
        location: formData.location || "",
        price: formData.price ? Number(formData.price) : 0,
        propertyType: formData.propertyType || "",
        furnished:
          formData.furnished === undefined ? false : formData.furnished, // Always include furnished
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
      };

      // Add optional fields if they have values
      if (formData.area) {
        submitData.area = Number(formData.area);
      }
      if (formData.availableFrom) {
        submitData.availableFrom = new Date(
          formData.availableFrom,
        ).toISOString();
      }
      if (formData.availableTo) {
        submitData.availableTo = new Date(formData.availableTo).toISOString();
      }
      if (canSetAgentFee && formData.agentFee != null) {
        submitData.agentFee = Number(formData.agentFee);
      }
      const mapCoordinates = await geocodeAddress(formData.location || "");
      if (mapCoordinates) {
        submitData.mapCoordinates = mapCoordinates;
      }
      submitData.images = finalImages;

      console.log("Submitting data:", submitData);
      setFormError(null);
      await onSave(submitData);
      onClose();
    } catch (error: any) {
      console.error("Failed to save property:", error);
      const msg = errorMessage(error, "saveProperty");
      setFormError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center rounded-t-2xl flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">{t("editProperty")}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form - Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto flex-1"
          onFocus={() => formError && setFormError(null)}
        >
          {formError && (
            <div className="mb-2 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-0.5">Unable to save property</p>
                <p className="text-sm text-red-700">{formError}</p>
              </div>
              <button type="button" onClick={() => setFormError(null)} className="text-red-400 hover:text-red-600 p-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {/* Image Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("propertyImages")}
            </label>
            <p className="text-xs text-gray-600 mb-4">
              Upload at least {MIN_PROPERTY_LISTING_IMAGES} images (required), up to 10 total (Max 10MB each)
            </p>
            {listingImageTotal < MIN_PROPERTY_LISTING_IMAGES ? (
              <p className="text-xs text-amber-700 mb-4">
                Add{" "}
                {MIN_PROPERTY_LISTING_IMAGES - listingImageTotal}{" "}
                more
                {" "}
                {MIN_PROPERTY_LISTING_IMAGES - listingImageTotal === 1 ? "image" : "images"} before you can save.
              </p>
            ) : null}

            <div className="grid grid-cols-3 gap-4">
              {/* Existing Images */}
              {images.map((img, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={img}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                        {t("primary")}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* New Image Previews */}
              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-400">
                    <Image
                      src={preview}
                      alt={`New image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                      New
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Image Button */}
              {images.length + newImageFiles.length < 10 && (
                <label className="relative h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">
                    {t("addImages")}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {10 - images.length - newImageFiles.length} left
                  </span>
                </label>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Title & Location */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("titleField")}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("titlePlaceholder")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("location")}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("locationPlaceholder")}
                required
              />
            </div>
          </div>

          {/* Price & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("price")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
                <CurrencySelect
                  className="py-2"
                  value={(formData.currency as Currency) ?? DEFAULT_CURRENCY}
                  onChange={(currency) =>
                    setFormData((prev) => ({ ...prev, currency }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("propertyType")}
              </label>
              <select
                name="propertyType"
                value={formData.propertyType || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Office Space">Office Space</option>
              </select>
            </div>
          </div>

          {canSetAgentFee && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{t("agentFee")}</h3>
              <p className="text-xs text-gray-600 mb-3">
                {t("agentFeeHelp")}
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Agent Fee ({CURRENCY_META[formData.currency as Currency] ?.label ?? DEFAULT_CURRENCY}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center max-w-xs">
                <span className="text-gray-500 mr-2">
                  {CURRENCY_META[(formData.currency as Currency) ?? DEFAULT_CURRENCY].symbol}
                </span>
                <input
                  type="number"
                  name="agentFee"
                  value={formData.agentFee ?? ""}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          )}

          {/* Bedrooms & Bathrooms & Area */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms ?? ""}
                onChange={handleChange}
                required
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t_hints("e_g_3")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms ?? ""}
                onChange={handleChange}
                required
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t_hints("e_g_2")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("minutesFromRoad")}
              </label>
              <input
                type="number"
                name="area"
                value={formData.area || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Furnished Checkbox */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              name="furnished"
              checked={formData.furnished || false}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="ml-3 text-sm font-semibold text-gray-700">
              {t("isFurnished")}
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("description")}
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          {/* Available Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("availableFrom")}
              </label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("availableTo")}
              </label>
              <input
                type="date"
                name="availableTo"
                value={formData.availableTo || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-100 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              listingImageTotal < MIN_PROPERTY_LISTING_IMAGES ||
              formData.bedrooms === undefined ||
              formData.bedrooms === null ||
              formData.bathrooms === undefined ||
              formData.bathrooms === null
            }
            className="flex-1 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? newImageFiles.length > 0
                ? "Uploading images..."
                : "Saving changes..."
              : t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Property detail modal component
function PropertyModal({
  property,
  isOpen,
  onClose,
}: {
  property: ApiProperty | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Owner-facing view: shows the figure the owner actually set, in their own
  // currency, rather than converting into whatever the switcher is on. Matches
  // how my-services treats provider-owned prices.
  const money = useMoney();

  const t = useTranslations("myListings");
  if (!isOpen || !property) return null;

  const amenityRows = getAmenityRowsFromApi(property);

  const imageUrls = (() => {
    const raw = property.images;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
    }
    return [];
  })();

  const rejectionReason =
    typeof property.rejectionReason === "string"
      ? property.rejectionReason.trim()
      : "";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header — fixed; only the body below scrolls */}
        <div className="shrink-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 pr-4 line-clamp-2">
            {property.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {property.status === "rejected" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-1">
                {t("rejectionReason")}
              </p>
              <p className="text-sm text-red-900 leading-relaxed">
                {rejectionReason ||
                  "No rejection reason was provided. Please contact support for details."}
              </p>
            </div>
          )}
          {/* Property photos */}
          {imageUrls.length > 0 ? (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">
                Photos ({imageUrls.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imageUrls.map((src, i) => (
                  <a
                    key={`${src}-${i}`}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200 hover:ring-blue-400 transition-shadow"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Space URLs; avoid Image domain config gaps */}
                    <img
                      src={src}
                      alt={`${property.title} — photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
              <p className="text-sm text-gray-600">No photos attached to this listing.</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {t("location")}
              </label>
              <p className="text-gray-900 font-medium">{property.location}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {t("price")}
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {money.format(property.price, (property.currency as Currency) ?? DEFAULT_CURRENCY)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Type
              </label>
              <p className="text-gray-900 font-medium">
                {getPropertyTypeLabel(property)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {t("status")}
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  property.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : property.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : property.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>
          </div>

          {/* Amenities from API */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">
              {t("amenities")}
            </label>
            {amenityRows.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                {t("noAmenities")}
              </p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {amenityRows.map((row, idx) => (
                  <li
                    key={`${row.label}-${idx}`}
                    className="flex items-start gap-2 text-gray-800 text-sm rounded-lg bg-gray-50 px-3 py-2 border border-gray-100"
                  >
                    <span className="text-lg leading-none shrink-0" aria-hidden>
                      {row.icon}
                    </span>
                    <span>
                      <span className="font-medium">{row.label}</span>
                      {row.description ? (
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {row.description}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Structural fields (not the amenities array) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">
              {t("details")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center text-gray-700 text-sm">
                <span className="font-semibold mr-2" aria-hidden>
                  🛏️
                </span>
                {getBedroomDisplay(property)}
              </div>
              {property.bathrooms != null && property.bathrooms > 0 ? (
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="font-semibold mr-2" aria-hidden>
                    🚿
                  </span>
                  {property.bathrooms} Bathroom
                  {property.bathrooms > 1 ? "s" : ""}
                </div>
              ) : null}
              {property.area != null ? (
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="font-semibold mr-2" aria-hidden>
                    🚗
                  </span>
                  {property.area} min from main road
                </div>
              ) : null}
              {property.furnished !== undefined ? (
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="font-semibold mr-2" aria-hidden>
                    🪑
                  </span>
                  {property.furnished ? "Furnished" : "Unfurnished"}
                </div>
              ) : null}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                {t("description")}
              </label>
              <p className="text-gray-700 text-sm leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Availability */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {property.availableFrom && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {t("availableFrom")}
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(property.availableFrom).toLocaleDateString()}
                </p>
              </div>
            )}
            {property.availableTo && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {t("availableTo")}
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(property.availableTo).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Buy & Sell listing card (used inside the B&S tab) ────────────────────

function BuySellListingCard({
  listing,
  onDelete,
  onUnpublish,
  onRepublish,
  onView,
}: {
  listing: BuySellListing;
  onDelete: (id: string) => void;
  onUnpublish: (id: string) => void;
  onRepublish: (id: string) => void;
  onView: (listing: BuySellListing) => void;
}) {
  const money = useMoney();
  const t = useTranslations("myListings");
  const firstImage = listing.images?.[0];
  const categoryLabel =
    listing.category === "land" ? "Land" :
    listing.category === "house" ? "House" : "Item";

  const categoryColor =
    listing.category === "land" ? "bg-green-100 text-green-700" :
    listing.category === "house" ? "bg-blue-100 text-blue-700" :
    "bg-orange-100 text-orange-700";

  const subtitle =
    listing.category === "land" && listing.landSize != null && listing.unit
      ? `${listing.landSize} ${listing.unit.replace("_", " ")}`
      : listing.category === "house" && listing.bedrooms != null && listing.bathrooms != null
        ? `${listing.bedrooms} bed · ${listing.bathrooms} bath`
        : listing.category === "household_item" && listing.condition
          ? listing.condition === "fairly_used" ? "Fairly Used" : "New"
          : null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
  };

  const statusLabel = (s: string) =>
    s === "pending" ? "Under Review" : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {firstImage ? (
          <SafeImage src={firstImage} alt={listing.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">
            {listing.category === "land" ? "🏞️" : listing.category === "house" ? "🏠" : "📦"}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${categoryColor}`}>{categoryLabel}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${statusColors[listing.status] ?? "bg-gray-100 text-gray-700"}`}>
            {statusLabel(listing.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 min-h-[3rem] mb-1">{listing.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-1 mb-1">📍 {listing.location}</p>
        {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
        <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-gray-100">
          <span className="text-xl font-bold text-gray-900">
            {money.format(listing.price, (listing.currency as Currency) ?? DEFAULT_CURRENCY)}
          </span>
        </div>

        {/* Rejection reason */}
        {listing.status === "rejected" && listing.rejectionReason && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-800 mb-0.5">Rejection Reason</p>
            <p className="text-xs text-red-700">{listing.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onView(listing)}
              className="flex-1 text-center px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              View
            </button>
            <Link
              href={`/routes/buy-and-sell/${listing._id}/edit`}
              className="flex-1 text-center px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(listing._id)}
              className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              {t("delete")}
            </button>
          </div>
          {listing.status === "approved" && (
            <button
              onClick={() => onUnpublish(listing._id)}
              className="w-full px-3 py-2 text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
            >
              {t("unpublish")}
            </button>
          )}
          {listing.status === "suspended" && (
            <button
              onClick={() => onRepublish(listing._id)}
              className="w-full px-3 py-2 text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              {t("republish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function MyListingsPage() {
  const errorMessage = useErrorMessage();
  const t = useTranslations("myListings");
  const router = useRouter();
  const money = useMoney();

  // ── Main tab ──────────────────────────────────────────────────────────────
  type MainTab = "rentals" | "buy_sell";
  const [mainTab, setMainTab] = useState<MainTab>("rentals");
  const [canSeeRentals, setCanSeeRentals] = useState(false);

  // ── Rentals state ─────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<ApiProperty | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedEditProperty, setSelectedEditProperty] =
    useState<ApiProperty | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [canSetAgentFee, setCanSetAgentFee] = useState(false);
  const [unpublishConfirm, setUnpublishConfirm] = useState<ApiProperty | null>(
    null,
  );

  // ── Buy & Sell state ──────────────────────────────────────────────────────
  const [buySellListings, setBuySellListings] = useState<BuySellListing[]>([]);
  const [buySellLoading, setBuySellLoading] = useState(false);
  const [buySellStatusFilter, setBuySellStatusFilter] = useState<string>("all");
  const [buySellDeleteConfirm, setBuySellDeleteConfirm] = useState<BuySellListing | null>(null);
  const [buySellUnpublishConfirm, setBuySellUnpublishConfirm] = useState<BuySellListing | null>(null);
  const [buySellViewListing, setBuySellViewListing] = useState<BuySellListing | null>(null);

  const fetchBuySellListings = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) setBuySellLoading(true);
      const res = await buySellApi.getMine();
      setBuySellListings(res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch buy & sell listings:", err);
    } finally {
      setBuySellLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auth guard — all logged-in users can access this page
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      router.push("/routes/login");
      return;
    }

    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        const userType = userData.userType || userData.role || "";

        // Service providers manage their work via /routes/my-services
        if (userType === "service_provider" || userType === "provider") {
          router.push("/routes/my-services");
          return;
        }

        const isPropertyUser =
          userType === "agent" ||
          userType === "real_estate_agency" ||
          userType === "landlord" ||
          userType === "home_seeker" ||
          userType === "seeker";
        setCanSeeRentals(isPropertyUser);
        // Agents/landlords default to rentals; seekers default to buy_sell
        const defaultsToRentals = userType === "agent" || userType === "real_estate_agency" || userType === "landlord";
        setMainTab(defaultsToRentals ? "rentals" : "buy_sell");
        setCanSetAgentFee(isAgentLikeUserType(userType));
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }

    fetchProperties();
    fetchBuySellListings();
  }, [router, fetchBuySellListings]);

  const fetchProperties = async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) setIsLoading(true);
      setError(null);
      const response = await propertiesApi.getMyProperties();
      setProperties(response.data || []);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError(
        errorMessage(
          err,
          "Failed to load your listings. Please try again later.",
        ),
      );
      setProperties([]);
    } finally {
      if (!options?.silent) setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredProperties =
    statusFilter === "all"
      ? properties
      : properties.filter((p) => p.status === statusFilter);

  const handleView = (property: ApiProperty) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleEdit = (property: ApiProperty) => {
    setSelectedEditProperty(property);
    setShowEditModal(true);
  };

  const handleSaveProperty = async (submitData: Record<string, any>) => {
    if (!selectedEditProperty?._id) return;

    try {
      // Remove images if they're base64 (not uploaded to server yet)
      // Only send images if they're different from the original
      if (submitData.images && submitData.images.length > 0) {
        const hasBase64 = submitData.images.some((img: string) =>
          img.startsWith("data:"),
        );
        if (hasBase64) {
          console.warn(
            "Cannot save base64 images directly. Images must be uploaded via file upload.",
          );
          // Remove base64 images from submission for now
          delete submitData.images;
        }
      }

      console.log("Final submit data:", submitData);

      // Call API to update property
      const response = await propertiesApi.update(
        selectedEditProperty._id,
        submitData,
      );
      console.log("Update response:", response);

      await fetchProperties({ silent: true });

      trackListingEdited({ id: selectedEditProperty._id, type: "property" });
      setShowEditModal(false);
      setSelectedEditProperty(null);
      showToast.success(t("updateSuccess"));
    } catch (err: any) {
      console.error("Failed to update property:", err);
      showToast.error(
        errorMessage(err, "saveProperty"),
      );
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishConfirm) return;

    try {
      await propertiesApi.unpublish(unpublishConfirm._id);

      // Update local state
      setProperties(
        properties.map((p) =>
          p._id === unpublishConfirm._id ? { ...p, status: "suspended" } : p,
        ),
      );

      trackListingUnpublished({ id: unpublishConfirm._id, type: "property" });
      setUnpublishConfirm(null);
      // Show success notification with custom styled div
      showCustomNotification(
        "success",
        "Property Unpublished",
        "Your property has been successfully unpublished and removed from public listings.",
      );
    } catch (err: any) {
      console.error("Failed to unpublish property:", err);
      showCustomNotification(
        "error",
        "Unpublish Failed",
        errorMessage(
          err,
          "Failed to unpublish property. Please try again.",
        ),
      );
    }
  };

  const handleRepublish = async (propertyId: string) => {
    try {
      const updatedProperty = await propertiesApi.republish(propertyId);

      // Update local state
      setProperties(
        properties.map((p) =>
          p._id === propertyId ? { ...p, status: "approved" } : p,
        ),
      );

      showCustomNotification(
        "success",
        "Property Republished",
        "Your property is now visible to the public again.",
      );
    } catch (err: any) {
      console.error("Failed to republish property:", err);
      showCustomNotification(
        "error",
        "Republish Failed",
        errorMessage(
          err,
          "Failed to republish property. Please try again.",
        ),
      );
    }
  };

  // ── Buy & Sell handlers ────────────────────────────────────────────────────

  const handleBuySellDelete = async (id: string) => {
    try {
      await buySellApi.delete(id);
      setBuySellListings(prev => prev.filter(l => l._id !== id));
      setBuySellDeleteConfirm(null);
      showToast.success(t("deleted"));
    } catch (err) {
      showToast.error(errorMessage(err, "deleteListing"));
    }
  };

  const handleBuySellUnpublish = (id: string) => {
    const listing = buySellListings.find(l => l._id === id) ?? null;
    setBuySellUnpublishConfirm(listing);
  };

  const confirmBuySellUnpublish = async () => {
    if (!buySellUnpublishConfirm) return;
    const id = buySellUnpublishConfirm._id;
    try {
      await buySellApi.unpublish(id);
      setBuySellListings(prev => prev.map(l => l._id === id ? { ...l, status: "suspended" } : l));
      setBuySellUnpublishConfirm(null);
      showToast.success(t("unpublished"));
    } catch (err) {
      showToast.error(errorMessage(err, "unpublishListing"));
    }
  };

  const handleBuySellRepublish = async (id: string) => {
    try {
      await buySellApi.republish(id);
      setBuySellListings(prev => prev.map(l => l._id === id ? { ...l, status: "pending" } : l));
      showToast.success(t("resubmitted"));
    } catch (err) {
      showToast.error(errorMessage(err, "republishListing"));
    }
  };

  // ── Buy & Sell computed values ─────────────────────────────────────────────

  const filteredBuySell =
    buySellStatusFilter === "all"
      ? buySellListings
      : buySellListings.filter(l => l.status === buySellStatusFilter);

  const buySellStats = {
    total: buySellListings.length,
    approved: buySellListings.filter(l => l.status === "approved").length,
    pending: buySellListings.filter(l => l.status === "pending").length,
    rejected: buySellListings.filter(l => l.status === "rejected").length,
  };

  const showCustomNotification = (
    type: "success" | "error",
    title: string,
    message: string,
  ) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-2xl z-[9999] max-w-md animate-slideInDown ${
      type === "success"
        ? "bg-green-50 border-2 border-green-200"
        : "bg-red-50 border-2 border-red-200"
    }`;
    notification.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    ${
                      type === "success"
                        ? '<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
                        : '<svg class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
                    }
                </div>
                <div class="flex-1">
                    <h3 class="text-sm font-semibold ${type === "success" ? "text-green-900" : "text-red-900"}">${title}</h3>
                    <p class="text-sm mt-1 ${type === "success" ? "text-green-800" : "text-red-800"}">${message}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.remove()">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
            </div>
        `;
    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.classList.add("animate-slideOutUp");
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: properties.length,
    approved: properties.filter((p) => p.status === "approved").length,
    pending: properties.filter((p) => p.status === "pending").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
              <p className="text-lg text-gray-600">{t("subtitle")}</p>
            </div>
            {/* Contextual CTA button */}
            {mainTab === "rentals" ? (
              <button
                onClick={() => router.push("/routes/property/new")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("addRentalListing")}
              </button>
            ) : (
              <Link
                href="/routes/buy-and-sell/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("postAListing")}
              </Link>
            )}
          </div>

          {/* Main tab switcher */}
          <div className="flex gap-1 bg-gray-200 p-1 rounded-xl w-fit mb-8">
            {canSeeRentals && (
              <button
                onClick={() => setMainTab("rentals")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mainTab === "rentals"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t("rentals")}
              </button>
            )}
            <button
              onClick={() => setMainTab("buy_sell")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mainTab === "buy_sell"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("buyAndSell")}
            </button>
          </div>

          {/* ── Rentals stats ─────────────────────────────────────────── */}
          {mainTab === "rentals" && canSeeRentals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("totalProperties")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("live")}</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("pendingReview")}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("rejected")}
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          )} {/* end rentals stats */}

          {/* ── Buy & Sell stats ──────────────────────────────────────── */}
          {mainTab === "buy_sell" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{buySellStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Live</p>
                  <p className="text-3xl font-bold text-green-600">{buySellStats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{buySellStats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{buySellStats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          )} {/* end buy & sell stats */}
        </div>

        {/* ── Rentals tab content ─────────────────────────────────────────── */}
        {mainTab === "rentals" && canSeeRentals && (<>

        {error && (
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-2 flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected", "archived"].map(
            (status) => {
              const count =
                status === "all"
                  ? properties.length
                  : properties.filter((p) => p.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 sm:px-5 py-2.5 font-semibold text-sm rounded-lg whitespace-nowrap transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      statusFilter === status
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {statusFilter === "all"
                  ? "No listings yet"
                  : `No ${statusFilter} listings`}
              </h3>
              <p className="text-gray-600 mb-8">
                {statusFilter === "all"
                  ? "Start building your property portfolio by creating your first listing"
                  : `You don't have any ${statusFilter} properties at the moment`}
              </p>
              {statusFilter === "all" && (
                <button
                  onClick={() => router.push("/routes/property/new")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {t("createFirstListing")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Status Badge - Floating */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${getStatusColor(property.status)}`}
                    >
                      {getStatusLabel(property.status)}
                    </span>
                  </div>
                  {/* Image count badge */}
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {property.images.length}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {property.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="line-clamp-1">{property.location}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-base mr-1.5">🛏️</span>
                      <span className="font-medium">
                        {getBedShortDisplay(property)}
                      </span>
                    </div>
                    {property.bathrooms && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="text-base mr-1.5">🚿</span>
                        <span className="font-medium">
                          {property.bathrooms} bath
                          {property.bathrooms > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="text-base mr-1.5">🚗</span>
                        <span className="font-medium">
                          {property.area} min from main road
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {money.format(property.price, (property.currency as Currency) ?? DEFAULT_CURRENCY)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        /month
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleView(property)}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
                      >
                        {t("viewDetails")}
                      </button>
                      <button
                        onClick={() => handleEdit(property)}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                      >
                        Edit
                      </button>
                    </div>
                    {property.status === "approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnpublishConfirm(property);
                        }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                        {t("unpublish")}
                      </button>
                    )}
                    {property.status === "suspended" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRepublish(property._id);
                        }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {t("republish")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        </>)} {/* end rentals tab */}

        {/* ── Buy & Sell tab content ──────────────────────────────────────── */}
        {mainTab === "buy_sell" && (
          <>
            {/* Status filter tabs */}
            <div className="mb-8 bg-white rounded-xl shadow-md p-2 flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected", "suspended"].map(status => {
                const count =
                  status === "all"
                    ? buySellListings.length
                    : buySellListings.filter(l => l.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setBuySellStatusFilter(status)}
                    className={`px-4 sm:px-5 py-2.5 font-semibold text-sm rounded-lg whitespace-nowrap transition-all duration-200 ${
                      buySellStatusFilter === status
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      buySellStatusFilter === status ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            {buySellLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : filteredBuySell.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {buySellStatusFilter === "all" ? "No listings yet" : `No ${buySellStatusFilter} listings`}
                </h3>
                <p className="text-gray-600 mb-8">
                  {buySellStatusFilter === "all"
                    ? "Start by posting your first Buy & Sell listing."
                    : t("noFilteredListings", { status: buySellStatusFilter })}
                </p>
                {buySellStatusFilter === "all" && (
                  <Link
                    href="/routes/buy-and-sell/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t("postFirstListing")}
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuySell.map(listing => (
                  <BuySellListingCard
                    key={listing._id}
                    listing={listing}
                    onDelete={id => setBuySellDeleteConfirm(buySellListings.find(l => l._id === id) ?? null)}
                    onUnpublish={handleBuySellUnpublish}
                    onRepublish={handleBuySellRepublish}
                    onView={setBuySellViewListing}
                  />
                ))}
              </div>
            )}
          </>
        )} {/* end buy & sell tab */}

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        property={selectedEditProperty}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProperty}
        canSetAgentFee={canSetAgentFee}
      />

      {/* Unpublish Confirmation Modal */}
      {unpublishConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              {t("unpublishPropertyQ")}
            </h3>
            <p className="text-gray-600 mb-2 text-center font-medium">
              {unpublishConfirm.title}
            </p>
            <p className="text-gray-500 mb-8 text-center text-sm">
              {t("unpublishBody")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setUnpublishConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border-2 border-gray-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleUnpublish}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3.5 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                {t("unpublish")}
              </button>
            </div>
            </div>
          </div>
        )}

      {/* Buy & Sell View Modal */}
      {buySellViewListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Image */}
            {buySellViewListing.images?.[0] && (
              <div className="relative h-52 overflow-hidden rounded-t-2xl">
                <SafeImage src={buySellViewListing.images[0]} alt={buySellViewListing.title} fill className="object-cover" />
                <button
                  onClick={() => setBuySellViewListing(null)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  buySellViewListing.category === "land" ? "bg-green-100 text-green-700" :
                  buySellViewListing.category === "house" ? "bg-blue-100 text-blue-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {buySellViewListing.category === "land" ? "Land" : buySellViewListing.category === "house" ? "House" : "Household Item"}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  buySellViewListing.status === "approved" ? "bg-green-100 text-green-700" :
                  buySellViewListing.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  buySellViewListing.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {buySellViewListing.status === "pending" ? "Under Review" : buySellViewListing.status.charAt(0).toUpperCase() + buySellViewListing.status.slice(1)}
                </span>
                {buySellViewListing.isPremium && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">⭐ Premium</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{buySellViewListing.title}</h3>
              <p className="text-sm text-gray-500 mb-3">📍 {buySellViewListing.location}</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                {money.format(buySellViewListing.price, (buySellViewListing.currency as Currency) ?? DEFAULT_CURRENCY)}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {buySellViewListing.category === "land" && buySellViewListing.landSize != null && buySellViewListing.unit && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs"><span className="font-semibold text-gray-700">Size</span><br />{buySellViewListing.landSize} {buySellViewListing.unit.replace("_", " ")}</div>
                )}
                {buySellViewListing.ownershipStatus && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs"><span className="font-semibold text-gray-700">Ownership</span><br />{buySellViewListing.ownershipStatus}</div>
                )}
                {buySellViewListing.bedrooms != null && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs"><span className="font-semibold text-gray-700">Bedrooms</span><br />{buySellViewListing.bedrooms}</div>
                )}
                {buySellViewListing.bathrooms != null && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs"><span className="font-semibold text-gray-700">Bathrooms</span><br />{buySellViewListing.bathrooms}</div>
                )}
                {buySellViewListing.condition && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs"><span className="font-semibold text-gray-700">Condition</span><br />{buySellViewListing.condition === "fairly_used" ? "Fairly Used" : "New"}</div>
                )}
                {buySellViewListing.deliveryAvailable != null && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs"><span className="font-semibold text-gray-700">Delivery</span><br />{buySellViewListing.deliveryAvailable ? "Available" : "Pickup only"}</div>
                )}
              </div>

              {buySellViewListing.description && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">{buySellViewListing.description}</p>
              )}

              {/* Rejection reason */}
              {buySellViewListing.status === "rejected" && buySellViewListing.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-800 mb-0.5">Rejection Reason</p>
                  <p className="text-xs text-red-700">{buySellViewListing.rejectionReason}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setBuySellViewListing(null)}
                  className="flex-1 h-11 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  {t("close")}
                </button>
                <Link
                  href={`/routes/buy-and-sell/${buySellViewListing._id}`}
                  className="flex-1 h-11 flex items-center justify-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  {t("viewFullPage")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy & Sell unpublish confirmation modal */}
      {buySellUnpublishConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              {t("unpublishListingQ")}
            </h3>
            <p className="text-gray-600 mb-2 text-center font-medium">
              {buySellUnpublishConfirm.title}
            </p>
            <p className="text-gray-500 mb-8 text-center text-sm">
              This will remove the listing from public view. You can republish it later from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setBuySellUnpublishConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border-2 border-gray-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmBuySellUnpublish}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3.5 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                {t("unpublish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy & Sell delete confirmation modal */}
      {buySellDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">🗑️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{t("deleteListingQ")}</h3>
            <p className="text-gray-600 mb-2 text-center font-medium">{buySellDeleteConfirm.title}</p>
            <p className="text-gray-500 mb-8 text-center text-sm">
              {t("deleteBody")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setBuySellDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 font-semibold border-2 border-gray-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleBuySellDelete(buySellDeleteConfirm._id)}
                className="flex-1 bg-red-600 text-white px-6 py-3.5 rounded-xl hover:bg-red-700 font-semibold shadow-lg"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
