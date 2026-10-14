'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
];

const ColorSelector = ({ control, error }: any) => {
  const [customColor, setCustomColor] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [newColor, setNewColor] = useState<string>('#ffffff');

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-white mb-2 ">
        Colors
      </label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {[...defaultColors, ...customColor].map((color, index) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ['#fff', '#ffff00'].includes(
                color.toLowerCase(),
              );

              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color],
                    )
                  }

                  className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition-colors duration-200 ${
                    isLightColor ? 'border-gray-400' : ''
                  } ${isSelected ? 'scale-110 border-white' : 'border-transparent'} `}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        )}
      />
    </div>
  );
};
