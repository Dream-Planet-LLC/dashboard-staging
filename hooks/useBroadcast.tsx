import {
  updateBroadcastAll,
  updateBroadcastEdit,
  updatePaginationBroadcast,
} from "@/redux/slices/broadcastslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { toast } from "sonner";

const useBroadcast = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const broadcast = useSelector((state: RootState) => state.broadcast);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [broadcastPage, setBroadcastPage] = useState(1);
  const [allLoading, setAllLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBroadcasts = async (searchTerm?: string) => {
    setAllLoading(true);
    try {
      const response = await axios.post(`${base_url}/broadcast/get-all`, {
        searchString: searchTerm || "",
        page: broadcastPage,
        perPage: 20,
      });
      
      dispatch(updateBroadcastAll(response?.data?.response?.docs));
      dispatch(
              updatePaginationBroadcast({
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
    } catch (error) {
      (error);
    } finally {
      setAllLoading(false);
    }
  };

  // Debounced search function
  const debouncedFetchBroadcasts = useCallback(
    debounce((searchTerm?: string) => {
      fetchBroadcasts(searchTerm);
    }, 500),
    []
  );

  const getAllBroadCast = (searchTerm?: string) => {
    // Use the debounced function
    debouncedFetchBroadcasts(searchTerm);
  };

  const createBroadCast = async (
    title: string,
    admin_id: number | null,
    description: string,
    media_url: string[]
  ) => {
    setCreateLoading(true);
    try {
      await axios.post(`${base_url}/broadcast/create`, {
        title,
        admin_id,
        description,
        media_url,
      });
      toast.success("Broadcast Created Successfully")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setCreateLoading(false);
    }
  };

  const updateBroadCast = async (
    id: number,
    title: string,
    admin_id: number | null,
    description: string,
    media_url: string[]
  ) => {
    setUpdateLoading(true);
    try {
      await axios.post(`${base_url}/broadcast/update`, {
        id,
        title,
        admin_id,
        description,
        media_url,
      });
      toast.success("Broadcast Updated Successfully")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteBroadcast = async (id: number) => {
    setDeleteLoading(true);
    try {
      
     const response = await axios.post(`${base_url}/feeds/delete`, { feedId: id });
     toast.success("Broadcast Deleted Successfully")      
     await fetchBroadcasts(); // Refresh the list after deletion
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    getAllBroadCast,
    createBroadCast,
    updateBroadCast,
    deleteBroadcast,
    allLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    broadcastPage,
    setBroadcastPage
  };
};

export default useBroadcast;
