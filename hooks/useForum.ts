import { updateAllForums, updateForumMembers, updatePaginationForum } from "@/redux/slices/forumslice";
import { AppDispatch } from "@/redux/store";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { toast } from "sonner";

const useForum = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const dispatch = useDispatch<AppDispatch>();

  const [forumLoading, setForumLoading] = useState(false);
  const [forumSheetLoading, setForumSheetLoading] = useState(false);
   const [forumPage, setForumPage] = useState(1);

  const fetchAllForums = async (searchTerm?: string) => {
    setForumLoading(true);
    
    try {
      const response = await axios.post(`${base_url}/forum/get/all`, {
        page: forumPage,
        perPage: 10,
        searchString: searchTerm || "",
      });
      
      dispatch(updateAllForums(response?.data?.response?.docs));
    } catch (error: any) {
      // alert(error.message);
    } finally {
      setForumLoading(false);
    }
  };

  // Debounced search function
  const debouncedFetchAllForums = useCallback(
    debounce((searchTerm?: string) => {
      fetchAllForums(searchTerm);
    }, 500), // 500ms debounce delay
    []
  );

  const getAllForums = async(searchTerm?: string) => {
    
    setForumLoading(true);
    
    try {
      const response = await axios.post(`${base_url}/forum/get/all`, {
        page: forumPage,
        perPage: 20,
        searchString: searchTerm || "",
      });

      dispatch(updateAllForums(response?.data?.response?.docs));
         dispatch(
                updatePaginationForum({
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
    } finally {
      setForumLoading(false);
    }
  };

  const getForumMembers = async (forumId: number, searchTerm?: string) => {
    setForumSheetLoading(true);
    
    try {
      const response = await axios.post(`${base_url}/forum/get/members`, {
        forumId,
        page: 1,
        perPage: 500,
        searchString: searchTerm,
      });
      
      dispatch(updateForumMembers(response?.data?.response?.docs[0]?.users));
    } catch (error: any) {
      // alert(error.message);
    } finally {
      setForumSheetLoading(false);
    }
  };

  const deleteForumMember = async (forumId: number, userId: number) => {
    setForumSheetLoading(true);
    try {
      await axios.post(`${base_url}/forum/remove`, {
        forumId,
        userId,
      });

    } catch (error: any) {
      toast.error("Delete Action Failed: Something went wrong");
    } finally {
      setForumSheetLoading(false);
    }
  };

  return {
    getAllForums,
    getForumMembers,
    deleteForumMember,
    forumLoading,
    forumSheetLoading,
    forumPage,
    setForumPage
  };
};

export default useForum;
