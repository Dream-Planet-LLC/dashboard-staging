"use client";

import { useState, useEffect } from "react";
import { Plus, CirclePlus, GripVertical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  type: "Audio" | "Video" | "Podcast" | "Merchandise";
}

interface SelectedProduct extends Product {
  order: number;
}

interface CategoryData {
  id: string;
  name: string;
}

type DrawerStage = "category" | "products" | "promotion";

interface ProductFeatureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: CategoryData[]; // Pass existing categories from parent
  availableProducts: Product[]; // Pass available products from parent
  onComplete: (data: {
    category: string;
    products: SelectedProduct[];
    promotionEnabled: boolean;
    promotionPercentage: number;
  }) => void;
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export function ProductFeatureDrawer({
  isOpen,
  onClose,
  existingCategories,
  availableProducts,
  onComplete,
}: ProductFeatureDrawerProps) {
  const [stage, setStage] = useState<DrawerStage>("category");
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>(
    []
  );
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "All Products" | "Audio" | "Video" | "Podcast" | "Merchandise"
  >("All Products");
  const [promotionEnabled, setPromotionEnabled] = useState(false);
  const [promotionPercentage, setPromotionPercentage] = useState("");
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStage("category");
        setCategory("");
        setCategoryInput("");
        setFilteredCategories([]);
        setSelectedProducts([]);
        setSearchQuery("");
        setActiveFilter("All Products");
        setPromotionEnabled(false);
        setPromotionPercentage("");
      }, 300);
    }
  }, [isOpen]);

  // Filter categories based on input - search as you type
  useEffect(() => {
    if (categoryInput.trim()) {
      const filtered = existingCategories.filter((cat) =>
        cat.name.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  }, [categoryInput, existingCategories]);

  // Handle category selection
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setCategoryInput(selectedCategory);
    setFilteredCategories([]);
  };

  // Handle custom category (when typing something that doesn't exist)
  const handleAddCustomCategory = () => {
    if (categoryInput.trim() && !existingCategories.some(cat => cat.name.toLowerCase() === categoryInput.toLowerCase())) {
      setCategory(categoryInput);
    }
  };

  // Move to product selection
  const handleSelectProducts = () => {
    if (category.trim()) {
      setStage("products");
    }
  };

  // Toggle product selection
  const handleToggleProduct = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);

    if (isSelected) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      const newProduct: SelectedProduct = {
        ...product,
        order: selectedProducts.length,
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }
  };

  // Filter products
  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All Products" || product.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const items = [...selectedProducts];
    const draggedProduct = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedProduct);

    // Update order
    const reordered = items.map((item, idx) => ({ ...item, order: idx }));
    setSelectedProducts(reordered);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Move to promotion stage
  const handleDoneSelection = () => {
    if (selectedProducts.length > 0) {
      setStage("promotion");
    }
  };

  // Handle final create
  const handleCreate = () => {
    onComplete({
      category,
      products: selectedProducts,
      promotionEnabled,
      promotionPercentage: parseFloat(promotionPercentage) || 0,
    });
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
     
          <DrawerContent className="h-full max-w-[450px] w-full ml-auto bg-white text-black md:rounded-tl-lg rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none [&>div:first-child]:hidden overflow-x-hidden">
        <DrawerHeader className="border-b border-[#F1F1F1]">
          <DrawerTitle className="text-[#111810] INT500 font-medium text-[18px] leading-[24px] tracking-[-1.5%]">
            Product Feature
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Add featured products to a category
          </DrawerDescription>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stage === "category" && (
            <CategoryStage
              categoryInput={categoryInput}
              setCategoryInput={setCategoryInput}
              filteredCategories={filteredCategories}
              onSelectCategory={handleCategorySelect}
              onAddCustomCategory={handleAddCustomCategory}
              onNext={handleSelectProducts}
              hasCategory={!!category}
              existingCategories={existingCategories}
            />
          )}

          {stage === "products" && (
            <ProductSelectionStage
              category={category}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              filteredProducts={filteredProducts}
              selectedProducts={selectedProducts}
              onToggleProduct={handleToggleProduct}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onClearAll={() => setSelectedProducts([])}
              onDone={handleDoneSelection}
              onCancel={onClose}
            />
          )}

          {stage === "promotion" && (
            <PromotionStage
              category={category}
              selectedProducts={selectedProducts}
              promotionEnabled={promotionEnabled}
              setPromotionEnabled={setPromotionEnabled}
              promotionPercentage={promotionPercentage}
              setPromotionPercentage={setPromotionPercentage}
              onCancel={onClose}
              onCreate={handleCreate}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ────────────────────────────────────────────────
// Stage 1: Category Selection
// ────────────────────────────────────────────────
function CategoryStage({
  categoryInput,
  setCategoryInput,
  filteredCategories,
  onSelectCategory,
  onAddCustomCategory,
  onNext,
  hasCategory,
  existingCategories,
}: {
  categoryInput: string;
  setCategoryInput: (value: string) => void;
  filteredCategories: CategoryData[];
  onSelectCategory: (category: string) => void;
  onAddCustomCategory: () => void;
  onNext: () => void;
  hasCategory: boolean;
  existingCategories: CategoryData[];
}) {
  const isNewCategory = categoryInput.trim() && 
    !existingCategories.some(cat => cat.name.toLowerCase() === categoryInput.toLowerCase());

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Category Input */}
      <div className="space-y-2">
        <label className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
          Category
        </label>
        <Input
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="Type to search or create category..."
          className="border-[#F1F1F1] focus-visible:ring-[#F75803]"
        />

        {/* Autocomplete suggestions - only show existing categories */}
        {filteredCategories.length > 0 && (
          <div className="space-y-1 border border-[#F1F1F1] rounded-lg p-1 bg-white">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="w-full text-left px-3 py-2 text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%] hover:bg-[#F7F7F7] rounded transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Add custom category option - only when no matches found */}
        {isNewCategory && (
          <button
            onClick={onAddCustomCategory}
            className="w-full text-left px-3 py-2 text-[#F75803] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium hover:bg-[#FFEEE6] rounded transition-colors border border-[#F75803]/20"
          >
            Add "{categoryInput}"
          </button>
        )}
      </div>

      {/* Select Featured Product Button */}
      <button
        onClick={onNext}
        disabled={!hasCategory}
        className="w-full border-2 border-dashed border-[#E8E8E8] rounded-lg py-8 flex flex-col items-center justify-center gap-2 hover:border-[#F75803] hover:bg-[#FFEEE6]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#E8E8E8] disabled:hover:bg-transparent"
      >
        <CirclePlus className="h-6 w-6 text-[#A4A4A4]" />
        <span className="text-[#A4A4A4] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
          Select Featured Product
        </span>
      </button>

      {/* Promotion Toggle (Disabled) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              Promotion toggle
            </h4>
            <p className="text-[#A4A4A4] INT400 text-[12px] leading-[16px] tracking-[-1.8%] mt-1">
              Set a promotional price for all items in this category.
            </p>
          </div>
          <Switch disabled />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Stage 2: Product Selection
// ────────────────────────────────────────────────
function ProductSelectionStage({
  category,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  filteredProducts,
  selectedProducts,
  onToggleProduct,
  onDragStart,
  onDragOver,
  onDragEnd,
  onClearAll,
  onDone,
  onCancel,
}: any) {
  return (
    <div className="flex w-[800px] gap-6 h-full">
      {/* Left: Product Grid */}
      <div className="flex flex-col border-r border-[#F1F1F1] pr-6">
        {/* Search */}
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="mb-4 border-[#F1F1F1] focus-visible:ring-[#F75803]"
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All Products", "Audio", "Video", "Podcast", "Merchandise"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as typeof activeFilter)}
                className={`px-3 py-1.5 rounded-full text-[12px] INT500 font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-[#111810] text-white"
                    : "bg-[#F7F7F7] text-[#5B5B5B] hover:bg-[#EDEDED]"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 gap-3 flex-1 overflow-y-auto">
          {filteredProducts.map((product: Product) => {
            const isSelected = selectedProducts.some(
              (p: SelectedProduct) => p.id === product.id
            );
            return (
              <button
                key={product.id}
                onClick={() => onToggleProduct(product)}
                className="relative aspect-square bg-[#F7F7F7] rounded-lg border-2 border-transparent hover:border-[#F75803] transition-all group"
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 h-6 w-6 bg-[#4CAF50] rounded-full flex items-center justify-center z-10">
                    <svg
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                    >
                      <path
                        d="M1 5L5 9L13 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Product Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90">
                  <p className="text-[#111810] INT500 text-[12px] leading-[16px] tracking-[-1.5%] font-medium truncate">
                    {product.name}
                  </p>
                  <p className="text-[#F75803] INT500 text-[12px] leading-[16px] tracking-[-1.5%] font-medium">
                    ${product.price}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F1F1F1] mt-4">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="text-[#5B5B5B] INT500 text-[14px] hover:text-[#111810]"
          >
            Cancel
          </Button>
          <Button
            onClick={onDone}
            disabled={selectedProducts.length === 0}
            className="bg-[#F75803] hover:bg-[#E54D00] text-white INT500 text-[14px] px-6"
          >
            Done
          </Button>
        </div>
      </div>

      {/* Right: Selected Products */}
      <div className="flex flex-col bg-[#FAFAFA] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              Selected
            </span>
            <span className="bg-[#F75803] text-white INT500 text-[12px] leading-[16px] font-medium px-2 py-0.5 rounded-full">
              {selectedProducts.length}
            </span>
          </div>
          {selectedProducts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[#F75803] INT500 text-[12px] leading-[16px] tracking-[-1.5%] font-medium hover:text-[#E54D00]"
            >
              CLEAR ALL
            </button>
          )}
        </div>

        {/* Selected Items List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {selectedProducts.map((product: SelectedProduct, index: number) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#F1F1F1] cursor-move hover:shadow-sm transition-shadow"
            >
              <GripVertical className="h-4 w-4 text-[#A4A4A4] flex-shrink-0" />
              <div className="h-10 w-10 bg-[#F7F7F7] rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[#111810] INT500 text-[12px] leading-[16px] tracking-[-1.5%] font-medium truncate">
                  {product.name}
                </p>
                <p className="text-[#F75803] INT500 text-[12px] leading-[16px] tracking-[-1.5%] font-medium">
                  ${product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Drag Hint */}
        {selectedProducts.length > 0 && (
          <p className="text-[#A4A4A4] INT400 text-[11px] leading-[16px] tracking-[-1.8%] mt-4 text-center">
            Drag items using the six dots to set their manual display order on
            the storefront.
          </p>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Stage 3: Promotion
// ────────────────────────────────────────────────
function PromotionStage({
  category,
  selectedProducts,
  promotionEnabled,
  setPromotionEnabled,
  promotionPercentage,
  setPromotionPercentage,
  onCancel,
  onCreate,
}: any) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Category Display */}
      <div className="space-y-2">
        <label className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
          Category
        </label>
        <div className="px-3 py-2 bg-[#F7F7F7] border border-[#F1F1F1] rounded-lg text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {category}
        </div>
      </div>

      {/* Selected Products Preview */}
      <div className="grid grid-cols-3 gap-2">
        {selectedProducts.slice(0, 2).map((product: SelectedProduct) => (
          <div
            key={product.id}
            className="aspect-square bg-[#E8E8E8] rounded-lg"
          />
        ))}
        {selectedProducts.length > 2 && (
          <div className="aspect-square bg-[#FFEEE6] rounded-lg flex items-center justify-center">
            <Plus className="h-8 w-8 text-[#F75803]" />
          </div>
        )}
      </div>

      {/* Promotion Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              Promotion toggle
            </h4>
            <p className="text-[#A4A4A4] INT400 text-[12px] leading-[16px] tracking-[-1.8%] mt-1">
              Set a promotional price for all items in this category.
            </p>
          </div>
          <Switch
            checked={promotionEnabled}
            onCheckedChange={setPromotionEnabled}
          />
        </div>

        {/* Percentage Input (shown when toggle is ON) */}
        {promotionEnabled && (
          <div className="bg-[#FFEEE6] p-4 rounded-lg space-y-3">
            <label className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              Category Promo Percentage
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] INT400 text-[14px]">
                %
              </span>
              <Input
                type="number"
                value={promotionPercentage}
                onChange={(e) => setPromotionPercentage(e.target.value)}
                placeholder="0.00"
                className="pl-8 border-[#F1F1F1] focus-visible:ring-[#F75803] bg-white"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-[#EF8943] flex-shrink-0 mt-0.5" />
              <p className="text-[#EF8943] INT400 text-[12px] leading-[16px] tracking-[-1.8%]">
                This percentage will overwrite the product prices
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={onCancel}
          variant="ghost"
          className="text-[#5B5B5B] INT500 text-[14px] hover:text-[#111810]"
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          className="bg-[#F75803] hover:bg-[#E54D00] text-white INT500 text-[14px] px-6"
        >
          Create
        </Button>
      </div>
    </div>
  );
}