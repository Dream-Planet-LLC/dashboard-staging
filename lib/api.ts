// API utility functions for the dashboard

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export interface AdminUserDetails {
  id: string | number;
  email?: string;
  full_name?: string;
  username?: string;
  user_type?: string;
  image?: string;
  status?: string;
  phone_number?: string;
  country?: string;
  noOfMembers?: number;
  noOfPosts?: number;
  noOfInvestor?: number;
  interested_creators?: number;
  createdAt?: string;
  referral_link?: string;
}

interface AdminUserDetailsApiResponse {
  error: boolean;
  code?: number;
  message?: string;
  data?: AdminUserDetails | { response?: AdminUserDetails };
  response?: AdminUserDetails;
}

export const fetchAdminUserDetails = async (
  userId: string | number,
): Promise<AdminUserDetails> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/details`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: AdminUserDetailsApiResponse = await response.json();
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const dataPayload = apiResponse.data as
      | AdminUserDetails
      | { response?: AdminUserDetails }
      | undefined;
    const nestedPayload =
      dataPayload && "response" in dataPayload
        ? dataPayload.response
        : undefined;
    const payload: AdminUserDetails | undefined =
      apiResponse.response ??
      nestedPayload ??
      (dataPayload as AdminUserDetails | undefined);

    if (!payload || !payload.id) {
      throw new Error("Unexpected API response shape");
    }

    return payload as AdminUserDetails;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

// Overview API
export const fetchOverviewData = async (): Promise<OverviewData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
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
      recentProducts: latest_10_products.map((product: any) => ({
        id: product.id || "",
        name: product.title || "Unknown Product",
        type: product.type || "Unknown",
        price: product.price || 0,
        creator: product.creator_name || "Unknown",
        date: product.createdAt || new Date().toISOString(),
        previewImage: product.creator_image || null,
        mediaType: product.mediaType || null,
      })),
    };
  } catch (error) {
    console.error("Error fetching overview data:", error);
    throw error;
  }
};

// Buyer Insight Overview API
export const fetchBuyerInsightOverview =
  async (): Promise<BuyerInsightData> => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const url = `${API_BASE_URL}/admin/get-buyer-insight-overview`;
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

      const apiResponse: BuyerInsightApiResponse = await response.json();
      if (apiResponse.error) {
        throw new Error(apiResponse.message || "API returned an error");
      }

      const payload =
        apiResponse?.data?.response ??
        apiResponse?.response ??
        apiResponse?.data;
      if (!payload) {
        throw new Error("Unexpected API response shape");
      }

      const stats = payload.stats || {};
      const retention = payload.buyer_retention || {};
      const topEngaging = Array.isArray(payload.top_engaging_buyers)
        ? payload.top_engaging_buyers
        : [];

      return {
        stats: {
          totalFans: stats.total_fans || 0,
          activeBuyers: stats.total_active_buyers || 0,
          dormantBuyers: stats.total_dormant_buyers || 0,
          buyerGrowth: 0,
          buyerGrowthChange: 0,
          buyerRetention: {
            repeat: retention.total_repeat_buyers || 0,
            oneTime: retention.total_one_time_buyers || 0,
          },
        },
        topBuyers: topEngaging.map(
          (buyer: BuyerInsightTopBuyer, index: number) => {
            const rawUsername = buyer.username || "";
            const username =
              rawUsername.length > 0
                ? rawUsername.startsWith("@")
                  ? rawUsername
                  : `@${rawUsername}`
                : "@unknown";
            return {
              id: buyer.buyer_id ? String(buyer.buyer_id) : String(index + 1),
              fan: {
                name: buyer.name || "Unknown Buyer",
                username,
                avatar: buyer.image || undefined,
              },
              totalSpent: buyer.total_spent || 0,
              lastPurchase: buyer.last_purchase_date || "",
            };
          },
        ),
      };
    } catch (error) {
      console.error("Error fetching buyer insight overview:", error);
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
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
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
            id:
              item.id !== undefined && item.id !== null
                ? String(item.id)
                : `${orderIdValue}-${itemIndex}`,
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
        buyer.name || buyer.username || buyer.email || "Unknown Customer";
      const username = buyer.username
        ? buyer.username.startsWith("@")
          ? buyer.username
          : `@${buyer.username}`
        : "Unknown";
      const tier = buyer.subscription_type || "Unknown";

      const address = doc.shipping_address || (doc?.shipping_info as any);
      const add = address?.delivery_address?.formatted_address || "N/A";

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
        shippingAddress: add,
        paymentSummary: doc.payment_summary
          ? {
              subtotal: doc.payment_summary.subtotal || 0,
              shippingFee: doc.payment_summary.shipping_fee || 0,
              totalPaid: doc.payment_summary.total_paid || 0,
            }
          : undefined,
        orderFees: doc.order?.order_fees
          ? {
              fees: Array.isArray(doc.order.order_fees.fees)
                ? doc.order.order_fees.fees.map((fee: OrderFeeItem) => ({
                    name: fee.name || "Fee",
                    price: fee.price || 0,
                  }))
                : [],
              subTotal: doc.order.order_fees.sub_total || 0,
              userTotal: doc.order.order_fees.user_total || 0,
              serviceFee: doc.order.order_fees.service_fee || 0,
              shippingFee:
                doc.order.order_fees.shipping_fee ||
                doc.order.shipping_fee ||
                0,
              originalTotal: doc.order.order_fees.original_total || 0,
              cashbackDeductedTotal:
                doc.order.order_fees.cashback_deducted_total || 0,
            }
          : undefined,
        orderTotalAmount: doc.order?.total_amount || undefined,
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

// Payouts API
export const fetchPayoutsData = async (
  page: number,
  perPage: number,
  options?: { searchString?: string; status?: string },
): Promise<PayoutsData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const requestBody: {
      page: number;
      perPage: number;
      searchString?: string;
      status?: string;
    } = { page, perPage };
    if (options?.searchString) {
      requestBody.searchString = options.searchString;
    }
    if (options?.status) {
      requestBody.status = options.status;
    }
    const response = await fetch(`${API_BASE_URL}/admin/get-withdrawals`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: PayoutsApiResponse = await response.json();

    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload =
      apiResponse?.data?.response ?? apiResponse?.response ?? apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    const docs = Array.isArray(payload.docs) ? payload.docs : [];
    const stats = payload.stats || {};

    const payouts: Payout[] = docs.map((doc: PayoutDoc, index: number) => {
      const rawStatus = (doc.status || "").toString().toUpperCase();
      const normalizedStatus =
        rawStatus === "COMPLETED" || rawStatus === "FAILED"
          ? rawStatus
          : "PROCESSING";
      const username = doc.creator_username
        ? doc.creator_username.startsWith("@")
          ? doc.creator_username
          : `@${doc.creator_username}`
        : "Unknown";
      return {
        id: String(doc.withdrawal_id ?? index + 1),
        creator: {
          name: doc.creator_name || "Unknown Creator",
          username,
          avatar: doc.creator_image || undefined,
        },
        amount: doc.amount || 0,
        status: normalizedStatus,
        date: doc.date || "",
      };
    });

    return {
      payouts,
      stats: {
        totalProcessed: stats.total_processed_payouts || 0,
        pendingPayouts: stats.total_pending_payouts || 0,
        failedPayouts: stats.total_failed_payouts || 0,
      },
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
    console.error("Error fetching payouts data:", error);
    throw error;
  }
};

// Sellers Store API
export const fetchSellersStoreData = async (
  page: number,
  perPage: number,
  options?: { searchString?: string; sellerEligibilityStatus?: string },
): Promise<SellersStoreData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const requestBody: {
      page: number;
      perPage: number;
      searchString?: string;
      seller_eligibility_status?: string;
    } = { page, perPage };
    if (options?.searchString) {
      requestBody.searchString = options.searchString;
    }
    if (options?.sellerEligibilityStatus) {
      requestBody.seller_eligibility_status = options.sellerEligibilityStatus;
    }

    const response = await fetch(`${API_BASE_URL}/admin/creators/live-listed`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: SellersStoreApiResponse = await response.json();

    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload =
      apiResponse?.data?.response ?? apiResponse?.response ?? apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    const docs = Array.isArray(payload.docs) ? payload.docs : [];

    const sellers: SellerStore[] = docs.map(
      (doc: SellerStoreDoc, index: number) => {
        const rawStatus = (doc.seller_eligibility_status || "")
          .toString()
          .toUpperCase();
        const status =
          rawStatus === "ACTIVE" ||
          rawStatus === "SUSPENDED" ||
          rawStatus === "PENDING" ||
          rawStatus === "INACTIVE"
            ? (rawStatus as SellerStore["status"])
            : "ACTIVE";
        const username = doc.username
          ? doc.username.startsWith("@")
            ? doc.username
            : `@${doc.username}`
          : "Unknown";
        return {
          id: doc.creator_id ?? index + 1,
          name: doc.name || "Unknown Creator",
          username,
          avatarUrl: doc.image || undefined,
          status,
          liveProducts:
            typeof doc.no_of_live_products === "number"
              ? doc.no_of_live_products
              : null,
          totalEarnings: doc.total_earnings || 0,
          platformRevenue: doc.platform_revenue || 0,
          lastActivity: doc.last_item_bought_date || null,
        };
      },
    );

    return {
      sellers,
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
    console.error("Error fetching sellers store data:", error);
    throw error;
  }
};

export const fetchCreatorAnalytics = async (
  creatorId: string | number,
): Promise<CreatorAnalytics> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const response = await fetch(
      `${API_BASE_URL}/admin/get-creators-analytics`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creator_id: creatorId }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: CreatorAnalyticsApiResponse = await response.json();
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload =
      apiResponse?.data?.response ?? apiResponse?.response ?? apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    return {
      creatorName: payload.creator_name || "",
      username: payload.username || "",
      image: payload.image || undefined,
      statistics: {
        totalOrders: payload.statistics?.total_orders || 0,
        totalRevenue: payload.statistics?.total_revenue || 0,
        totalMasterclassHosted:
          payload.statistics?.total_master_class_hosted || 0,
        totalHireRequest: payload.statistics?.total_hire_request || 0,
      },
      bestSellingProduct: payload.best_selling_product
        ? {
            image: payload.best_selling_product.image || undefined,
            quantitySold: payload.best_selling_product.quantity_sold || 0,
            totalRevenue: payload.best_selling_product.total_revenue || 0,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching creator analytics:", error);
    throw error;
  }
};

export const updateSellerEligibilityStatus = async (
  creatorId: string | number,
  sellerEligibilityStatus: string,
): Promise<void> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const response = await fetch(
      `${API_BASE_URL}/admin/creators/update-seller-eligibility`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator_id: creatorId,
          seller_eligibility_status: sellerEligibilityStatus,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: UpdateSellerEligibilityApiResponse =
      await response.json();
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }
  } catch (error) {
    console.error("Error updating seller eligibility:", error);
    throw error;
  }
};

// Seller Store Details API
export const fetchCreatorStoreDetails = async (
  creatorId: string | number,
  page: number,
  perPage: number,
  options?: { searchString?: string },
): Promise<CreatorStoreData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const requestBody: {
      creator_id: string | number;
      page: number;
      perPage: number;
      searchString?: string;
    } = { creator_id: creatorId, page, perPage };
    if (options?.searchString) {
      requestBody.searchString = options.searchString;
    }

    const response = await fetch(`${API_BASE_URL}/admin/creators/details`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: CreatorStoreApiResponse = await response.json();

    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload =
      apiResponse?.data?.response ?? apiResponse?.response ?? apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    const creatorPayload = payload.creator || {};
    const productsPayload = payload.products || {};
    const docs = Array.isArray(productsPayload.docs)
      ? productsPayload.docs
      : [];

    const username = creatorPayload.username
      ? creatorPayload.username.startsWith("@")
        ? creatorPayload.username
        : `@${creatorPayload.username}`
      : "Unknown";
    const roleParts = [
      creatorPayload.subscription_plan,
      creatorPayload.content_creator_type,
    ].filter(Boolean);
    const role = roleParts.length ? roleParts.join(" • ") : "Creator";

    const creator: CreatorStoreCreator = {
      id: creatorPayload.creator_id ?? creatorId,
      name: creatorPayload.name || "Unknown Creator",
      username,
      avatarUrl: creatorPayload.image || undefined,
      contentCreatorType: creatorPayload.content_creator_type || undefined,
      subscriptionPlan: creatorPayload.subscription_plan || undefined,
      sellerEligibilityStatus:
        creatorPayload.seller_eligibility_status || undefined,
      role,
    };

    const products: CreatorStoreProduct[] = docs.map(
      (doc: CreatorStoreProductDoc, index: number) => {
        const rawType = (doc.type || "").toString();
        const normalizedType =
          rawType.length > 0
            ? rawType.charAt(0).toUpperCase() + rawType.slice(1)
            : "Unknown";
        const rawStatus = (doc.status || "").toString().toLowerCase();
        const normalizedStatus =
          rawStatus === "published" ||
          rawStatus === "unpublished" ||
          rawStatus === "suspended"
            ? (rawStatus as CreatorStoreProduct["status"])
            : undefined;
        return {
          id: doc.id ?? index + 1,
          name: doc.name || "Unknown Product",
          type: normalizedType,
          price: doc.price || 0,
          creator: username,
          unitsSold: typeof doc.unit_sold === "number" ? doc.unit_sold : 0,
          uploadedDate: doc.uploaded_date || "",
          previewImage: doc.image || null,
          status: normalizedStatus,
        };
      },
    );

    return {
      creator,
      products,
      pagination: {
        totalDocs: productsPayload.totalDocs || 0,
        limit: productsPayload.limit || perPage,
        page: productsPayload.page || page,
        totalPages: productsPayload.totalPages || 0,
        hasPrevPage: Boolean(productsPayload.hasPrevPage),
        hasNextPage: Boolean(productsPayload.hasNextPage),
        prevPage: productsPayload.prevPage || 0,
        nextPage: productsPayload.nextPage || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching creator store details:", error);
    throw error;
  }
};

// Product Catalogue API
export const fetchProductCatalogueData = async (
  page: number,
  perPage: number,
  options?: { status?: string; type?: string; searchString?: string },
): Promise<ProductCatalogueData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const requestBody: {
      page: number;
      perPage: number;
      status?: string;
      type?: string;
      searchString?: string;
    } = { page, perPage };
    if (options?.status) requestBody.status = options.status;
    if (options?.type) requestBody.type = options.type;
    if (options?.searchString) requestBody.searchString = options.searchString;

    const response = await fetch(`${API_BASE_URL}/store/admin/products/list`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ProductCatalogueApiResponse = await response.json();
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const rawPayload =
      apiResponse?.data?.data ??
      apiResponse?.data?.response ??
      apiResponse?.response ??
      apiResponse?.data;
    const payload =
      rawPayload &&
      typeof rawPayload === "object" &&
      Array.isArray((rawPayload as ProductCatalogueResponse).docs)
        ? (rawPayload as ProductCatalogueResponse)
        : undefined;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    const docs = Array.isArray(payload.docs) ? payload.docs : [];
    const products: ProductCatalogueItem[] = docs.map(
      (doc: ProductCatalogueDoc, index: number) => {
        const rawStatus = (doc.status || "").toString().toLowerCase();
        const status = rawStatus; //=== "live" ? "LISTED" : "SUSPENDED";
        const type = doc.type
          ? doc.type.charAt(0).toUpperCase() + doc.type.slice(1)
          : "Unknown";
        const creator = doc.creatorUsername
          ? doc.creatorUsername.startsWith("@")
            ? doc.creatorUsername
            : `@${doc.creatorUsername}`
          : "Unknown";
        return {
          id: String(doc.id ?? index + 1),
          name: doc.name || "Unknown Product",
          productType: type,
          price: doc.price || 0,
          status,
          creator,
          creatorId: doc.creatorId,
          date: doc.createdAt || "",
          image: doc.image || undefined,
        };
      },
    );

    return {
      products,
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
    console.error("Error fetching product catalogue:", error);
    throw error;
  }
};

export const deleteStoreItem = async (
  itemId: string | number,
): Promise<void> => {
  try {
    const resolvedId =
      typeof itemId === "string" &&
      itemId.trim() !== "" &&
      !Number.isNaN(Number(itemId))
        ? Number(itemId)
        : itemId;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${API_BASE_URL}/admin/delete-store-item`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: resolvedId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: DeleteStoreItemApiResponse = await response.json();
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }
  } catch (error) {
    console.error("Error deleting store item:", error);
    throw error;
  }
};

