import { AppDispatch, RootState } from "@/redux/store";
import axios from "axios";
import authenticatedAxios from "@/lib/authenticatedApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { updateUser } from "@/redux/slices/adminslice";
import {
  getLandingRoute,
  normalizePermissions,
} from "@/constants/permission";

const useLogin = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL;
  const { id } = useSelector((state: RootState) => state.admin.loggedInUser);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isOpen, setisOpen] = useState(false);

  const login = async (email?: string, password?: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/admin-settings/login-admin`,
        {
          email: email,
          password: password,
        }
      );

      const payload =
        response?.data?.data?.response ??
        response?.data?.response ??
        response?.data;
      const adminData = payload?.admin || {};
      const role = payload?.role || response?.data?.role || {};
      const rawFeatures = Array.isArray(role?.features)
        ? role.features
        : [];

      const permissions = normalizePermissions(rawFeatures);

      dispatch(
        updateUser({
          ...adminData,
          role,
          permissions,
        })
      );

      const token =
        payload?.token ??
        payload?.access_token ??
        response?.data?.token ??
        response?.data?.access_token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
      }

      toast.success(response?.data?.message || "Signed in successfully.");
      router.push(getLandingRoute(permissions));
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword?: string, newPassword?: string) => {
    setLoading(true);
    try {
      const response = await authenticatedAxios.post(
        `${base_url}/admin-settings/change-admin-password`,
        {
          admin_id: id,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }
      );
      setisOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    changePassword,
    isOpen,
    setisOpen,
  };
};

export default useLogin;
