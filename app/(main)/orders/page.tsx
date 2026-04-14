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
import { fetchOrdersData, Order, OrdersPagination } from "@/lib/api";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

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

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<OrdersPagination | null>(null);
  const pageSize = 20;
  const totalOrders = pagination?.totalDocs || 0;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrdersData(currentPage, pageSize);
        setOrders(data.orders);
        setPagination(data.pagination);
        setExpandedOrders(new Set());
      } catch (err) {
        console.error(err);
        setOrders([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, pageSize]);

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

  const getPaymentSummary = (order: Order) => {
    const fees = order.orderFees?.fees || [];
    const subtotal = order.paymentSummary?.subtotal ?? 0;
    const shipping = order.paymentSummary?.shippingFee ?? 0;
    const totalPaid =
      order.paymentSummary?.totalPaid ??
      order.orderFees?.userTotal ??
      order.orderTotalAmount ??
      0;
    return { fees, subtotal, shipping, totalPaid };
  };

  const showingStart =
    totalOrders === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd =
    totalOrders === 0
      ? 0
      : Math.min(showingStart + pageSize - 1, totalOrders);

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
        Track customer purchases and fulfillment progress.
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
                      {formatDate(order.date)}
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
                      {formatDate(order.date)}
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
            disabled={!pagination?.hasPrevPage}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
            disabled={!pagination?.hasNextPage}
            onClick={() => setCurrentPage((prev) => prev + 1)}
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
                      {selectedOrder.shippingAddress || "N/A"}
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
                      {getPaymentSummary(selectedOrder).fees.length > 0 ? (
                        getPaymentSummary(selectedOrder).fees.map((fee, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                              {fee.name}
                            </span>
                            <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                              {formatCurrency(fee.price)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                              Subtotal
                            </span>
                            <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                              {formatCurrency(
                                getPaymentSummary(selectedOrder).subtotal,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                              Shipping
                            </span>
                            <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                              {formatCurrency(
                                getPaymentSummary(selectedOrder).shipping,
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="pt-[16px] mt-[20px] border-t border-[#E4E4E4] flex justify-between">
                        <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                          Total Paid
                        </span>
                        <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                          {formatCurrency(
                            getPaymentSummary(selectedOrder).totalPaid,
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
