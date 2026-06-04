"use client";

import LoadingState from "@/components/LoadingState";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  MoreVertical,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Search,
  GripVertical,
  Check,
  Image as ImageIcon,
} from "lucide-react";
// import Image from "next/image";
import {
  fetchSections,
  createFeaturedSection,
  updateSection,
  deleteSection,
  getSectionItems,
  fetchProductCatalogueData,
  type Section,
  type SectionItem,
} from "@/lib/api";
import { toast } from "sonner";

interface FeaturedProduct extends SectionItem {
  category: string;
}

interface Product {
  id: string;
  name: string;
  productType: string;
  price: number;
  image?: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  order: number;
}

interface CategoryOption {
  name: string;
  isExisting: boolean;
}

type CategoryTab = string; // Dynamic section names

// ═══════════════════════════════════════════════════════════════
// MOCK DATA - Replace with API calls
// ═══════════════════════════════════════════════════════════════
const mockExistingCategories = [
  "fresh Picks",
  "fresh drops",
  "fresh trends",
  "Fresh drop",
  "Spotlight",
  "Limited offers",
];

const mockAllProducts: Product[] = [
  {
    id: "p1",
    name: "Midnight Tour...",
    productType: "Merchandise",
    price: 12,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200",
  },
  {
    id: "p2",
    name: "Midnight Tour...",
    productType: "Merchandise",
    price: 12,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200",
  },
  {
    id: "p3",
    name: "Midnight Tour...",
    productType: "Audio",
    price: 12,
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200",
  },
  {
    id: "p4",
    name: "Midnight Tour...",
    productType: "Video",
    price: 12,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200",
  },
  {
    id: "p5",
    name: "Backstage Energy Hoodie",
    productType: "Merchandise",
    price: 42,
  },
  {
    id: "p6",
    name: "Backstage Energy Hoodie",
    productType: "Merchandise",
    price: 42,
  },
  { id: "p7", name: "Studio Nights Vinyl", productType: "Audio", price: 60 },
];

const mockFeaturedProducts: FeaturedProduct[] = [
  {
    id: "1",
    name: "Midnight Tour Dad Cap",
    productType: "Merchandise",
    price: 20,
    creator: "@neonvibes",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200",
    category: "Fresh drop",
  },
  {
    id: "2",
    name: "Backstage Energy Hoodie",
    productType: "Merchandise",
    price: 40,
    creator: "@Echo_Rush",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200",
    category: "Fresh drop",
  },
  {
    id: "3",
    name: "Studio Nights Vinyl LP",
    productType: "Audio",
    price: 60,
    creator: "@urbanflux",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200",
    category: "Fresh drop",
  },
  {
    id: "4",
    name: "Icon Era Graphic Tee",
    productType: "Merchandise",
    price: 10,
    creator: "@nightwavee",
    date: "19 Jan, 2026",
    category: "Fresh drop",
  },
  {
    id: "5",
    name: "Unreleased Sessions EP",
    productType: "Audio",
    price: 5,
    creator: "@solarphase",
    date: "19 Jan, 2026",
    category: "Fresh drop",
  },
  {
    id: "6",
    name: "Live at the Dome Vinyl",
    productType: "Merchandise",
    price: 100,
    creator: "@creatorlab",
    date: "19 Jan, 2026",
    category: "Fresh drop",
  },
  {
    id: "7",
    name: "Spotlight Product 1",
    productType: "Merchandise",
    price: 30,
    creator: "@creator1",
    date: "18 Jan, 2026",
    category: "Spotlight",
  },
  {
    id: "8",
    name: "Limited Offer Item 1",
    productType: "Audio",
    price: 25,
    creator: "@creator2",
    date: "17 Jan, 2026",
    category: "Limited offers",
  },
];