export const updateStoreItemStatus = async (
  itemId: string | number,
  status: "suspended" | "active" | "listed",
): Promise<void> => {
  try {
    const resolvedId =
      typeof itemId === "string" &&
      itemId.trim() !== "" &&
      !Number.isNaN(Number(itemId))
        ? Number(itemId)
        : itemId;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${API_BASE_URL}/admin/items/update-status`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item_id: resolvedId, status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: UpdateStoreItemStatusApiResponse = await response.json();
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }
  } catch (error) {
    console.error("Error updating store item status:", error);
    throw error;
  }
};

// Buyer Purchase Reference API
export const fetchBuyerPurchaseReference =
  async (): Promise<BuyerPurchaseReferenceData> => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const url = `${API_BASE_URL}/admin/buyer-purchase-reference`;
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

      const apiResponse: BuyerPurchaseReferenceApiResponse =
        await response.json();
      if (apiResponse.error) {
        throw new Error(apiResponse.message || "API returned an error");
      }

      const payload =
        apiResponse?.data?.response ??
        apiResponse?.data?.data ??
        apiResponse?.response ??
        apiResponse?.data;
      if (!payload) {
        throw new Error("Unexpected API response shape");
      }

      // Color mapping for categories
      const getColorForCategory = (category: string): string => {
        const colors: Record<string, string> = {
          audio: "#2CAB5B",
          video: "#DD3B83",
          podcast: "#249D92",
          ebook: "#EB6723",
          masterclass: "#884CED",
          merchandise: "#CE941C",
          tickets: "#3971EB",
          hire: "#063D90",
        };
        return colors[category.toLowerCase()] || "#A8A8A8";
      };

      // Transform categories data
      const categoriesPayload = Array.isArray(payload.categories)
        ? payload.categories
        : [];
      const categories = categoriesPayload.map(
        (cat: BuyerPurchaseReferenceCategory) => {
          const rawCategory = (cat.category || "Unknown").toString();
          const name =
            rawCategory.length > 0
              ? rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1)
              : "Unknown";
          return {
            name,
            units: Number(cat.total_quantity_sold) || 0,
            orders: Number(cat.total_orders) || 0,
            amountMade: Number(cat.total_amount_made) || 0,
            color: getColorForCategory(rawCategory),
          };
        },
      );

      // Transform revenue shares
      const revenueShares = categoriesPayload.map(
        (cat: BuyerPurchaseReferenceCategory) => {
          const rawCategory = (cat.category || "Unknown").toString();
          const category =
            rawCategory.length > 0
              ? rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1)
              : "Unknown";
          return {
            category,
            percentage: Number(cat.percentage_of_total_revenue) || 0,
            color: getColorForCategory(rawCategory),
          };
        },
      );

      return {
        totalRevenue: Number(payload.total_gross_revenue) || 0,
        categories,
        revenueShares,
      };
    } catch (error) {
      console.error("Error fetching buyer purchase reference:", error);
      throw error;
    }
  };

export const createFeaturedSection = async (payload: {
  name: string;
  productIds: (string | number)[];
  promotionEnabled: boolean;
  promotionPercentage: number;
}): Promise<FeaturedSectionResponse> => {
  try {
    const token =
      typeof window != "undefined" ? localStorage.getItem("auth_token") : null;

    const requestBody = {
      name: payload.name,
      product_ids: payload.productIds,
      promotion_enabled: payload.promotionEnabled,
      promotion_percentage: payload.promotionPercentage,
    };
    
    console.log("Creating section with payload:", requestBody);
    
    const response = await fetch(
      `${API_BASE_URL}/store/admin/create-sections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestBody),
      },
    );


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: FeaturedSectionApiResponse = await response.json();


    if(apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const raw = apiResponse?.data;

    if (!raw) {
      throw new Error ("Unexpected API response")
    }

    // Use any type to handle dynamic response structure
    const responseData = raw as any;
    
    return {
      id: responseData.id,
      name: responseData.name,
      promotionEnabled: responseData.promotion_enabled,
      promotionPercentage: parseFloat(String(responseData.promotion_percentage || "0")) || 0,
      itemsCount: responseData.items_count || 0,
    };

  } catch (error) {
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
  data?: OverviewResponse & {
    response?: OverviewResponse;
  };
  response?: OverviewResponse;
}

