"use client";

import LoadingState from "@/components/LoadingState";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Cdown, Cright } from "@/svg";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  price: number;
  creator: string;
  status: "DELIVERED" | "PROCESSING" | "SHIPPED";
  image?: string;
  quantity: number;
}

interface Order {
  id: string;
  orderId: string;
  amount: number;
  numberOfStores: number;
  status: string;
  date: string;
  items: OrderItem[];
  
  // Customer details for drawer
  customer: {
    name: string;
    username: string;
    avatar?: string;
    tier: string;
  };
  shippingAddress: string;
}

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockOrders: Order[] = [
  {
    id: "1",
    orderId: "Order #54321",
    amount: 8940,
    numberOfStores: 3,
    status: "3/5 delivered",
    date: "19 Jan, 2026",
    customer: {
      name: "Randall Heathcote",
      username: "@Randall",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      tier: "Premium Fan",
    },
    shippingAddress: "742 Evergreen Terrace springfield, OR 97403 United States",
    items: [
      {
        id: "1",
        name: "Backstage Energy Hoodie",
        price: 900,
        creator: "@neonvibes",
        status: "DELIVERED",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100",
        quantity: 1,
      },
      {
        id: "2",
        name: "Carbon Shield Carry Case",
        price: 150,
        creator: "@Echo_Rush",
        status: "DELIVERED",
        image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=100",
        quantity: 1,
      },
      {
        id: "3",
        name: "Pro Audio Podcast",
        price: 150,
        creator: "@urbanflux",
        status: "DELIVERED",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100",
        quantity: 1,
      },
    ],
  },
  {
    id: "2",
    orderId: "Order #54322",
    amount: 8940,
    numberOfStores: 3,
    status: "1/3 delivered",
    date: "19 Jan, 2026",
    customer: {
      name: "Randall Heathcote",
      username: "@Randall",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      tier: "Premium Fan",
    },
    shippingAddress: "742 Evergreen Terrace springfield, OR 97403 United States",
    items: [
      {
        id: "1",
        name: "Midnight Tour Dad Cap",
        price: 2000,
        creator: "@neonvibes",
        status: "DELIVERED",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=100",
        quantity: 1,
      },
      {
        id: "2",
        name: "Midnight Tour Dad...",
        price: 3000,
        creator: "@urbanflux",
        status: "PROCESSING",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=100",
        quantity: 1,
      },
      {
        id: "3",
        name: "Midnight Tour Dad...",
        price: 3040,
        creator: "@neoedisko",
        status: "SHIPPED",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=100",
        quantity: 1,
      },
    ],
  },
 
];

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;
  const totalOrders = 12560;

  // Simulate API fetch with loading
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setOrders(mockOrders);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleToggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  // Calculate totals
  const calculateOrderTotals = (order: Order) => {
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 123849;
    const total = itemsTotal + shipping;
    return { itemsTotal, shipping, total };
  };

  const showingStart = (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(showingStart + pageSize - 1, totalOrders);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading orders..." />
      </div>
    );
  }

  if (!orders)
    return (
      <div className="p-8 text-center text-[#808080]">No data available</div>
    );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Orders
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>

      {/* Custom Orders Table */}
      <div className="bg-white rounded-[4px]  overflow-hidden">
        <table className="w-full border-b border-[#F1F1F1] ">
          <thead className="">
            <tr className="bg-[#F7F7F7]">
              <th className="text-left py-3 px-4 text-[#808080] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium ">
                Order ID
              </th>
              <th className="text-left py-3 px-4 text-[#808080] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium ">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-[#808080] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium ">
                No. of Stores
              </th>
              <th className="text-left py-3 px-4 text-[#808080] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium ">
                Status
              </th>
              <th className="text-left py-3 px-4 text-[#808080] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium ">
                Date
              </th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <>
                {/* Main Order Row */}
                <tr
                  key={order.id}
                  className="border-b border-[#F1F1F1] hover:bg-[#FAFAFA] transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {order.items.length > 0 && (
                        <button
                          onClick={() => handleToggleExpand(order.id)}
                          className="text-[#5B5B5B] hover:text-[#373737] transition-colors"
                        >
                          {expandedOrders.has(order.id) ? (
                      [Cdown]  
                          ) : (
                    

                                [Cright]
                          )}
                        </button>
                      )}
                      <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                        {order.orderId}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                      {formatCurrency(order.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                      {order.numberOfStores}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                      {order.date}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-[#F75803] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium hover:underline transition-all"
                    >
                      Details
                    </button>
                  </td>
                </tr>

                {/* Expanded Items Rows */}
                {expandedOrders.has(order.id) &&
                  order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-[#F7F7F7] border-b border-[#E4E4E4]"
                    >
                      <td className="py-3 px-4 pl-12">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded overflow-hidden bg-gray-200 flex-shrink-0 border border-[#E4E4E4]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                                ?
                              </div>
                            )}
                          </div>
                          <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          {formatCurrency(item.price)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          {item.creator}
                        </span>
                      </td>
                      <td className="py-3 px-4" >
                        <div className="flex items-center justify-between">
                          <div>
                            {item.status === "DELIVERED" && (
                              <span className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] bg-[#2BAC47] text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium">
                                DELIVERED
                              </span>
                            )}
                            {item.status === "PROCESSING" && (
                              <span className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] bg-[#C83532] text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium">
                                PROCESSING
                              </span>
                            )}
                            {item.status === "SHIPPED" && (
                              <span className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] bg-[#EF8943] text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium">
                                SHIPPED
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                        <td className="py-3 px-4" colSpan={2}>
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                      {order.date}
                    </span>
                      </td>

                    </tr>
                  ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p className="INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          SHOWING {showingStart}-{showingEnd} OF {totalOrders.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
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
            disabled={showingEnd >= totalOrders}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <Image
              src="/icons/forwardbutton.svg"
              height={20}
              width={20}
              alt="next"
            />
          </Button>
        </div>
      </div>

      {/* Order Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent className="h-full max-w-[450px] w-full ml-auto bg-white text-black md:rounded-tl-lg rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none [&>div:first-child]:hidden overflow-x-hidden">
          <div className="flex flex-col h-full w-full">
            <DrawerHeader className="px-[24px] py-[32px]">
              <div className="flex items-center justify-between">
                <DrawerTitle className="INT500 font-medium text-[20px] leading-[28px] text-[#111810]">
                  Order Details
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#373737] hover:bg-[#F1F1F1] rounded-full h-[32px] w-[32px] border border-[#F1F1F1]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto relative">
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="flex flex-col items-start gap-[12px] px-[24px]">
                    <Avatar className="h-[56px] w-[56px] ">
                      <AvatarImage src={selectedOrder.customer.avatar} />
                      <AvatarFallback className="bg-[#F7F7F7] text-[#373737] border-2 border-[#F1F1F1]">
                        {selectedOrder.customer.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-[#111810] INT500 font-medium text-[18px] leading-[24px] tracking-[-1.8%]">
                        {selectedOrder.customer.name}
                      </h3>
                      <p className="text-[#808080] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                        {selectedOrder.customer.username} •{" "}
                        {selectedOrder.customer.tier}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t border-b border-[#E4E4E4] px-[24px] py-[32px]">
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-2">
                      Shipping Address
                    </h4>
                    <p className="text-[#111810] INT400 text-[14px] leading-[20px] tracking-[-1.8%] mt-[20px]">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>

                  {/* Item Summary */}
                  <div className="px-[24px]">
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-4">
                      Item Summary
                    </h4>
                    <div className="space-y-[20px] mt-[20px]">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                ?
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                              {item.name}
                            </p>
                            <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-[#F7F7F7] border border-[#F1F1F1] px-[24px] py-[20px] ">
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                      Payment Summary
                    </h4>
                    <div className="space-y-3 py-[20px]">
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Total Items ({selectedOrder.items.length})
                        </span>
                        <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                          {formatCurrency(
                            calculateOrderTotals(selectedOrder).itemsTotal
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Shipping
                        </span>
                        <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                          {formatCurrency(123849)}
                        </span>
                      </div>
                      <div className="pt-[16px] mt-[20px] border-t border-[#E4E4E4] flex justify-between">
                        <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                          Total Paid
                        </span>
                        <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                          {formatCurrency(
                            calculateOrderTotals(selectedOrder).total
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default OrdersPage;
