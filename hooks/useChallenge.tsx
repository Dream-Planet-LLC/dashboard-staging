import {
  updateBroadcastAll,
  updateBroadcastEdit,
} from "@/redux/slices/broadcastslice";
import { updateChallengeAll, updatePaginationChallenge } from "@/redux/slices/challengeslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "@/lib/authenticatedApi";
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import { debounce } from "lodash";

const useChallenge = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const challenge = useSelector((state: RootState) => state.challenge);
  const dispatch = useDispatch<AppDispatch>();
  const [challengePage, setChallengePage] = useState(1);

  // Single loading state
  const [challengeLoading, setChallengeLoading] = useState(false);

  

  const getAllChallenges = async(searchTerm?: string, date?:string | null) => {
    setChallengeLoading(true);
    try {
      const response = await axios.post(`${base_url}/challenge/get/all`, {
        page: challengePage,
        perPage: 20,
        searchString: searchTerm || "",
        date_filter: date,
      });
      
      dispatch(updateChallengeAll(response?.data?.data?.docs));
      dispatch(
                updatePaginationChallenge({
                            hasNextPage: response.data.data.hasNextPage,
                            hasPrevPage: response.data.data.hasPrevPage,
                            limit: response.data.data.limit,
                            nextPage: response.data.data.nextPage,
                            offset: response.data.data.offset,
                            page: response.data.data.page,
                            pagingCounter: response.data.data.pagingCounter,
                            prevPage: response.data.data.prevPage,
                            totalDocs: response.data.data.totalDocs,
                            totalPages: response.data.data.totalPages,
                          })
                        );
    } catch (error) {
      // console.error(error);
    } finally {
      setChallengeLoading(false);
    }
  };

  const createChallenge = async (
    name: string,
    instructions: string,
    price: string,
    link: string,
    media_url: string[],
    status: string,
    duration: string,
    delete_after_duration: boolean,
    hashtag: string
  ) => {
    setChallengeLoading(true);
    try {
      const response = await axios.post(`${base_url}/challenge/create`, {
        name,
        instructions,
        price,
        link,
        media_url,
        status,
        duration,
        delete_after_duration,
        hashtag,
      });
    } catch (error) {
      // console.error(error);
    } finally {
      setChallengeLoading(false);
    }
  };

  const updateChallenge = async (
    id: number,
    name: string,
    instructions: string,
    price: string,
    link: string,
    media_url: string[],
    status: string,
    duration: string,
    delete_after_duration: boolean | undefined,
    hashtag: string
  ) => {
    setChallengeLoading(true);
    try {
      const response = await axios.post(`${base_url}/challenge/update`, {
        id,
        name,
        instructions,
        price,
        link,
        media_url,
        status,
        duration,
        delete_after_duration,
        hashtag,
      });
    } catch (error) {
      // console.error(error);
    } finally {
      setChallengeLoading(false);
    }
  };

  const deleteChallenge = async (id: number) => {
    setChallengeLoading(true);
    try {
      const response = await axios.post(`${base_url}/challenge/delete`, {
        challengeId: id,
      });
    } catch (error) {
      // console.error(error);
    } finally {
      setChallengeLoading(false);
    }
  };

  return {
    getAllChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    challengeLoading, 
    challengePage, setChallengePage
  };
};

export default useChallenge;
