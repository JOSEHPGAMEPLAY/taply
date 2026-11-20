'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { iconMap, iconCategories, getIconByKey } from '@/lib/icon-map';
import type { IconOption } from '@/lib/icon-map';

export interface IconSelectorProps {
  selectedKey?: string;
  onSelect: (key: string) => void;
  placeholder?: string;
}

export default function IconSelector({
  selectedKey,
  onSelect,
  placeholder = 'Seleccionar icono...',
}: IconSelectorProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');

  const filteredIcons = useMemo(() => {
    return iconMap.filter((icon) => {
      const matchSearch =
        !search ||
        icon.label.toLowerCase().includes(search.toLowerCase()) ||
        icon.key.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || icon.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  const selectedIcon = selectedKey ? getIconByKey(selectedKey) : undefined;

  return (
    <div className="space-y-3">
      {/* Preview del icono seleccionado */}
      {selectedIcon && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <selectedIcon.component className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">{selectedIcon.label}</p>
            <p className="text-xs text-blue-600">{selectedIcon.category}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect('')}
            className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
            title="Quitar icono"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Búsqueda y filtro */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Todas</option>
          {iconCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de iconos */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 border border-gray-200 rounded-lg">
        {filteredIcons.map((icon) => {
          const isSelected = selectedKey === icon.key;
          const IconComponent = icon.component;
          return (
            <button
              key={icon.key}
              type="button"
              onClick={() => onSelect(icon.key)}
              title={icon.label}
              className={`
                flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all
                ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                    : 'bg-white border-2 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center line-clamp-2">{icon.label}</span>
            </button>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">
          No se encontraron iconos con "{search}"
        </p>
      )}
    </div>
  );
}
