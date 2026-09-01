import {
  updateAllCount,
  updateCreatorCount,
  updateFanCount,
  updateInvestorCount,
  updatePaginationOtherUsers,
  updatePaginationUsers,
  updatePost,
  updateUserProfile,
  updateUsersAll,
  updateUsersCreator,
  updateUsersFan,
  updateUsersInvestor,
} from "@/redux/slices/usersOnboardedslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "./use-toast";

const useGetUsers = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const { userProfile } = useSelector((state: RootState) => state.usersOnboarded);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [allPage, setAllPage] = useState(1);
  const [creatorPage, setCreatorPage] = useState(1);
  const [investorPage, setInvestorPage] = useState(1);
  const [fanPage, setFanPage] = useState(1);
  const [userLoading, setUserLoading] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);
  const getUsersAll = async (status: string | null, searchString?: string, country?: string | null, date?: string | null) => {
    setUserLoading(true);
    try {
      
      const response = await axios.post(`${base_url}/user/get-all`, {
        page: allPage,
        perPage: 20,
        user_type: null,
        country: country,
        date_filter: date,
        status,
        searchString
      });
      
      dispatch(updateUsersAll(response.data.response.docs));
      dispatch(
        updatePaginationUsers({
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
      dispatch(updateAllCount(response.data.response.totalDocs))
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const getUsersCreator = async (status: string | null, searchString?: string,country?: string | null, date?: string | null) => {
    setUserLoading(true);
    
    try {
      const response = await axios.post(`${base_url}/user/get-all`, {
        page: creatorPage,
        perPage: 20,
        user_type: "creator",
        country: country,
        status,
        date_filter: date,
        searchString
      });
      
      dispatch(updateUsersCreator(response.data.response.docs));
      dispatch(
        updatePaginationOtherUsers({
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
      dispatch(updateCreatorCount(response.data.response.totalDocs))
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const getUsersInvestor = async (status: string | null, searchString?: string, country?: string | null, date?: string | null) => {
    setUserLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-all`, {
        page: investorPage,
        perPage: 20,
        user_type: "investor",
        country: country,
        date_filter: date,
        status,
        searchString
      });

      dispatch(updateUsersInvestor(response.data.response.docs));
      dispatch(
        updatePaginationOtherUsers({
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
      dispatch(updateInvestorCount(response.data.response.totalDocs))
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const getUsersFan = async (status: string | null, searchString?: string, country?: string | null, date?: string | null) => {
    setUserLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-all`, {
        page: fanPage,
        perPage: 20,
        user_type: "fan",
        country: country,
        date_filter: date,
        status,
        searchString

      });
      dispatch(updateUsersFan(response.data.response.docs));
      dispatch(
        updatePaginationOtherUsers({
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
      dispatch(updateFanCount(response.data.response.totalDocs))
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setSheetLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/update-status`, {
        user_id: id,
        status,
      });
      return response.data.response;
    } catch (error) {
      // console.error(error);
    } finally {
      setSheetLoading(false);
    }
  };

  const getUserPosts = async (id: number, filter: string) => {
    setUserLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-posts`, {
        user_id: id,
        filter,
      });
      const posts = response?.data?.response?.posts;

      if (Array.isArray(posts) && posts[0] === null) {
        dispatch(updateUserProfile(response?.data?.response?.profile));
        dispatch(updatePost(""));
      } else {
        dispatch(updateUserProfile(response?.data?.response?.profile));
        dispatch(updatePost(posts));
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const deletePost = async (id: number, selected: string) => {
    setUserLoading(true);
    try {
      const response = await axios.post(`${base_url}/feeds/delete`, {
        feedId: id,
      });
      await getUserPosts(userProfile?.id, selected);
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const updateUserPosts = async (id: number, filter: string) => {
    setUserLoading(true);
    try {
      const response = await axios.post(`${base_url}/user/get-posts`, {
        user_id: id,
        filter,
      });
      const posts = response?.data?.response?.posts;

      if (Array.isArray(posts) && posts[0] === null) {
        dispatch(updatePost(""));
      } else {
        dispatch(updatePost(posts));
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  return {
    getUsersAll,
    getUsersCreator,
    getUsersInvestor,
    getUsersFan,
    updateStatus,
    getUserPosts,
    updateUserPosts,
    userLoading, 
    deletePost,
    sheetLoading, allPage, setAllPage, creatorPage, setCreatorPage, fanPage, setFanPage, investorPage, setInvestorPage
  };
};

export default useGetUsers;
