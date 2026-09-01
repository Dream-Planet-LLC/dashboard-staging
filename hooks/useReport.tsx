import {
  updateAdmin,
  updateCreator,
  updateCreatorReport,
  updatePaginationReport,
  updateReports,
} from "@/redux/slices/reportslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import { debounce } from "lodash";

const useReport = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const { creatorData } = useSelector((state: RootState) => state.report);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [reportPage, setReportPage] = useState(1);

  const [reportLoading, setReportLoading] = useState(false);

  const fetchCreatorReport = async (searchString: string) => {
    setReportLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/report/get-all-creators-for-report`,
        {
          page: reportPage,
          perPage: 20,
          searchString: searchString,
        }
      );
      
      dispatch(updateCreatorReport(response?.data?.response?.docs));
       dispatch(
          updatePaginationReport({
                      hasNextPage: response.data.response.hasNextPage,
                      hasPrevPage: response.data.response.hasPrevPage,
                      limit: response.data.response.limit,
                      nextPage: response.data.response.nextPage,
                      offset: response.data.response.offset,
                      page: response.data.response.page,
                      pagingCounter: response.data.response.pagingCounter,
                      prevPage: response.data.response.prevPage,
                      totalDocs: response.data.response.totalDocs,
                      totalPages: response.data.response.totalPages,
                    })
                  );
    } catch (error: any) {
      // (error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const debouncedFetchCreatorReport = useCallback(
    debounce((searchString: string) => {
      fetchCreatorReport(searchString);
    }, 500),
    []
  );

  const getCreatorReport = (searchString: string) => {
    debouncedFetchCreatorReport(searchString);
  };

  const fetchAdmin = async (searchString: string) => {
    setReportLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/report/search-admin-by-name`,
        { name: searchString }
      );
      dispatch(updateAdmin(response?.data?.response));
    } catch (error: any) {
      // (error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const debouncedFetchAdmin = useCallback(
    debounce((searchString: string) => {
      fetchAdmin(searchString);
    }, 500),
    []
  );

  const getAdmin = (searchString: string) => {
    debouncedFetchAdmin(searchString);
  };

  const fetchCreator = async (searchString: string) => {
    setReportLoading(true);
    try {
      const response = await axios.post(`${base_url}/feeds/search`, {
        searchType: "users",
        searchString: searchString,
      });
      dispatch(updateCreator(response?.data?.response));
    } catch (error: any) {
      // alert(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const debouncedFetchCreator = useCallback(
    debounce((searchString: string) => {
      fetchCreator(searchString);
    }, 500),
    []
  );

  const getCreator = (searchString: string) => {
    debouncedFetchCreator(searchString);
  };

  const getReports = async () => {
    setReportLoading(true);
    try {
      const response = await axios.post(`${base_url}/report/get-all-reports`, {
        page: 1,
        perPage: 10,
        searchString: "",
      });
      dispatch(updateReports(response?.data?.response?.docs));
    } catch (error: any) {
      // alert(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const createCreatorReport = async (
    adminId: number | undefined,
    creatorId: number | undefined,
    investorNumber: number | undefined
  ) => {
    setReportLoading(true);
    try {
      await axios.post(`${base_url}/report/create-creators-for-report`, {
        admin_id: adminId,
        creator_id: creatorId,
        no_of_investors: investorNumber,
      });
      fetchCreatorReport("");
    } catch (error: any) {
      // alert(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const createReport = async (
    subject: string,
    description: string,
    media_url: string[]
  ) => {
    setReportLoading(true);
    try {
      await axios.post(`${base_url}/report/create-report`, {
        subject: subject,
        description: description,
        media_url: media_url,
        creator_id: creatorData?.creator_id,
      });
    } catch (error: any) {
      // alert(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  return {
    getCreatorReport,
    createCreatorReport,
    getAdmin,
    getCreator,
    getReports,
    createReport,
    reportLoading, 
    reportPage,
    setReportPage
  };
};

export default useReport;
