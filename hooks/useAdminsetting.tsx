import {
  updateacceptedAdmin,
  updatePaginationAdminSetting,
  updatePaginationPendingAdminSetting,
  updatependingAdmin,
  updateRoles,
} from "@/redux/slices/adminsettingslice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "sonner";

const useAdminsetting = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const challenge = useSelector((state: RootState) => state.challenge);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [acceptedPage, setAcceptedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [adminLoading, setadminLoading] = useState(false);

  const getAdminAccepted = async () => {
    setadminLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin-settings/get-all-admins`,
        {
          page: acceptedPage,
          perPage: 20,
          status: "accepted",
        }
      );

      dispatch(updateacceptedAdmin(response?.data?.response?.admin?.docs));
      dispatch(
        updatePaginationAdminSetting({
          hasNextPage: response.data.response.admin.hasNextPage,
          hasPrevPage: response.data.response.admin.hasPrevPage,
          limit: response.data.response.admin.limit,
          nextPage: response.data.response.admin.nextPage,
          offset: response.data.response.admin.offset,
          page: response.data.response.admin.page,
          pagingCounter: response.data.response.admin.pagingCounter,
          prevPage: response.data.response.admin.prevPage,
          totalDocs: response.data.response.admin.totalDocs,
          totalPages: response.data.response.admin.totalPages,
        })
      );
      dispatch(updateRoles(response?.data?.response?.roles));
    } catch (error: any) {
      // alert(error?.message);
    } finally {
      setadminLoading(false);
    }
  };

  const getAdminPending = async () => {
    setadminLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin-settings/get-all-admins`,
        {
          page: pendingPage,
          perPage: 20,
          status: "pending",
        }
      );

      dispatch(updatependingAdmin(response?.data?.response?.admin?.docs));
      dispatch(
        updatePaginationPendingAdminSetting({
          hasNextPage: response.data.response.admin.hasNextPage,
          hasPrevPage: response.data.response.admin.hasPrevPage,
          limit: response.data.response.admin.limit,
          nextPage: response.data.response.admin.nextPage,
          offset: response.data.response.admin.offset,
          page: response.data.response.admin.page,
          pagingCounter: response.data.response.admin.pagingCounter,
          prevPage: response.data.response.admin.prevPage,
          totalDocs: response.data.response.admin.totalDocs,
          totalPages: response.data.response.admin.totalPages,
        })
      );
      dispatch(updateRoles(response?.data?.response?.roles));
    } catch (error: any) {
      // alert(error?.message);
    } finally {
      setadminLoading(false);
    }
  };

  const createAdminRole = async (name: string, features: string[]) => {
    setadminLoading(true);
    try {
      await axios.post(`${base_url}/admin-settings/create-admin-role`, {
        name,
        features,
      });
      toast.success("Role Created successfully");
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      setadminLoading(false);
    }
  };

  const createAdmin = async (
    firstName: string,
    lastName: string,
    country: string,
    phoneNumber: string,
    email: string,
    roleId?: number
  ) => {
    setadminLoading(true);
    try {
      await axios.post(`${base_url}/admin-settings/create-admin`, {
        first_name: firstName,
        last_name: lastName,
        country,
        phone_number: phoneNumber,
        email,
        status: "pending",
        role_id: roleId,
      });
      toast.success("Admin Created successfully");
    } catch (error: any) {
      toast.error(error.response.data.message || "Couldn't create Admin");
    } finally {
      setadminLoading(false);
    }
  };

  const updateAdminStatus = async (id: number) => {
    setadminLoading(true);
    try {
      await axios.post(`${base_url}/admin-settings/update-admin-status`, {
        admin_id: id,
        status: "accepted",
      });
      toast.success("Admin Updated successfully");
    } catch (error: any) {
      toast.error("Status Update Failed");
    } finally {
      setadminLoading(false);
    }
  };

  const deleteAdmin = async (id: number) => {
    setadminLoading(true);
    try {
      await axios.post(`${base_url}/admin-settings/delete-admin`, {
        admin_id: id,
      });
    } catch (error: any) {
      // alert(error?.message);
    } finally {
      setadminLoading(false);
    }
  };

  const updateAdminRole = async (
    id: number,
    roleId: number,
    roleName: string
  ) => {
    setadminLoading(true);
    try {
      await axios.post(`${base_url}/admin-settings/update-admin-role`, {
        id,
        role_id: roleId,
        role_name: roleName,
      });
      toast.success("Admin Role Updated successfully");
      await getAdminAccepted();
    } catch (error: any) {
      toast.error("Admin Role Update Failed");
    } finally {
      setadminLoading(false);
    }
  };

  const sendLink = async (email: string) => {
    setadminLoading(true);
    try {
      await axios.post(`${base_url}/admin-settings/send-link`, {
        email: email,
        link: "www.dreamplanet.org",
      });
      toast.success("Link Sent Successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setadminLoading(false);
    }
  };

const updateRole = async (
  id: number,
  name: string,
  features: string[]
) => {
  setadminLoading(true);
  try {
    await axios.post(`${base_url}/admin-settings/update-role`, {
      id,
      name,
      features,
    });

    toast.success("Role updated successfully");

    await getAdminAccepted(); // refresh roles
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update role");
  } finally {
    setadminLoading(false);
  }
};


const deleteRole = async (id: number) => {
  setadminLoading(true);
  try {
    await axios.post(`${base_url}/admin-settings/delete-role`, { id });

    toast.success("Role deleted successfully");

    await getAdminAccepted(); // refresh roles
  } catch (error: any) {
    toast.error("Failed to delete role");
  } finally {
    setadminLoading(false);
  }
};


  return {
    getAdminAccepted,
    getAdminPending,
    createAdminRole,
    createAdmin,
    updateAdminStatus,
    deleteAdmin,
    updateAdminRole,
     updateRole,
  deleteRole,
    sendLink,
    adminLoading,
    pendingPage,
    setPendingPage,
    acceptedPage,
    setAcceptedPage,
  };
};

export default useAdminsetting;