interface BuyerInsightApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: {
      stats?: {
        total_fans?: number;
        total_active_buyers?: number;
        total_dormant_buyers?: number;
      };
      buyer_retention?: {
        total_repeat_buyers?: number;
        total_one_time_buyers?: number;
      };
      top_engaging_buyers?: BuyerInsightTopBuyer[];
    };
  };
  response?: BuyerInsightApiResponse;
}

interface BuyerInsightTopBuyer {
  buyer_id?: number | string;
  name?: string;
  username?: string;
  image?: string | null;
  total_spent?: number;
  last_purchase_date?: string;
}

export interface BuyerInsightData {
  stats: {
    totalFans: number;
    activeBuyers: number;
    dormantBuyers: number;
    buyerGrowth: number;
    buyerGrowthChange: number;
    buyerRetention: {
      repeat: number;
      oneTime: number;
    };
  };
  topBuyers: {
    id: string;
    fan: {
      name: string;
      username: string;
      avatar?: string;
    };
    totalSpent: number;
    lastPurchase: string;
  }[];
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
  response?: OrdersResponse;
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
  shipping_address?: any;
  shipping_info?: any;
  items?: OrdersItem[];
  payment_summary?: {
    subtotal?: number;
    shipping_fee?: number;
    total_paid?: number;
  };
  order?: {
    shipping_fee?: number;
    total_amount?: number;
    order_fees?: {
      fees?: OrderFeeItem[];
      sub_total?: number;
      user_total?: number;
      service_fee?: number;
      shipping_fee?: number;
      original_total?: number;
      cashback_deducted_total?: number;
    };
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

interface OrderFeeItem {
  name?: string;
  price?: number;
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
  orderFees?: {
    fees: Array<{ name: string; price: number }>;
    subTotal: number;
    userTotal: number;
    serviceFee: number;
    shippingFee: number;
    originalTotal: number;
    cashbackDeductedTotal: number;
  };
  orderTotalAmount?: number;
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

interface PayoutsApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: PayoutsResponse;
  };
  response?: PayoutsResponse;
}

interface PayoutsResponse {
  docs: PayoutDoc[];
  stats: {
    total_processed_payouts?: number;
    total_pending_payouts?: number;
    total_failed_payouts?: number;
  };
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

interface PayoutDoc {
  withdrawal_id?: string | number;
  creator_name?: string;
  creator_image?: string;
  creator_username?: string;
  amount?: number;
  status?: string;
  date?: string;
}

export interface Payout {
  id: string;
  creator: {
    name: string;
    username: string;
    avatar?: string;
  };
  amount: number;
  status: "COMPLETED" | "FAILED" | "PROCESSING";
  date: string;
}

export interface PayoutStats {
  totalProcessed: number;
  pendingPayouts: number;
  failedPayouts: number;
}

export interface PayoutsPagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

export interface PayoutsData {
  payouts: Payout[];
  stats: PayoutStats;
  pagination: PayoutsPagination;
}

interface SellersStoreApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: SellersStoreResponse;
  };

