import {
  updateHistory,
  updatePaginationPayment,
  updateStats,
  updateSubscriptioncreator,
  updateSubscriptionfan,
  updateSubscriptioninvestor,
} from "@/redux/slices/paymentslice";

import { AppDispatch, RootState } from "@/redux/store";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "sonner";

const usePayment = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const challenge = useSelector((state: RootState) => state.challenge);
  const dispatch = useDispatch<AppDispatch>();
  const [paymentPage, setPaymentPage] = useState(1);

  // Single loading state
  const [paymentLoading, setPaymentLoading] = useState(false);

  const getSubscriptionCreator = async () => {
    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/payment/get-admin-subscription-and-campaign-prices`,
        {
          user_type: "creator",
        }
      );
      dispatch(updateSubscriptioncreator(response.data.result));
    } catch (error) {
      // console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getSubscriptionFan = async () => {
    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/payment/get-admin-subscription-and-campaign-prices`,
        {
          user_type: "fan",
        }
      );
      dispatch(updateSubscriptionfan(response.data.result));
    } catch (error) {
      // console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getSubscriptionInvestor = async () => {
    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/payment/get-admin-subscription-and-campaign-prices`,
        {
          user_type: "investor",
        }
      );
      dispatch(updateSubscriptioninvestor(response.data.result));
    } catch (error) {
      // console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getSubscription = async (type: any) => {
    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/payment/get-admin-subscription-and-campaign-prices`,
        {
          user_type: type,
        }
      );
      dispatch(updateSubscriptioninvestor(response.data.result));
    } catch (error) {
      // console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getPaymentHistory = async (
    user_type: string[] | null = null,
    payment_type: string[] | null = null,
    searchString: string = "",
    date?: string | null,
  ) => {
    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/payment/get-admin-payment-history`,
        {
          page: paymentPage,
          perPage: 20,
          searchString,
          user_type: user_type && user_type.length > 0 ? user_type : null,
          date_filter: date,
          payment_type:
            payment_type && payment_type.length > 0 ? payment_type : null,
        }
      );
      

      dispatch(updateStats(response?.data?.result?.stats));
      dispatch(
                updatePaginationPayment({
                            hasNextPage: response.data.result.history.hasNextPage,
                            hasPrevPage: response.data.result.history.hasPrevPage,
                            limit: response.data.result.history.limit,
                            nextPage: response.data.result.history.nextPage,
                            offset: response.data.result.history.offset,
                            page: response.data.result.history.page,
                            pagingCounter: response.data.result.history.pagingCounter,
                            prevPage: response.data.result.history.prevPage,
                            totalDocs: response.data.result.history.totalDocs,
                            totalPages: response.data.result.history.totalPages,
                          })
                        );
      dispatch(updateHistory(response?.data?.result?.history?.docs));
    } catch (error) {
      // console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };
  const updateSubscription = async(user_type: any, price: any, name: any, expiry: any, type: any ) => {
    setPaymentLoading(true);
    try {
      const response = await axios.post(`${base_url}/payment/create-or-update-subscription-price`, {    
        "user_type": user_type,
        "price": price,
        "name": name, 
        "expiry": expiry, 
        "type": type, 
    });
    toast.success('Updated Successfully');
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred.');
    }finally{
      setPaymentLoading(false)
    }
  }

  return {
    getSubscriptionCreator,
    getSubscriptionFan,
    getSubscriptionInvestor,
    getPaymentHistory,
    paymentLoading, 
    updateSubscription,
    getSubscription,
    paymentPage, setPaymentPage
  };
};

export default usePayment;