const formatCurrency = (num: number) => `$${num}`;

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "Unknown";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const FeaturedProductsPage = () => {
  // Data state
  const [sections, setSections] = useState<Section[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    [],
  );
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionItemsLoading, setSectionItemsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [updatingSection, setUpdatingSection] = useState(false);
  const [deletingSection, setDeletingSection] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryTab>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer 1 state (Category Setup)
  const [mainDrawerOpen, setMainDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [promotionToggle, setPromotionToggle] = useState(false);
  const [promoPercentage, setPromoPercentage] = useState("0.00");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  const [showSuggestions, setShowSuggestions] = useState(false);
  // Drawer 2 state (Product Selection)
  const [selectionDrawerOpen, setSelectionDrawerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("All Products");
  const [tempSelectedProducts, setTempSelectedProducts] = useState<
    SelectedProduct[]
  >([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const pageSize = 16;

  // ═══════════════════════════════════════════════════════════════
  // FETCH DATA FROM BACKEND
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch sections and all products
        const [sectionsData, productsData] = await Promise.all([
          fetchSections(),
          fetchProductCatalogueData(1, 1000), // Fetch first 1000 products
        ]);

        setSections(sectionsData.sections);
        // Convert product catalog data to Product interface
        const formattedProducts: Product[] = productsData.products.map(
          (product) => ({
            id: product.id,
            name: product.name,
            productType: product.productType,
            price: product.price,
            image: product.image,
          }),
        );
        setAllProducts(formattedProducts);

        // Set active tab to first section if available
        if (sectionsData.sections.length > 0) {
          setActiveTab(sectionsData.sections[0].name);
          // Load products for the first section
          const sectionItems = await getSectionItems(
            sectionsData.sections[0].id,
          );
          const formattedProducts: FeaturedProduct[] = sectionItems.items.map(
            (item) => ({
              ...item,
              category: sectionsData.sections[0].name,
            }),
          );
          setFeaturedProducts(formattedProducts);
        } else {
          setFeaturedProducts([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sections");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load section items when active tab changes
  useEffect(() => {
    if (!activeTab || sections.length === 0) return;

    const loadSectionItems = async () => {
      try {
        setSectionItemsLoading(true);
        const activeSection = sections.find((s) => s.name === activeTab);
        if (!activeSection) return;

        const sectionItems = await getSectionItems(activeSection.id);
        const formattedProducts: FeaturedProduct[] = sectionItems.items.map(
          (item) => ({
            ...item,
            category: activeSection.name,
          }),
        );
        setFeaturedProducts(formattedProducts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load section items");
      } finally {
        setSectionItemsLoading(false);
      }
    };

    loadSectionItems();
  }, [activeTab, sections]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // ═══════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const getCategorySuggestions = (): CategoryOption[] => {
    if (!categoryInput.trim()) return [];

    const sectionNames = sections.map((s) => s.name);
    const filtered = sectionNames
      .filter((cat: string) =>
        cat.toLowerCase().includes(categoryInput.toLowerCase()),
      )
      .map((cat: string) => ({ name: cat, isExisting: true }));

    const exactMatch = sectionNames.some(
      (cat: string) => cat.toLowerCase() === categoryInput.toLowerCase(),
    );

    if (!exactMatch && categoryInput.trim()) {
      filtered.push({ name: `Add "${categoryInput}"`, isExisting: false });
    }

    return filtered;
  };

  const categorySuggestions = getCategorySuggestions();

  const getCategoryCount = (category: string) => {
    const section = sections.find((s) => s.name === category);
    return section ? section.itemsCount : 0;
  };

  const filteredFeaturedProducts = featuredProducts.filter(
    (product) => product.category === activeTab,
  );
  const totalFeaturedProducts = filteredFeaturedProducts.length;
  const totalPages = Math.ceil(totalFeaturedProducts / pageSize);
  const paginatedFeaturedProducts = filteredFeaturedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const filteredAllProducts = allProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    const matchesType =
      productTypeFilter === "All Products" ||
      product.productType === productTypeFilter;
    return matchesSearch && matchesType;
  });

  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const handleNewFeature = () => {
    setCategoryInput("");
    setSelectedCategory("");
    setPromotionToggle(false);
    setPromoPercentage("0.00");
    setSelectedProducts([]);
    setIsEditMode(false);
    setMainDrawerOpen(true);
  };

  const handleEditCategory = async () => {
    const activeSection = sections.find((s) => s.name === activeTab);
    if (!activeSection) return;

    setSelectedCategory(activeTab);
    setCategoryInput(activeTab);
    setPromotionToggle(activeSection.promotionEnabled);
    setPromoPercentage(activeSection.promotionPercentage.toString());

    try {
      const sectionItems = await getSectionItems(activeSection.id);
      const categoryProducts = sectionItems.items.map((p, index) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
        order: index,
      }));

      setSelectedProducts(categoryProducts);
      setIsEditMode(true);
      setMainDrawerOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load section for editing");
    }
  };

  const handleSelectCategory = (category: string) => {
    const cleanCategory = category.replace(/^Add "/, "").replace(/"$/, "");
    setSelectedCategory(cleanCategory);
    setCategoryInput(cleanCategory);
    setShowSuggestions(false);
  };

  const handleOpenSelectionDrawer = async () => {
    setTempSelectedProducts([...selectedProducts]);
    setProductSearch("");
    setProductTypeFilter("All Products");
    setSelectionDrawerOpen(true);

    // Fetch fresh products when opening the drawer
    try {
      setProductsLoading(true);
      const productsData = await fetchProductCatalogueData(1, 1000);
      const formattedProducts: Product[] = productsData.products.map(
        (product) => ({
          id: product.id,
          name: product.name,
          productType: product.productType,
          price: product.price,
          image: product.image,
        }),
      );
      setAllProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleToggleProduct = (product: Product) => {
    const exists = tempSelectedProducts.some((p) => p.id === product.id);

    if (exists) {
      setTempSelectedProducts(
        tempSelectedProducts.filter((p) => p.id !== product.id),
      );
    } else {
      setTempSelectedProducts([
        ...tempSelectedProducts,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          order: tempSelectedProducts.length,
        },
      ]);
    }
  };

  const handleClearAll = () => {
    setTempSelectedProducts([]);
  };

  const handleDoneSelection = () => {
    setSelectedProducts(tempSelectedProducts);
    setSelectionDrawerOpen(false);
  };

  const handleDragStart = (productId: string) => {
    setDraggedItem(productId);
  };

  const handleDragOver = (e: React.DragEvent, productId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === productId) return;

    const draggedIndex = tempSelectedProducts.findIndex(
      (p) => p.id === draggedItem,
    );
    const targetIndex = tempSelectedProducts.findIndex(
      (p) => p.id === productId,
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newProducts = [...tempSelectedProducts];
    const [removed] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, removed);

    newProducts.forEach((p, index) => {
      p.order = index;
    });

    setTempSelectedProducts(newProducts);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleCreate = async () => {
    const trimmedCategory = (selectedCategory || categoryInput).trim();
    if (!trimmedCategory) {
      toast.error("Category name is required");
      return;
    }

    const productIds = selectedProducts
      .map((p) => {
        const asNumber = Number(p.id);
        return Number.isNaN(asNumber) ? p.id : asNumber;
      })
      .filter((id) => id !== "" && id !== null && id !== undefined);

    if (productIds.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    const parsedPromo = parseFloat(promoPercentage);
    const promotionPercentage =
      promotionToggle && !Number.isNaN(parsedPromo) ? parsedPromo : 0;

    // Validate promotion percentage is between 0 and 100
    if (promotionPercentage < 0 || promotionPercentage > 100) {
      toast.error("Promotion percentage must be between 0 and 100");
      return;
    }

    try {
      if (isEditMode) {
        setUpdatingSection(true);
        const activeSection = sections.find((s) => s.name === activeTab);
        if (!activeSection) return;

        await updateSection({
          id: activeSection.id,
          name: trimmedCategory,
          productIds,
          promotionEnabled: promotionToggle,
          promotionPercentage,
        });
        toast.success("Section updated");
        setUpdatingSection(false);
      } else {
        setSavingSection(true);
        await createFeaturedSection({
          name: trimmedCategory,
          productIds,
          promotionEnabled: promotionToggle,
          promotionPercentage,
        });
        toast.success("Section created");
        setSavingSection(false);
      }

      // Refresh sections data
      const sectionsData = await fetchSections();
      setSections(sectionsData.sections);

      setMainDrawerOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to save section");
      setSavingSection(false);
      setUpdatingSection(false);
    }
  };

  const openDeleteCategoryDialog = () => {
    if (!sections.find((s) => s.name === activeTab)) {
      toast.error("No category selected");
      return;
    }

    setDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    const activeSection = sections.find((s) => s.name === activeTab);
    if (!activeSection) {
      toast.error("No category selected");
      return;
    }

    try {
      setDeletingSection(true);
      await deleteSection(activeSection.id);
      toast.success("Section deleted");

      const sectionsData = await fetchSections();
      setSections(sectionsData.sections);
      setFeaturedProducts([]);
      setActiveTab(sectionsData.sections[0]?.name || "");
      setMainDrawerOpen(false);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete section");
    } finally {
      setDeletingSection(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // TABLE COLUMNS
  // ═══════════════════════════════════════════════════════════════
  const columns: ColumnDef<FeaturedProduct>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                  P
                </div>
              )}
            </div>
            <span className="font-medium text-[#373737] INT500 text-[14px]">
              {product.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "productType",
      header: "Product type",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px]">
          {row.getValue("productType")}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Price</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 3V9M6 3L8 5M6 3L4 5"
              stroke="#5B5B5B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#373737] INT500 text-[14px]">
          {formatCurrency(row.getValue("price"))}
        </span>
      ),
    },
    {
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px]">
          {row.getValue("creator")}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Date</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 3V9M6 3L8 5M6 3L4 5"
              stroke="#5B5B5B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {formatDate(row.getValue("date"))}
        </span>
      ),
    },
    // {
    //   id: "actions",
    //   header: "",
    //   cell: () => (
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button variant="ghost" className="h-8 w-8 p-0">
    //           <MoreVertical className="h-4 w-4 text-[#5B5B5B]" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end" className="w-48">
    //         <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer">
    //           <Edit3 className="h-4 w-4" />
    //           Edit
    //         </DropdownMenuItem>
    //         <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer">
    //           <Eye className="h-4 w-4" />
    //           View
    //         </DropdownMenuItem>
    //         <DropdownMenuItem className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer">
    //           <Trash2 className="h-4 w-4" />
    //           Delete
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   ),
    // },
  ];

  const showingStart =
    totalFeaturedProducts === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd =
    totalFeaturedProducts === 0
      ? 0
      : Math.min(currentPage * pageSize, totalFeaturedProducts);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading featured products..." />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
            Featured Products
          </h2>
          <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
            Curate Featured Product Collections and Categories
          </p>
        </div>
        <Button
          onClick={handleNewFeature}
          className="bg-[#F75803] hover:bg-[#E54D00] text-white INT500 text-[14px] gap-2 rounded-[12px] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New feature
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-[#F1F1F1]">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.name)}
            className={`pb-3 px-1 text-[14px] INT500 font-medium transition-colors relative cursor-pointer ${activeTab === section.name ? "text-[#111810]" : "text-[#808080] hover:text-[#5B5B5B]"}`}
          >
            {section.name} ({getCategoryCount(section.name)})
            {activeTab === section.name && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F75803]" />
            )}
          </button>
        ))}
        {sections.length > 0 && (
          <div className="flex items-center gap-2 pb-3">
            <div className="w-0 h-[20px] border-[1px] border-[#F1F1F1]" />
            <button
              onClick={handleEditCategory}
              className="px-1 text-[14px] INT500 font-medium text-[#F75803] hover:text-[#E54D00] transition-colors cursor-pointer"
            >
              Edit Category
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white overflow-hidden">
        <UserTable
          data={paginatedFeaturedProducts}
          columns={columns}
          placeholder="Search products..."
          loading={sectionItemsLoading}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080]">
        <p className="INT400 text-[14px]">
          SHOWING {showingStart}-{showingEnd} OF{" "}
          {totalFeaturedProducts.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.21885 8.00047L10.5187 11.3003L9.57592 12.2431L5.33325 8.00047L9.57592 3.75781L10.5187 4.70062L7.21885 8.00047Z"
                fill="#111810"
              />
            </svg>
          </button>

          <button
            disabled={totalPages === 0 || currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.78105 8.00047L5.4812 4.70062L6.42401 3.75781L10.6667 8.00047L6.42401 12.2431L5.4812 11.3003L8.78105 8.00047Z"
                fill="#111810"
              />
            </svg>
          </button>

          {/* <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <Image
              src="/icons/backbutton.svg"
              height={20}
              width={20}
              alt="previous"
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={showingEnd >= totalProducts}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <Image
              src="/icons/forwardbutton.svg"
              height={20}
              width={20}
              alt="next"
            />
          </Button> */}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DRAWER 1 - CATEGORY SETUP
          ═══════════════════════════════════════════════════════════════ */}
      <Sheet open={mainDrawerOpen} onOpenChange={setMainDrawerOpen}>
        <SheetContent
          className="w-full sm:max-w-[450px] p-0 [&>button]:hidden"
          side="right"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-5 border-b border-[#F1F1F1]">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-[#111810] INT500 font-medium text-[20px] leading-[28px]">
                  {isEditMode ? "Edit Category" : "Product Feature"}
                </SheetTitle>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 border border-[#F1F1F1] rounded-[16px]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 w-full">
              {/* Category Input */}
              <div>
                <label className="text-[#111810] INT500 text-[14px] leading-[20px] mb-2 block">
                  Category
                </label>
                <div className="relative">
                  <Input
                    value={categoryInput}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="Enter your Category"
                    className="border-[#F1F1F1] focus-visible:ring-[#F75803]"
                  />

                  {showSuggestions &&
                    categorySuggestions.length > 0 &&
                    categoryInput && (
                      <div className=" top-full left-0 right-0 mt-1 bg-white border border-[#F1F1F1] rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                        {categorySuggestions.map((cat, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectCategory(cat.name)}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F7F7F7] INT400 text-[14px] text-[#373737] flex items-center justify-between cursor-pointer"
                          >
                            <span>{cat.isExisting ? cat.name : cat.name}</span>
                            {selectedCategory ===
                              cat.name
                                .replace(/^Add "/, "")
                                .replace(/"$/, "") && (
                              <Check className="h-4 w-4 text-[#F75803]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Selected Products Grid */}
              <div className="flex flex-wrap gap-3 w-full">
                {selectedProducts.length === 0 ? (
                  <button
                    onClick={handleOpenSelectionDrawer}
                    className="INT500  text-[#808080] text-[14px] leading-[20px] track9ing-[-1.5%] w-full flex items-center justify-center gap-2 h-[80px] rounded-[12px] border-[2px] border-[#E4E4E4] border-dashed cursor-pointer"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.0003 18.3327C5.39795 18.3327 1.66699 14.6017 1.66699 9.99935C1.66699 5.39697 5.39795 1.66602 10.0003 1.66602C14.6027 1.66602 18.3337 5.39697 18.3337 9.99935C18.3337 14.6017 14.6027 18.3327 10.0003 18.3327ZM9.16699 9.16602H5.83366V10.8327H9.16699V14.166H10.8337V10.8327H14.167V9.16602H10.8337V5.83268H9.16699V9.16602Z"
                        fill="#808080"
                      />
                    </svg>
                    Select Featured Product
                  </button>
                ) : (
                  <>
                    {[...selectedProducts]
                      .sort((a, b) => a.order - b.order)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="relative w-[115px] h-[120px] rounded-[3px] overflow-hidden bg-[#D9D9D9]"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}

                    <button
                      onClick={handleOpenSelectionDrawer}
                      className="aspect-square bg-[#FEF5EE] hover:bg-[#FFEEE6] transition-colors flex items-center justify-center w-[115px] h-[120px] rounded-[3px]"
                    >
                      <Plus className="h-8 w-8 text-[#F75803]" />
                    </button>
                  </>
                )}
              </div>

              {/* Promotion Toggle */}
              <div className="space-y-4 py-6 border-t border-[#F1F1F1] ">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-[#111810] INT500 font-medium leading-[20px] tracking-[-1.5%] text-[14px] block">
                      Promotion toggle
                    </label>
                    <p className="text-[#808080] INT400 text-[14px] mt-1 leading-[20px] tracking-[-1.8%]">
                      Set a promotional price for all items in this category.
                    </p>
                  </div>
                  <Switch
                    checked={promotionToggle}
                    onCheckedChange={setPromotionToggle}
                  />
                </div>

                {promotionToggle && (
                  <div className="bg-[#FFEEE6] p-4 rounded-[8px] space-y-3">
                    <div>
                      <label className="text-[#111810] INT500 leading-[20px] track9ing-[-1.5%] font-medium text-[14px] mb-2 block">
                        Category Promo Percentage
                      </label>
                      <div className="relative">
                        <Input
                          value={promoPercentage}
                          onChange={(e) => setPromoPercentage(e.target.value)}
                          className="border-[#E4E4E4] bg-[#FFFFFF] pl-9 focus-visible:ring-[#fffff]"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8C8C8] INT400 text-[18px]">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-[##111810]">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.0003 18.3327C5.39795 18.3327 1.66699 14.6017 1.66699 9.99935C1.66699 5.39697 5.39795 1.66602 10.0003 1.66602C14.6027 1.66602 18.3337 5.39697 18.3337 9.99935C18.3337 14.6017 14.6027 18.3327 10.0003 18.3327ZM10.0003 16.666C13.6822 16.666 16.667 13.6813 16.667 9.99935C16.667 6.31745 13.6822 3.33268 10.0003 3.33268C6.31843 3.33268 3.33366 6.31745 3.33366 9.99935C3.33366 13.6813 6.31843 16.666 10.0003 16.666ZM9.16699 5.83268H10.8337V7.49935H9.16699V5.83268ZM9.16699 9.16602H10.8337V14.166H9.16699V9.16602Z"
                          fill="#F75803"
                        />
                      </svg>

                      <p className="INT400 text-[14px] leading-[20px] tracking-[1.8%]">
                        This percentage will overwrite the product prices
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#F1F1F1] flex items-center justify-between gap-3">
              {isEditMode ? (
                <>
                  <Button
                    onClick={openDeleteCategoryDialog}
                    variant="ghost"
                    className="text-[#C83532] rounded-[12px] hover:text-[#C83532] hover:bg-[#FEF2F2] INT500 text-[14px] cursor-pointer"
                  >
                    Delete Category
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={updatingSection}
                    className="bg-[#F75803] rounded-[12px] hover:bg-[#E54D00] text-white INT500 text-[14px] px-8 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {updatingSection ? (
                      <>
                        <svg
                          className="animate-spin  h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setMainDrawerOpen(false)}
                    variant="outline"
                    className="border-[#F1F1F1]  rounded-[12px] text-[#5B5B5B] hover:bg-[#F7F7F7] INT500 text-[14px] flex-1 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={savingSection}
                    className="bg-[#F75803] hover:bg-[#E54D00] rounded-[12px] text-white INT500 text-[14px] flex-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {savingSection ? (
                      <>
                        <svg
                          className="animate-spin  h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══════════════════════════════════════════════════════════════
          DRAWER 2 - PRODUCT SELECTION
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              This will delete {activeTab ? `"${activeTab}"` : "this category"}.
              Store items linked to it will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingSection}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeleteCategory}
              disabled={deletingSection}
              loading={deletingSection}
              className="bg-[#C83532] hover:bg-[#C83532] text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={selectionDrawerOpen} onOpenChange={setSelectionDrawerOpen}>
        <SheetContent
          className="w-full sm:max-w-[80%] h-screen p-0 [&>button]:hidden"
          side="right"
        >
          <div className="flex h-full w-full relative">
            <div className="bg-[#FAFAFA] w-full relative">
              {/* Search and Filters */}
              <div className="px-6 py-4 border-b border-[#F1F1F1] space-y-5">
                <div className="relative bg-[#FFFFFF] ">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B5B5B]" />
                  <Input
                    placeholder="Search..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 border-[#E4E4E4]"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[
                    "All Products",
                    "Audio",
                    "Video",
                    "Podcast",
                    "Merchandise",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setProductTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-full text-[14px] INT400 leading-[20px] tracking-[1.8%] transition-colors cursor-pointer ${productTypeFilter === type ? "bg-[#111810] text-white" : "bg-[#FFFFFF] text-[#5B5B5B] border border-[#E4E4E4] hover:bg-[#EDEDED]"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto  h-full  px-6 py-4">
                {productsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingState message="Loading products..." />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {filteredAllProducts.map((product) => {
                      const isSelected = tempSelectedProducts.some(
                        (p) => p.id === product.id,
                      );
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleToggleProduct(product)}
                          className={`relative group h-full  w-[147px] bg-white rounded-[8px] cursor-pointer ${isSelected ? "ring-2 ring-[#F75803]" : "ring-1 ring-transparent hover:ring-[#E4E4E4]"}`}
                        >
                          <div
                            className={`h-[112px] w-[147px] rounded-tl-[8px] rounded-tr-[8px] overflow-hidden bg-gray-200`}
                          >
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#2BAC47] flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="py-2 px-2 flex flex-col items-start">
                            <p className="text-[#111810] font-medium tracking-[-1.5%] leading-[20px] INT500 text-[14px] truncate w-[80%]">
                              {product.name}
                            </p>
                            <p className="text-[#F75803]  font-medium tracking-[-1.5%] leading-[20px] INT500 text-[14px]">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="absolute bg-[#FAFAFA]  bottom-0 left-0 right-0 px-6 py-3 border-t border-[#F1F1F1] w-full flex items-center gap-3 justify-between ">
                <Button
                  onClick={() => setSelectionDrawerOpen(false)}
                  variant="outline"
                  className="border-[#F1F1F1] w-[88px] rounded-[12px]  text-[#5B5B5B] hover:bg-[#F7F7F7] INT500 text-[14px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDoneSelection}
                  className="bg-[#F75803] hover:bg-[#E54D00] w-[88px] rounded-[12px] text-white INT500 text-[14px] cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>

            <div className="border-l border-[#F1F1F1]">
              <div className="flex items-center justify-between px-6 py-4  border-b border-[#F1F1F1] ">
                <div className="flex items-center gap-2">
                  <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                    Selected
                  </span>
                  <span className="h-[20px] w-[20px] flex items-center justify-center bg-[#FFEEE6] text-[#F75803] INT500 text-[12px] rounded-[32px]">
                    {tempSelectedProducts.length}
                  </span>
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-[#A4A4A4] hover:text-[#5B5B5B] INT500 text-[12px] leading-[16px] tracking-[ 8%] uppercase cursor-pointer"
                >
                  CLEAR ALL
                </button>
              </div>
              {tempSelectedProducts.length > 0 && (
                <div className="w-full  overflow-y-auto p-4">
                  <div className="space-y-2">
                    {tempSelectedProducts
                      .sort((a, b) => a.order - b.order)
                      .map((product) => (
                        <div
                          key={product.id}
                          draggable
                          onDragStart={() => handleDragStart(product.id)}
                          onDragOver={(e) => handleDragOver(e, product.id)}
                          onDragEnd={handleDragEnd}
                          className="flex items-center gap-2 p-2 bg-[#F7F7F7] h-[80px] border border-[#F1F1F1] rounded-[8px] cursor-move hover:border-[#F75803]"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="8.5" cy="5.5" r="2.5" fill="#C8C8C8" />
                            <circle cx="15.5" cy="5.5" r="2.5" fill="#C8C8C8" />
                            <circle cx="8.5" cy="12.5" r="2.5" fill="#C8C8C8" />
                            <circle
                              cx="15.5"
                              cy="12.5"
                              r="2.5"
                              fill="#C8C8C8"
                            />
                            <circle cx="8.5" cy="19.5" r="2.5" fill="#C8C8C8" />
                            <circle
                              cx="15.5"
                              cy="19.5"
                              r="2.5"
                              fill="#C8C8C8"
                            />
                          </svg>

                          <div className="h-10 w-10 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#373737] INT500 text-[11px]">
                              {product.name}
                            </p>
                            <p className="text-[#F75803] INT400 text-[10px]">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-3 bg-[#F7F7F7] border-t border-[#F1F1F1]">
                <p className="text-[#808080] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                  Drag items using the six dots to set their manual display
                  order on the storefront.
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FeaturedProductsPage;