  response?: SellersStoreResponse;
}

interface CreatorAnalyticsApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: {
      creator_name?: string;
      username?: string;
      image?: string;
      statistics?: {
        total_orders?: number;
        total_revenue?: number;
        total_master_class_hosted?: number;
        total_hire_request?: number;
      };
      best_selling_product?: {
        image?: string;
        quantity_sold?: number;
        total_revenue?: number;
      };
    };
  };
  response?: CreatorAnalyticsApiResponse;
}

export interface CreatorAnalytics {
  creatorName: string;
  username: string;
  image?: string;
  statistics: {
    totalOrders: number;
    totalRevenue: number;
    totalMasterclassHosted: number;
    totalHireRequest: number;
  };
  bestSellingProduct?: {
    image?: string;
    quantitySold: number;
    totalRevenue: number;
  };
}

interface SellersStoreResponse {
  docs: SellerStoreDoc[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

interface SellerStoreDoc {
  creator_id?: string | number;
  name?: string;
  image?: string;
  username?: string;
  no_of_live_products?: number;
  total_earnings?: number;
  platform_revenue?: number;
  last_item_bought_date?: string;
  seller_eligibility_status?: string;
}

export interface SellerStore {
  id: string | number;
  name: string;
  username: string;
  avatarUrl?: string;
  role?: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | "INACTIVE";
  liveProducts: number | null;
  totalEarnings: number;
  platformRevenue: number;
  lastActivity: string | null;
  analytics?: {
    totalOrders: number;
    totalRevenue: number;
    masterclassHosted: number;
    hireRequests: number;
    bestSellingProduct?: { name: string; image?: string };
    unitsSold: number;
    revenue: number;
  };
}

export interface SellersStorePagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

export interface SellersStoreData {
  sellers: SellerStore[];
  pagination: SellersStorePagination;
}

interface UpdateSellerEligibilityApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: {
      id: string | number;
      full_name: string;
      username: string;
      image?: string;
      seller_eligibility_status: string;
    };
  };
}

