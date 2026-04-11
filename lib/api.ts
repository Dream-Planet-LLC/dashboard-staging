// API utility functions for the dashboard

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// Overview API
export const fetchOverviewData = async (): Promise<OverviewData> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null;
    const url = `${API_BASE_URL}/admin/digital-store-overview`;
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    };

    const postResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    const response =
      postResponse.status === 404 || postResponse.status === 405
        ? await fetch(url, { method: "GET", headers })
        : postResponse;
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiResponse: OverviewAPIResponse = await response.json();
    
    // Check if API returned an error
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }
    
    // Transform API response to match our OverviewData interface
    const payload =
      apiResponse?.data?.response ?? apiResponse?.response ?? apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }
    const stats = payload.stats || {};
    const latest_10_products = Array.isArray(payload.latest_10_products)
      ? payload.latest_10_products
      : [];
    
    return {
      salesRevenue: stats.total_sales_revenue || 0,
      platformRevenue: stats.platform_revenue || 0,
      orders: stats.total_orders || 0,
      sellers: stats.total_sellers || 0,
      buyers: stats.total_buyers || 0,
      liveProducts: stats.total_live_products || 0,
      recentProducts: latest_10_products.map((product) => ({
        id: product.id || "",
        name: product.name || "Unknown Product",
        type: product.type || "Unknown",
        price: product.price || 0,
        creator: product.creator || "Unknown",
        date: product.date || new Date().toISOString(),
        previewImage: product.previewImage || null,
        mediaType: product.mediaType || null,
      })),
    };
  } catch (error) {
    console.error("Error fetching overview data:", error);
    throw error;
  }
};

// Orders API
export const fetchOrdersData = async (
  page: number,
  perPage: number,
): Promise<OrdersData> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null;
    const response = await fetch(`${API_BASE_URL}/admin/get-all-orders`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page, perPage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: OrdersApiResponse = await response.json();

    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload =
      apiResponse?.data?.response ?? apiResponse?.response ?? apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    const docs = Array.isArray(payload.docs) ? payload.docs : [];

    const orders: Order[] = docs.map((doc: OrdersDoc, index: number) => {
      const orderIdValue = doc.order_id ?? doc.id ?? index + 1;
      const buyer = doc.buyer || {};
      const items = Array.isArray(doc.items) ? doc.items : [];
      const formattedItems: OrderItem[] = items.map(
        (item: OrdersItem, itemIndex: number) => {
          const rawStatus = (item.status || "").toString().toUpperCase();
          const normalizedStatus =
            rawStatus === "DELIVERED" || rawStatus === "SHIPPED"
              ? rawStatus
              : "PROCESSING";
          const creator = item.creator_username
            ? item.creator_username.startsWith("@")
              ? item.creator_username
              : `@${item.creator_username}`
            : "Unknown";
          return {
            id: item.id || `${orderIdValue}-${itemIndex}`,
            name: item.name || "Unknown Item",
            price: item.amount || 0,
            creator,
            status: normalizedStatus,
            image: item.image || undefined,
            quantity: item.quantity || 1,
          };
        },
      );

      const buyerName =
        buyer.name ||
        buyer.username ||
        buyer.email ||
        "Unknown Customer";
      const username = buyer.username
        ? buyer.username.startsWith("@")
          ? buyer.username
          : `@${buyer.username}`
        : "Unknown";
      const tier = buyer.subscription_type || "Unknown";

      return {
        id: String(orderIdValue),
        orderId: `Order #${orderIdValue}`,
        amount: doc.amount_spent || 0,
        numberOfStores: doc.no_of_stores_ordered_from || 0,
        status: doc.items_status_summary || "N/A",
        date: doc.date || "",
        items: formattedItems,
        customer: {
          name: buyerName,
          username,
          avatar: buyer.image || undefined,
          tier,
        },
        shippingAddress:
          typeof doc.shipping_address === "string"
            ? doc.shipping_address
            : "N/A",
        paymentSummary: doc.payment_summary
          ? {
              subtotal: doc.payment_summary.subtotal || 0,
              shippingFee: doc.payment_summary.shipping_fee || 0,
              totalPaid: doc.payment_summary.total_paid || 0,
            }
          : undefined,
      };
    });

    return {
      orders,
      pagination: {
        totalDocs: payload.totalDocs || 0,
        limit: payload.limit || perPage,
        page: payload.page || page,
        totalPages: payload.totalPages || 0,
        hasPrevPage: Boolean(payload.hasPrevPage),
        hasNextPage: Boolean(payload.hasNextPage),
        prevPage: payload.prevPage || 0,
        nextPage: payload.nextPage || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching orders data:", error);
    throw error;
  }
};

// Types for API responses
interface Stats {
  total_sales_revenue: number;
  platform_revenue: number;
  total_orders: number;
  total_sellers: number;
  total_buyers: number;
  total_live_products: number;
}

interface LatestProduct {
  id?: string | number;
  name?: string;
  type?: string;
  price?: number;
  creator?: string;
  date?: string;
  previewImage?: string | null;
  mediaType?: "image" | "video" | "audio" | null;
}

interface OverviewResponse {
  stats: Stats;
  latest_10_products: LatestProduct[];
}

interface OverviewAPIResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: OverviewResponse;
  };
}

interface OverviewData {
  salesRevenue: number;
  platformRevenue: number;
  orders: number;
  sellers: number;
  buyers: number;
  liveProducts: number;
  recentProducts: LatestProduct[];
}

interface OrdersApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: OrdersResponse;
  };
}

interface OrdersResponse {
  docs: OrdersDoc[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

interface OrdersDoc {
  id?: string | number;
  order_id?: string | number;
  amount_spent?: number;
  no_of_stores_ordered_from?: number;
  items_status_summary?: string;
  date?: string;
  buyer?: {
    name?: string;
    image?: string;
    username?: string;
    email?: string;
    subscription_type?: string;
    verification_type?: string;
  };
  shipping_address?: string | Record<string, unknown>;
  items?: OrdersItem[];
  payment_summary?: {
    subtotal?: number;
    shipping_fee?: number;
    total_paid?: number;
  };
}

interface OrdersItem {
  id?: string | number;
  image?: string;
  name?: string;
  amount?: number;
  creator_username?: string;
  status?: string;
  date_ordered?: string;
  quantity?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  creator: string;
  status: "DELIVERED" | "PROCESSING" | "SHIPPED";
  image?: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderId: string;
  amount: number;
  numberOfStores: number;
  status: string;
  date: string;
  items: OrderItem[];
  customer: {
    name: string;
    username: string;
    avatar?: string;
    tier: string;
  };
  shippingAddress: string;
  paymentSummary?: {
    subtotal: number;
    shippingFee: number;
    totalPaid: number;
  };
}

export interface OrdersPagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

export interface OrdersData {
  orders: Order[];
  pagination: OrdersPagination;
}
