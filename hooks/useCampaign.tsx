import {
  updateCampaignActive,
  updateCampaignCompleted,
  updateCampaignMostPerformed,
  updateCampaignStopped,
  updategroupCampaigns,
  updateDonations,
  updateCampaignProcessing,
  updatePaginationActive,
  updatePaginationOther,
} from "@/redux/slices/campaignslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const useCampaign = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const campaign = useSelector((state: RootState) => state.campaign);
  const dispatch = useDispatch<AppDispatch>();

  // Single loading state
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignLoadingSheet, setCampaignLoadingSheet] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [processingPage, setProcessingPage] = useState(1);
  const [stoppedPage, setStoppedPage] = useState(1);
  const [mostPerformedPage, setMostPerformedPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1); 

  const getActiveCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const response = await axios.post(`${base_url}/campaign/get/all-for-admin`, {
        page: activePage,
        perPage: 20,
        status: "active",
      });

      dispatch(updateCampaignActive(response?.data?.response?.campaigns?.docs));      
      
       dispatch(
                    updatePaginationActive({
                      hasNextPage: response.data.response.campaigns.hasNextPage,
                      hasPrevPage: response.data.response.campaigns.hasPrevPage,
                      limit: response.data.response.campaigns.limit,
                      nextPage: response.data.response.campaigns.nextPage,
                      offset: response.data.response.campaigns.offset,
                      page: response.data.response.campaigns.page,
                      pagingCounter: response.data.response.campaigns.pagingCounter,
                      prevPage: response.data.response.campaigns.prevPage,
                      totalDocs: response.data.response.campaigns.totalDocs,
                      totalPages: response.data.response.campaigns.totalPages,
                    })
                  );
      

      dispatch(updategroupCampaigns(response?.data?.response?.groupedCampaigns));
    } catch (error) {
    } finally {
      setCampaignLoading(false);
    }
  };

  const getAllDonations = async (id: number) => {
    setCampaignLoadingSheet(true);
    try {
      const response = await axios.post(`${base_url}/campaign/get/all-donations`, {
        campaignId: id,
        page: 1,
        perPage: 10,
      });

      dispatch(updateDonations(response?.data?.data?.docs));
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoadingSheet(false);
    }
  };

  const stopCampaign = async (id: number) => {
    setCampaignLoadingSheet(true);
    try {
     const response = await axios.post(`${base_url}/campaign/update-status`, {
        campaignId: id,
        status: "stopped",
      });
      await getActiveCampaigns();
      await getStoppedCampaigns();
      
      // Add any additional logic if needed
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoadingSheet(false);
    }
  };

  const activateCampaign = async (id: number) => {
    setCampaignLoadingSheet(true);
    try {
     const response = await axios.post(`${base_url}/campaign/update-status`, {
        campaignId: id,
        status: "active",
      });
      await getStoppedCampaigns();
      await getActiveCampaigns();
      
      // Add any additional logic if needed
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoadingSheet(false);
    }
  };

  const getStoppedCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const response = await axios.post(`${base_url}/campaign/get/all-for-admin`, {
        page: stoppedPage,
        perPage: 20,
        status: "stopped",
      });

      dispatch(updateCampaignStopped(response?.data?.response?.campaigns?.docs));
       
      dispatch(
        updatePaginationOther({
          hasNextPage: response.data.response.campaigns.hasNextPage,
          hasPrevPage: response.data.response.campaigns.hasPrevPage,
          limit: response.data.response.campaigns.limit,
          nextPage: response.data.response.campaigns.nextPage,
          offset: response.data.response.campaigns.offset,
          page: response.data.response.campaigns.page,
          pagingCounter: response.data.response.campaigns.pagingCounter,
          prevPage: response.data.response.campaigns.prevPage,
          totalDocs: response.data.response.campaigns.totalDocs,
          totalPages: response.data.response.campaigns.totalPages,
        })
      );
      dispatch(updategroupCampaigns(response?.data?.response?.groupedCampaigns));
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoading(false);
    }
  };

  const getCompletedCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const response = await axios.post(`${base_url}/campaign/get/all-for-admin`, {
        page: completedPage,
        perPage: 20,
        status: "completed",
      });

      dispatch(updateCampaignCompleted(response?.data?.response?.campaigns?.docs));
      dispatch(
        updatePaginationOther({
          hasNextPage: response.data.response.campaigns.hasNextPage,
          hasPrevPage: response.data.response.campaigns.hasPrevPage,
          limit: response.data.response.campaigns.limit,
          nextPage: response.data.response.campaigns.nextPage,
          offset: response.data.response.campaigns.offset,
          page: response.data.response.campaigns.page,
          pagingCounter: response.data.response.campaigns.pagingCounter,
          prevPage: response.data.response.campaigns.prevPage,
          totalDocs: response.data.response.campaigns.totalDocs,
          totalPages: response.data.response.campaigns.totalPages,
        })
      );
      dispatch(updategroupCampaigns(response?.data?.response?.groupedCampaigns));
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoading(false);
    }
  };

  const getMostPerformedCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const response = await axios.post(`${base_url}/campaign/get/all-for-admin`, {
        page: mostPerformedPage,
        perPage: 20,
        status: "most-performed",
      });

      dispatch(updateCampaignMostPerformed(response?.data?.response?.campaigns?.docs));
      dispatch(
        updatePaginationOther({
          hasNextPage: response.data.response.campaigns.hasNextPage,
          hasPrevPage: response.data.response.campaigns.hasPrevPage,
          limit: response.data.response.campaigns.limit,
          nextPage: response.data.response.campaigns.nextPage,
          offset: response.data.response.campaigns.offset,
          page: response.data.response.campaigns.page,
          pagingCounter: response.data.response.campaigns.pagingCounter,
          prevPage: response.data.response.campaigns.prevPage,
          totalDocs: response.data.response.campaigns.totalDocs,
          totalPages: response.data.response.campaigns.totalPages,
        })
      );
      dispatch(updategroupCampaigns(response?.data?.response?.groupedCampaigns));
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoading(false);
    }
  };

  const getProcessingCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const response = await axios.post(`${base_url}/campaign/get/all-for-admin`, {
        page: processingPage,
        perPage: 20,
        status: "processing",
      });

      dispatch(updateCampaignProcessing(response?.data?.response?.campaigns?.docs));
      dispatch(
        updatePaginationOther({
          hasNextPage: response.data.response.campaigns.hasNextPage,
          hasPrevPage: response.data.response.campaigns.hasPrevPage,
          limit: response.data.response.campaigns.limit,
          nextPage: response.data.response.campaigns.nextPage,
          offset: response.data.response.campaigns.offset,
          page: response.data.response.campaigns.page,
          pagingCounter: response.data.response.campaigns.pagingCounter,
          prevPage: response.data.response.campaigns.prevPage,
          totalDocs: response.data.response.campaigns.totalDocs,
          totalPages: response.data.response.campaigns.totalPages,
        })
      );
      dispatch(updategroupCampaigns(response?.data?.response?.groupedCampaigns));
    } catch (error) {
      // console.error(error);
    } finally {
      setCampaignLoading(false);
    }
  };

  return {
    getActiveCampaigns,
    getStoppedCampaigns,
    getCompletedCampaigns,
    getMostPerformedCampaigns,
    getAllDonations,
    getProcessingCampaigns,
    stopCampaign,
    campaignLoading,
    campaignLoadingSheet,
    activateCampaign, processingPage,setProcessingPage, activePage,setActivePage, mostPerformedPage, setMostPerformedPage, stoppedPage, setStoppedPage, completedPage, setCompletedPage
  };
};

export default useCampaign;