interface CreatorStoreApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: CreatorStoreResponse;
  };
  response?: CreatorStoreResponse;
}

interface CreatorStoreResponse {
  creator: CreatorStoreCreatorPayload;
  products: CreatorStoreProductsPayload;
}

interface CreatorStoreCreatorPayload {
  creator_id?: string | number;
  name?: string;
  image?: string;
  username?: string;
  content_creator_type?: string;
  subscription_plan?: string;
  seller_eligibility_status?: string;
}

interface CreatorStoreProductsPayload {
  docs: CreatorStoreProductDoc[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

interface CreatorStoreProductDoc {
  id?: string | number;
  name?: string;
  image?: string;
  type?: string;
  price?: number;
  unit_sold?: number;
  uploaded_date?: string;
  status?: string;
}

export interface CreatorStoreCreator {
  id: string | number;
  name: string;
  username: string;
  avatarUrl?: string;
  contentCreatorType?: string;
  subscriptionPlan?: string;
  sellerEligibilityStatus?: string;
  role: string;
}

export interface CreatorStoreProduct {
  id: string | number;
  name: string;
  type: string;
  price: number;
  creator: string;
  unitsSold: number | string;
  uploadedDate: string;
  previewImage?: string | null;
  status?: "published" | "unpublished" | "suspended";
}

export interface CreatorStorePagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

export interface CreatorStoreData {
  creator: CreatorStoreCreator;
  products: CreatorStoreProduct[];
  pagination: CreatorStorePagination;
}

interface ProductCatalogueApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    data?: ProductCatalogueResponse;
    response?: ProductCatalogueResponse;
  };
  response?: ProductCatalogueResponse;
}

