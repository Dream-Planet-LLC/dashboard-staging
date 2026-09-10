import {
  BroadcastCreator,
  BroadcastProps,
  updateBroadcastAll,
  updateBroadcastEdit,
  updatePaginationBroadcast,
} from "@/redux/slices/broadcastslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { toast } from "sonner";

const useBroadcast = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const broadcast = useSelector((state: RootState) => state.broadcast);
  const loggedInAdmin = useSelector(
    (state: RootState) => state.admin.loggedInUser
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [broadcastPage, setBroadcastPage] = useState(1);
  const [allLoading, setAllLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const adminDirectoryRef = useRef<Map<string, BroadcastCreator> | null>(null);

  const getAdminDirectory = async () => {
    if (adminDirectoryRef.current) {
      return adminDirectoryRef.current;
    }

    const perPage = 100;
    const firstResponse = await axios.post(
      `${base_url}/admin-settings/get-all-admins`,
      {
        page: 1,
        perPage,
        status: "accepted",
      }
    );
    const firstPage = firstResponse?.data?.response?.admin;
    const totalPages = Number(firstPage?.totalPages || 1);
    const admins = [...(firstPage?.docs || [])];

    if (totalPages > 1) {
      const remainingResponses = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          axios.post(`${base_url}/admin-settings/get-all-admins`, {
            page: index + 2,
            perPage,
            status: "accepted",
          })
        )
      );

      remainingResponses.forEach((response) => {
        admins.push(...(response?.data?.response?.admin?.docs || []));
      });
    }

    const directory = new Map<string, BroadcastCreator>();

    admins.forEach((admin) => {
      if (admin?.id === null || admin?.id === undefined) return;

      directory.set(String(admin.id), {
        id: Number(admin.id),
        first_name: admin.first_name || null,
        last_name: admin.last_name || null,
      });
    });

    adminDirectoryRef.current = directory;
    return directory;
  };

  const fetchBroadcasts = async (searchTerm?: string) => {
    setAllLoading(true);
    try {
      const [response, adminDirectory] = await Promise.all([
        axios.post(`${base_url}/broadcast/get-all`, {
          searchString: searchTerm || "",
          page: broadcastPage,
          perPage: 20,
        }),
        getAdminDirectory().catch(() => new Map<string, BroadcastCreator>()),
      ]);
      const broadcastDocs = (response?.data?.response?.docs || []) as BroadcastProps[];
      const broadcastsWithCreators = broadcastDocs.map((item) => ({
        ...item,
        creator:
          item.creator ||
          (item.admin_id !== null
            ? adminDirectory.get(String(item.admin_id)) || null
            : null),
      }));

      dispatch(updateBroadcastAll(broadcastsWithCreators));
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
    description: string,
    media_url: string[]
  ) => {
    setCreateLoading(true);
    try {
      await axios.post(`${base_url}/broadcast/create`, {
        title,
        admin_id: loggedInAdmin.id ?? null,
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
    description: string,
    media_url: string[]
  ) => {
    setUpdateLoading(true);
    try {
      await axios.post(`${base_url}/broadcast/update`, {
        id,
        title,
        admin_id: broadcast.broadcastEdit.admin_id,
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
