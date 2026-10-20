'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Plus, PlusCircle, Trash2, X } from 'lucide-react';
import ImagePlaceholder from '@/app/shared/components/image-placeholder';
import EnhanceImageModal from '@/app/shared/components/enhance-image-modal';
import Input from '@packages/components/input';
import RichTextEditor from '@packages/rich-text-editor';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

interface DiscountCode {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

const selectClass =
  'w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none cursor-pointer';

interface Uploaded {
  fileId: string;
  fileUrl: string;
}

const labelClass = 'block mb-2 text-sm font-medium text-gray-200';

const CreateProductPage = () => {
  const router = useRouter();
  const [images, setImages] = useState<(Uploaded | null)[]>([null]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [tags, setTags] = useState('');
  const [warranty, setWarranty] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [cashOnDelivery, setCashOnDelivery] = useState('yes');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState('');

  const [openImageModel, setOpenImageModel] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isUploadDone, setIsUploadDone] = useState(false);

  const [availableColors, setAvailableColors] = useState<string[]>([
    '#ffffff',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
  ]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState('#ffffff');

  const [specifications, setSpecifications] = useState<
    { name: string; value: string }[]
  >([{ name: '', value: '' }]);

  const [customProperties, setCustomProperties] = useState<
    { label: string; values: string[] }[]
  >([]);
  const [newPropertyLabel, setNewPropertyLabel] = useState('');
  const [propertyValueInputs, setPropertyValueInputs] = useState<{
    [key: number]: string;
  }>({});

  const { data, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/get-categories');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: allDiscountCodes = [], isLoading } = useQuery<DiscountCode[]>({
    queryKey: ['shop-discount-codes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/get-discount-codes');
      return response.data?.discount_codes || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const categories = data?.categories || [];
  const subCategories = data?.subCategories || {};

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    try {
      setUploadingIndex(index);
      setIsUploadDone(false);
      const fileName = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        '/product/upload-product-image',
        { fileName },
      );
      const updatedImages = [...images];

      const uploadedImage: Uploaded = {
        fileId: response.data?.fileId || response.data?.fileName || '',
        fileUrl: response.data?.file_url || '',
      };

      updatedImages[index] = uploadedImage;
      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setIsUploadDone(true);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleImageRemove = async (index: number) => {
    try {
      const updatedImages = [...images];

      const imageToDelete = updatedImages[index];
      if (
        imageToDelete &&
        typeof imageToDelete === 'object' &&
        'fileId' in imageToDelete
      ) {
        await axiosInstance.delete('/product/delete-product-image', {
          data: { fileId: imageToDelete.fileId },
        });
      }

      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const handleApplyEnhancement = (newUrl: string) => {
    if (selectedImageIndex !== null && images[selectedImageIndex]) {
      const updated = [...images];
      updated[selectedImageIndex] = {
        ...updated[selectedImageIndex]!,
        fileUrl: newUrl,
      };
      setImages(updated);
    }
    setOpenImageModel(false);
    setSelectedImage(null);
    setSelectedImageIndex(null);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const addCustomColor = () => {
    if (!availableColors.includes(pickerColor)) {
      setAvailableColors([...availableColors, pickerColor]);
    }
    if (!selectedColors.includes(pickerColor)) {
      setSelectedColors([...selectedColors, pickerColor]);
    }
    setShowColorPicker(false);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { name: '', value: '' }]);
  };

  const updateSpecification = (
    index: number,
    field: 'name' | 'value',
    value: string,
  ) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length === 1) {
      setSpecifications([{ name: '', value: '' }]);
      return;
    }
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const addCustomProperty = () => {
    if (!newPropertyLabel.trim()) return;
    setCustomProperties([
      ...customProperties,
      { label: newPropertyLabel.trim(), values: [] },
    ]);
    setNewPropertyLabel('');
  };

  const removeCustomProperty = (index: number) => {
    const updated = [...customProperties];
    updated.splice(index, 1);
    setCustomProperties(updated);
  };

  const addPropertyValue = (propIndex: number) => {
    const val = propertyValueInputs[propIndex]?.trim();
    if (!val) return;
    const updated = [...customProperties];
    if (!updated[propIndex].values.includes(val)) {
      updated[propIndex].values.push(val);
      setCustomProperties(updated);
    }
    setPropertyValueInputs({ ...propertyValueInputs, [propIndex]: '' });
  };

  const removePropertyValue = (propIndex: number, valIndex: number) => {
    const updated = [...customProperties];
    updated[propIndex].values.splice(valIndex, 1);
    setCustomProperties(updated);
  };

  const buildPayload = (status: 'Active' | 'Draft' = 'Active') => ({
    title,
    description,
    detailedDescription,
    tags,
    warranty,
    slug,
    brand,
    cashOnDelivery,
    category,
    subCategory,
    videoUrl,
    regularPrice,
    salePrice,
    stock,
    sizes: selectedSizes,
    discountCode,
    colors: selectedColors,
    specifications: specifications.filter((s) => s.name || s.value),
    customProperties,
    images: images.filter((img) => img !== null),
    status,
  });

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim() || !slug.trim()) {
      setFormError('Title and slug are required to save draft');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post(
        '/product/create-product',
        buildPayload('Draft'),
      );
      setFormSuccess('Draft saved successfully!');
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || 'Failed to save draft. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (
      !title.trim() ||
      !description.trim() ||
      !detailedDescription.trim() ||
      !tags.trim() ||
      !warranty.trim() ||
      !slug.trim() ||
      !category ||
      !subCategory ||
      salePrice === '' ||
      stock === ''
    ) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post(
        '/product/create-product',
        buildPayload('Active'),
      );
      setFormSuccess('Product created successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          'Failed to create product. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-2 text-white font-poppins">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
          Create Product
        </h1>
        <div className="flex items-center text-xs text-gray-400 gap-1.5">
          <Link href="/dashboard" className="text-[#80deea] hover:underline">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-300">Create Product</span>
        </div>
      </div>

      <form className="w-full pb-16">
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-sm">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm">
            {formSuccess}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-6 w-full items-start">
          {/* ── Column 1: Images ── */}
          <div className="w-full">
            <ImagePlaceholder
              size="765 x 850"
              small={false}
              index={0}
              defaultImage={images[0]?.fileUrl || null}
              isUploading={uploadingIndex === 0}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              onEdit={(idx) => {
                setSelectedImage(images[idx]?.fileUrl || null);
                setSelectedImageIndex(idx);
                setOpenImageModel(true);
              }}
            />
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {images.slice(1).map((img, index) => {
                  const actualIndex = index + 1;
                  return (
                    <ImagePlaceholder
                      key={actualIndex}
                      size="765 x 850"
                      small={true}
                      index={actualIndex}
                      defaultImage={img?.fileUrl || null}
                      isUploading={uploadingIndex === actualIndex}
                      onImageChange={handleImageChange}
                      onImageRemove={handleImageRemove}
                      onEdit={(idx) => {
                        setSelectedImage(images[idx]?.fileUrl || null);
                        setSelectedImageIndex(idx);
                        setOpenImageModel(true);
                      }}
                    />
                  );
                })}
              </div>
            )}
            {uploadingIndex !== null && (
              <p className="text-xs text-blue-400 mt-2 text-center">
                Uploading image, please wait...
              </p>
            )}
            {isUploadDone && uploadingIndex === null && (
              <p className="text-xs text-emerald-400 mt-2 text-center">
                Image uploaded successfully!
              </p>
            )}
          </div>

          {/* ── Column 2: Basic Info ── */}
          <div className="space-y-5 min-w-0">
            <Input
              label="Product Title *"
              placeholder="Enter product title"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              required
            />

            <Input
              type="textarea"
              label="Short Description * (Max 150 words)"
              placeholder="Enter product description for quick view"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <Input
              label="Tags *"
              placeholder="apple,flagship"
              value={tags}
              onChange={(e: any) => setTags(e.target.value)}
              required
            />

            <Input
              label="Warranty *"
              placeholder="1 Year / No Warranty"
              value={warranty}
              onChange={(e: any) => setWarranty(e.target.value)}
              required
            />

            <Input
              label="Slug *"
              placeholder="product_slug"
              value={slug}
              onChange={(e: any) => setSlug(e.target.value)}
              required
            />

            <Input
              label="Brand"
              placeholder="Apple"
              value={brand}
              onChange={(e: any) => setBrand(e.target.value)}
            />

            {/* Colors */}
            <div>
              <label className={labelClass}>Colors</label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {availableColors.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`w-7 h-7 rounded-md transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'border-white scale-110 shadow-md ring-2 ring-blue-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-7 h-7 rounded-full bg-[#182334] border border-[#2b3a55] text-gray-300 flex items-center justify-center hover:bg-[#203047] transition-colors cursor-pointer"
                  title="Add custom color"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {showColorPicker && (
                <div className="flex items-center gap-2.5 mt-3">
                  <div className="relative w-8 h-8 rounded border border-gray-400 overflow-hidden">
                    <input
                      type="color"
                      value={pickerColor}
                      onChange={(e) => setPickerColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3.5 py-1.5 bg-[#1b263b] hover:bg-[#23324d] text-gray-200 text-xs font-medium rounded border border-[#2a3a55] transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Custom Specifications */}
            <div className="pt-2">
              <label className={`${labelClass} mb-2`}>
                Custom Specifications
              </label>
              {specifications.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs text-gray-400 mb-1 px-1">
                  <span>Specification Name</span>
                  <span>Value</span>
                  <span className="w-8" />
                </div>
              )}
              <div className="space-y-2.5">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="e.g., Battery Life"
                      value={spec.name}
                      onChange={(e) =>
                        updateSpecification(index, 'name', e.target.value)
                      }
                      className="w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
                    />
                    <input
                      type="text"
                      placeholder="e.g., 4000mAh"
                      value={spec.value}
                      onChange={(e) =>
                        updateSpecification(index, 'value', e.target.value)
                      }
                      className="w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400 text-xs font-medium cursor-pointer mt-3 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Specification</span>
              </button>
            </div>

            {/* Custom Properties */}
            <div className="pt-2">
              <label className={labelClass}>Custom Properties</label>
              <div className="space-y-3 mb-3">
                {customProperties.map((prop, propIndex) => (
                  <div
                    key={propIndex}
                    className="bg-[#0e121a] border border-[#232b3b] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white">
                        {prop.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomProperty(propIndex)}
                        className="text-red-500 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Enter value..."
                        value={propertyValueInputs[propIndex] || ''}
                        onChange={(e) =>
                          setPropertyValueInputs({
                            ...propertyValueInputs,
                            [propIndex]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPropertyValue(propIndex);
                          }
                        }}
                        className="flex-1 bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => addPropertyValue(propIndex)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {prop.values.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {prop.values.map((val, valIndex) => (
                          <span
                            key={valIndex}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#18202d] border border-[#28364b] text-xs text-gray-200"
                          >
                            <span>{val}</span>
                            <button
                              type="button"
                              onClick={() =>
                                removePropertyValue(propIndex, valIndex)
                              }
                              className="text-gray-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter property label (e.g., Material)"
                  value={newPropertyLabel}
                  onChange={(e) => setNewPropertyLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomProperty();
                    }
                  }}
                  className="flex-1 bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg px-3.5 py-2.5 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={addCustomProperty}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div>
              <label className={labelClass}>Cash on Delivery *</label>
              <select
                value={cashOnDelivery}
                onChange={(e) => setCashOnDelivery(e.target.value)}
                className={selectClass}
              >
                <option value="yes" className="bg-[#11141a]">
                  Yes
                </option>
                <option value="no" className="bg-[#11141a]">
                  No
                </option>
              </select>
            </div>
          </div>

          {/* ── Column 3: Category, Description, Pricing ── */}
          <div className="space-y-5 min-w-0">
            {/* Category */}
            <div>
              <label className={labelClass}>Category *</label>
              {isError ? (
                <p className="text-red-400 text-xs mb-2">
                  Failed to load categories
                </p>
              ) : null}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory('');
                }}
                className={selectClass}
              >
                <option value="" className="bg-[#11141a] text-gray-500">
                  Select Category
                </option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat} className="bg-[#11141a]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className={labelClass}>Subcategory *</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className={selectClass}
                disabled={!category}
              >
                <option value="" className="bg-[#11141a] text-gray-500">
                  Select Subcategory
                </option>
                {(subCategories[category] || []).map((sub: string) => (
                  <option key={sub} value={sub} className="bg-[#11141a]">
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Description — Rich Text Editor */}
            <RichTextEditor
              label="Detailed Description * (Min 100 words)"
              value={detailedDescription}
              onChange={setDetailedDescription}
              placeholder="Write a detailed product description here..."
            />

            {/* Video URL */}
            <Input
              label="Video URL"
              placeholder="https://www.youtube.com/embed/xyz123"
              value={videoUrl}
              onChange={(e: any) => setVideoUrl(e.target.value)}
            />

            {/* Regular Price */}
            <Input
              label="Regular Price"
              placeholder="20$"
              value={regularPrice}
              onChange={(e: any) => setRegularPrice(e.target.value)}
            />

            {/* Sale Price */}
            <Input
              label="Sale Price *"
              placeholder="15$"
              value={salePrice}
              onChange={(e: any) => setSalePrice(e.target.value)}
              required
            />

            {/* Stock */}
            <Input
              label="Stock *"
              placeholder="100"
              value={stock}
              onChange={(e: any) => setStock(e.target.value)}
              required
            />

            {/* Sizes */}
            <div>
              <label className={labelClass}>Sizes</label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#11141a] border-[#2b3342] text-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Codes */}
            <div>
              <label className={labelClass}>
                Select Discount Codes (optional)
              </label>
              <select
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className={selectClass}
                disabled={isLoading}
              >
                <option value="" className="bg-[#11141a] text-gray-500">
                  {isLoading
                    ? 'Loading discount codes...'
                    : 'Select discount code'}
                </option>
                {allDiscountCodes.map((code: DiscountCode) => (
                  <option
                    key={code.id}
                    value={code.discountCode}
                    className="bg-[#11141a]"
                  >
                    {code.public_name} ({code.discountCode} -{' '}
                    {code.discountValue}
                    {code.discountType?.toLowerCase() === 'percentage'
                      ? '%'
                      : '$'}
                    )
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#1a2235] hover:bg-[#1e2a42] disabled:opacity-50 border border-[#2b3a55] text-gray-200 font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Create</span>
                )}
              </button>
            </div>
          </div>
          <EnhanceImageModal
            isOpen={openImageModel}
            onClose={() => {
              setOpenImageModel(false);
              setSelectedImage(null);
              setSelectedImageIndex(null);
            }}
            imageUrl={selectedImage}
            onApply={handleApplyEnhancement}
            setSelectedImage={setSelectedImage}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