interface ProductCatalogueResponse {
  docs: ProductCatalogueDoc[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

interface ProductCatalogueDoc {
  id?: string | number;
  image?: string;
  name?: string;
  type?: string;
  price?: number;
  status?: string;
  creatorUsername?: string;
  creatorId?: number;
  createdAt?: string;
}

export interface ProductCatalogueItem {
  id: string;
  name: string;
  productType: string;
  price: number;
  status: string;
  creator: string;
  creatorId: number | undefined;
  date: string;
  image?: string;
}

export interface ProductCataloguePagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

export interface ProductCatalogueData {
  products: ProductCatalogueItem[];
  pagination: ProductCataloguePagination;
}

interface FeaturedSectionApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    data?: {
      id: number;
      name: string;
      promotion_enabled: boolean;
    };
    response?: FeaturedSectionRawResponse;
  };
  response?: FeaturedSectionRawResponse;
}

interface FeaturedSectionRawResponse {
  id: number;
  name: string;
  promotion_enabled: boolean;
  promotion_percentage: number;
  items_count: number;
}

export interface FeaturedSectionResponse {
  id: number;
  name: string;
  promotionEnabled: boolean;
  promotionPercentage: number;
  itemsCount: number;
}

interface DeleteStoreItemApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: {
      deleted: boolean;
      id: number | string;
    };
  };
}

interface UpdateStoreItemStatusApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    response: {
      id: number | string;
      status: string;
      updatedAt?: string;
    };
  };
}

// Buyer Purchase Reference API
interface BuyerPurchaseReferenceApiResponse {
  error: boolean;
  code: number;
  message: string;
  data: {
    data: any;
    response: BuyerPurchaseReferenceResponse;
  };
  response?: BuyerPurchaseReferenceApiResponse;
}

interface BuyerPurchaseReferenceResponse {
  total_gross_revenue: number;
  categories: BuyerPurchaseReferenceCategory[];
}

interface BuyerPurchaseReferenceCategory {
  category: string;
  total_orders: number;
  total_quantity_sold: number;
  total_amount_made: number;
  percentage_of_total_revenue: number;
}

export interface BuyerPurchaseReferenceData {
  totalRevenue: number;
  categories: {
    name: string;
    units: number;
    orders: number;
    amountMade: number;
    color: string;
  }[];
  revenueShares: {
    category: string;
    percentage: number;
    color: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════
// SECTION MANAGEMENT API
// ═══════════════════════════════════════════════════════════════

// Get all sections
export const fetchSections = async (): Promise<SectionsData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    
    const response = await fetch(`${API_BASE_URL}/store/admin/get-sections`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: SectionsApiResponse = await response.json();
    
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload = apiResponse?.data;
    
    if (!payload || !Array.isArray(payload)) {
      // If no sections exist, return empty array
      if (Array.isArray(apiResponse?.data) && apiResponse.data.length === 0) {
        return { sections: [] };
      }
      throw new Error("Unexpected API response shape");
    }

    const sections: Section[] = payload.map((section: SectionDoc) => ({
      id: section.id,
      name: section.name,
      promotionEnabled: section.promotion_enabled,
      promotionPercentage: parseFloat(String(section.promotion_percentage || "0")) || 0,
      itemsCount: section.items_count || 0,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    }));

    return { sections };
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw error;
  }
};

// Update section
export const updateSection = async (payload: {
  id: number | string;
  name: string;
  productIds: (string | number)[];
  promotionEnabled: boolean;
  promotionPercentage: number;
}): Promise<SectionResponse> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(`${API_BASE_URL}/store/admin/update-section`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: payload.id,
        name: payload.name,
        product_ids: payload.productIds,
        promotion_enabled: payload.promotionEnabled,
        promotion_percentage: payload.promotionPercentage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: SectionApiResponse = await response.json();
    
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const responseData = apiResponse?.data;
    if (!responseData) {
      throw new Error("Unexpected API response shape");
    }

    return {
      id: responseData.id,
      name: responseData.name,
      promotionEnabled: responseData.promotion_enabled,
      promotionPercentage: parseFloat(String(responseData.promotion_percentage || "0")) || 0,
      itemsCount: responseData.items_count || 0,
    };
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const deleteSection = async (sectionId: number | string): Promise<void> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(`${API_BASE_URL}/store/admin/delete-section`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: sectionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: { error: boolean; message?: string } =
      await response.json();

    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
};

// Get section items by ID
export const getSectionItems = async (sectionId: number | string): Promise<SectionItemsData> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(`${API_BASE_URL}/store/admin/get-product-items-by-section-id`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section_id: sectionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: SectionItemsApiResponse = await response.json();
    
    if (apiResponse.error) {
      throw new Error(apiResponse.message || "API returned an error");
    }

    const payload = apiResponse?.data;
    if (!payload) {
      throw new Error("Unexpected API response shape");
    }

    const sectionData: Section = {
      id: payload.section.id,
      name: payload.section.name,
      promotionEnabled: payload.section.promotion_enabled,
      promotionPercentage: parseFloat(String(payload.section.promotion_percentage || "0")) || 0,
      itemsCount: payload.section.items_count || 0,
      createdAt: payload.section.createdAt,
      updatedAt: payload.section.updatedAt,
    };

    const items: SectionItem[] = Array.isArray(payload.items) 
      ? payload.items.map((item: SectionItemDoc) => {
          const rawItem = item as Record<string, any>;
          const type = String(item.type || "").trim().toLowerCase();
          const titleKeysByType: Record<string, string[]> = {
            audio: ["audio_title", "audio_category_name"],
            ebooks: ["ebooks_title"],
            ebook: ["ebooks_title"],
            instrumental: ["instrumental_name"],
            masterclass: ["masterclass_title"],
            merchandise: ["merchandise_title"],
            podcast: ["podcast_title"],
            tickets: ["tickets_title"],
            ticket: ["tickets_title"],
            video: ["video_title"],
          };
          const priceKeysByType: Record<string, string[]> = {
            audio: ["audio_price"],
            ebooks: ["ebooks_price"],
            ebook: ["ebooks_price"],
            instrumental: [],
            masterclass: ["masterclass_price"],
            merchandise: ["merchandise_price"],
            podcast: ["podcast_price"],
            tickets: ["tickets_price"],
            ticket: ["tickets_price"],
            video: ["video_price"],
          };
          const imageKeysByType: Record<string, string[]> = {
            audio: ["audio_cover_image"],
            ebooks: ["ebooks_cover_image"],
            ebook: ["ebooks_cover_image"],
            instrumental: ["instrumental_cover_image"],
            masterclass: ["masterclass_cover_image"],
            merchandise: [
              "merchandise_cover_image",
              "merchandise_product_mockup_image",
            ],
            podcast: ["podcast_cover_image"],
            tickets: ["tickets_cover_image"],
            ticket: ["tickets_cover_image"],
            video: ["video_cover_image"],
          };
          const firstValue = (keys: string[]) =>
            keys.map((key) => rawItem[key]).find((value) => value);
          const name =
            firstValue(["name", "title", ...(titleKeysByType[type] || [])]) ||
            "Unknown Product";
          const priceValue = firstValue([
            "price",
            ...(priceKeysByType[type] || []),
          ]);
          const image =
            firstValue(["image", "cover_image", ...(imageKeysByType[type] || [])]) ||
            "";
          const productType = item.type || "unknown";

          return {
            id: item.id,
            name: String(name),
            price: parseFloat(String(priceValue || "0")) || 0,
            image: String(image),
            creator: item.creator?.name || "",
            productType: productType,
            status: item.status,
            date: sectionData.createdAt || item.createdAt,
          };
        })
      : [];

    return { section: sectionData, items };
  } catch (error) {
    console.error("Error fetching section items:", error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// SECTION API TYPES
// ═══════════════════════════════════════════════════════════════

export interface Section {
  id: number | string;
  name: string;
  promotionEnabled: boolean;
  promotionPercentage: number;
  itemsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionItem {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  creator: string;
  productType: string;
  status?: string;
  date?: string;
}

export interface SectionsData {
  sections: Section[];
}

export interface SectionItemsData {
  section: Section;
  items: SectionItem[];
}

export interface SectionResponse {
  id: number | string;
  name: string;
  promotionEnabled: boolean;
  promotionPercentage: number;
  itemsCount: number;
}

// API Response Types
interface SectionsApiResponse {
  error: boolean;
  code?: number;
  message: string;
  data: SectionDoc[];
}

interface SectionApiResponse {
  error: boolean;
  code?: number;
  message: string;
  data: SectionDoc;
}

interface SectionItemsApiResponse {
  error: boolean;
  code?: number;
  message: string;
  data: {
    section: SectionDoc;
    items: SectionItemDoc[];
  };
}

interface SectionDoc {
  id: number | string;
  name: string;
  promotion_enabled: boolean;
  promotion_percentage?: string | number;
  items_count: number;
  createdAt?: string;
  updatedAt?: string;
}

interface SectionItemDoc {
  id: number | string;
  creators_id?: number;
  type: string;
  // Video fields
  video_title?: string;
  video_price?: string;
  video_description?: string;
  video_files?: string[];
  video_cover_image?: string;
  // Audio fields
  audio_title?: string;
  audio_price?: string;
  audio_description?: string;
  audio_cover_image?: string;
  audio_tracks?: any[];
  // Podcast fields
  podcast_title?: string;
  podcast_number_of_episodes?: number;
  podcast_price?: string;
  podcast_description?: string;
  podcast_cover_image?: string;
  podcast_episodes?: any[];
  // Merchandise fields
  merchandise_title?: string;
  merchandise_price?: string;
  merchandise_cover_image?: string;
  merchandise_size?: any[];
  merchandise_product_mockup_image?: string;
  merchandise_print_artwork_image?: string;
  // Ebooks fields
  ebooks_title?: string;
  ebooks_price?: string;
  ebooks_cover_image?: string;
  ebooks_description?: string;
  ebooks_files?: string[];
  // Tickets fields
  tickets_title?: string;
  tickets_price?: string;
  tickets_cover_image?: string;
  tickets_description?: string;
  tickets_date?: string;
  tickets_time?: string;
  tickets_location?: string;
  tickets_type?: string;
  tickets_files?: string[];
  // Common fields
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  creator?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface FeaturedSectionResponse {
  id: number;
  name: string;
  promotionEnabled: boolean;
  promotionPercentage: number;
  itemsCount: number;
}
