import {
  updateAllPerformanceCreator,
  updateAllPerformanceFan,
  updateAllPerformanceInvestor,
  updateCreatorPerformance,
  updateFanInvestorPerformance,
  updatePaginationCreator,
  updatePaginationPerformance,
  updateStats,
} from "@/redux/slices/performanceslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const usePerformance = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const users = useSelector((state: RootState) => state.usersOnboarded);
  const dispatch = useDispatch<AppDispatch>();
  const [creatorPage, setCreatorPage] = useState(1);
  const [fanPage, setFanPage] = useState(1);
  const [investorPage, setInvestorPage] = useState(1);

  // Single loading state
  const [performanceLoading, setPerformanceLoading] = useState(false);

  const getAllPerformanceCreator = async (searchString?: string) => {
    setPerformanceLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-all-user-performance`, {
        user_type: "creator",
        page: creatorPage,
        perPage: 20,
        searchString: searchString,
      });
      
      dispatch(updateAllPerformanceCreator(response?.data?.data?.users?.docs));
      dispatch(updateStats(response?.data?.data?.stats));

       dispatch(
              updatePaginationCreator({
                hasNextPage: response.data.data.users.hasNextPage,
                hasPrevPage: response.data.data.users.hasPrevPage,
                limit: response.data.data.users.limit,
                nextPage: response.data.data.users.nextPage,
                offset: response.data.data.users.offset,
                page: response.data.data.users.page,
                pagingCounter: response.data.data.users.pagingCounter,
                prevPage: response.data.data.users.prevPage,
                totalDocs: response.data.data.users.totalDocs,
                totalPages: response.data.data.users.totalPages,
              })
            );
    } catch (error) {
      // console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const getAllPerformanceFan = async (searchString?: string) => {
    setPerformanceLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-all-user-performance`, {
        user_type: "fan",
        page: fanPage,
        searchString: searchString,
        perPage: 20,
      });
      dispatch(updateAllPerformanceFan(response?.data?.data?.users?.docs));
      dispatch(updateStats(response?.data?.data?.stats));
      dispatch(
        updatePaginationPerformance({
          hasNextPage: response.data.data.users.hasNextPage,
          hasPrevPage: response.data.data.users.hasPrevPage,
          limit: response.data.data.users.limit,
          nextPage: response.data.data.users.nextPage,
          offset: response.data.data.users.offset,
          page: response.data.data.users.page,
          pagingCounter: response.data.data.users.pagingCounter,
          prevPage: response.data.data.users.prevPage,
          totalDocs: response.data.data.users.totalDocs,
          totalPages: response.data.data.users.totalPages,
        })
      );
    } catch (error) {
      // console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const getAllPerformanceInvestor = async (searchString?: string) => {
    setPerformanceLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-all-user-performance`, {
        user_type: "investor",
        page: investorPage,
        searchString: searchString,
        perPage: 20,
      });
      dispatch(updateAllPerformanceInvestor(response?.data?.data?.users?.docs));
      dispatch(updateStats(response?.data?.data?.stats));
      dispatch(
        updatePaginationPerformance({
          hasNextPage: response.data.data.users.hasNextPage,
          hasPrevPage: response.data.data.users.hasPrevPage,
          limit: response.data.data.users.limit,
          nextPage: response.data.data.users.nextPage,
          offset: response.data.data.users.offset,
          page: response.data.data.users.page,
          pagingCounter: response.data.data.users.pagingCounter,
          prevPage: response.data.data.users.prevPage,
          totalDocs: response.data.data.users.totalDocs,
          totalPages: response.data.data.users.totalPages,
        })
      );
    } catch (error) {
      // console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const getCreatorPerformance = async (id: number) => {
    setPerformanceLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-creator-performance`, {
        creatorId: id,
      });      
      dispatch(updateCreatorPerformance(response?.data?.data));
    } catch (error) {
      // console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const getFanInvestorPerformance = async (id: number) => {
    setPerformanceLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-fans-or-investors-performance`, {
        userId: id,
      });
      dispatch(updateFanInvestorPerformance(response?.data?.data));
    } catch (error) {
      // console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  return {
    getAllPerformanceCreator,
    getAllPerformanceFan,
    getAllPerformanceInvestor,
    getCreatorPerformance,
    getFanInvestorPerformance,
    performanceLoading, 
    setCreatorPage,
    setInvestorPage,
    setFanPage, creatorPage, fanPage, investorPage
  };
};

export default usePerformance;
