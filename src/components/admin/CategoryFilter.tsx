import { useState } from "react";
import { ChevronDown, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  label?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onChange,
  label = "Filtrar por categoria"
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          selectedCategories.length > 0
            ? "bg-[#2e3091] text-white border-[#2e3091]"
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
        {selectedCategories.length > 0 && (
          <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded">
            {selectedCategories.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Categorias</span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-[#2e3091] hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="p-2 max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma categoria disponível
                  </p>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 rounded border-gray-300 text-[#2e3091] focus:ring-[#2e3091]"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Selected categories pills */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#2e3091]/10 text-[#2e3091] rounded-lg text-xs font-medium"
            >
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="hover:bg-[#2e3091]/20 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
