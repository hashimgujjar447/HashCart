'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, PlusCircle, Trash2, X } from 'lucide-react';
import ImagePlaceholder from '@/app/shared/components/image-placeholder';
import Input from '@packages/components/input';

const CreateProductPage = () => {
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [warranty, setWarranty] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [cashOnDelivery, setCashOnDelivery] = useState('yes');
  const [category, setCategory] = useState('');

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

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8 && file) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
  };

  const handleImageRemove = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    if (updatedImages.length === 0) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      title,
      description,
      tags,
      warranty,
      slug,
      brand,
      cashOnDelivery,
      category,
      colors: selectedColors,
      specifications: specifications.filter((s) => s.name || s.value),
      customProperties,
      images: images.filter((img) => img !== null),
    };
    console.log('Submitting Product Data:', productPayload);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 text-white font-poppins">
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

      <form onSubmit={handleSubmit} className="w-full pb-16">
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
          <div className="w-full lg:w-[380px] shrink-0">
            <ImagePlaceholder
              setOpenImageModel={() => {}}
              size="765 x 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
            />

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.slice(1).map((_, index) => (
                  <ImagePlaceholder
                    key={index + 1}
                    setOpenImageModel={() => {}}
                    size="765 x 850"
                    small={true}
                    index={index + 1}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 w-full max-w-2xl space-y-5">
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

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-200">
                Cash on Delivery *
              </label>
              <select
                value={cashOnDelivery}
                onChange={(e) => setCashOnDelivery(e.target.value)}
                className="w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="yes" className="bg-[#11141a] text-white">
                  Yes
                </option>
                <option value="no" className="bg-[#11141a] text-white">
                  No
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-200">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#11141a] text-gray-500">
                  Select Category
                </option>
                <option value="Electronics" className="bg-[#11141a] text-white">
                  Electronics
                </option>
                <option value="Fashion" className="bg-[#11141a] text-white">
                  Fashion
                </option>
                <option value="Home & Kitchen" className="bg-[#11141a] text-white">
                  Home & Kitchen
                </option>
                <option value="Sports & Fitness" className="bg-[#11141a] text-white">
                  Sports & Fitness
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-200">
                Colors
              </label>
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

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Custom Specifications
              </label>

              {specifications.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs text-gray-400 mb-1 px-1">
                  <span>Specification Name</span>
                  <span>Value</span>
                  <span className="w-8"></span>
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
                      placeholder="e.g., Battery Life, Weight"
                      value={spec.name}
                      onChange={(e) =>
                        updateSpecification(index, 'name', e.target.value)
                      }
                      className="w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
                    />
                    <input
                      type="text"
                      placeholder="e.g., 4000mAh, 1.5kg, Pl"
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
                      title="Remove specification"
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

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Custom Properties
              </label>

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
                        title="Remove property"
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
                  placeholder="Enter property label (e.g., Material, Warranty)"
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

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer shadow-lg"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
