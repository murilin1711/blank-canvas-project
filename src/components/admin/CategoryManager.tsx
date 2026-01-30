import { useState } from "react";
import { Plus, Edit, Trash2, X, Save, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CategoryManagerProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  onEditCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
}

export default function CategoryManager({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast.error("Digite o nome da categoria");
      return;
    }
    if (categories.includes(trimmed)) {
      toast.error("Categoria já existe");
      return;
    }
    onAddCategory(trimmed);
    setNewCategory("");
    toast.success("Categoria adicionada!");
  };

  const handleEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error("Digite o nome da categoria");
      return;
    }
    if (trimmed !== editingCategory && categories.includes(trimmed)) {
      toast.error("Categoria já existe");
      return;
    }
    onEditCategory(editingCategory!, trimmed);
    setEditingCategory(null);
    setEditValue("");
    toast.success("Categoria atualizada!");
  };

  const handleDelete = (category: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category}"? Os produtos não serão excluídos, apenas ficarão sem categoria.`)) {
      return;
    }
    onDeleteCategory(category);
    toast.success("Categoria excluída!");
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        <Tag className="w-4 h-4" />
        Gerenciar Categorias
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Gerenciar Categorias</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Add new category */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Nova categoria..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                  <button
                    onClick={handleAdd}
                    className="px-3 py-2 bg-[#2e3091] text-white rounded-lg hover:bg-[#252a7a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div className="max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">
                    Nenhuma categoria cadastrada
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {categories.map((category) => (
                      <div key={category} className="p-3 hover:bg-gray-50 transition-colors">
                        {editingCategory === category ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEdit}
                              className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">{category}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(category)}
                                className="p-1.5 text-gray-400 hover:text-[#2e3091] hover:bg-[#2e3091]/10 rounded transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
