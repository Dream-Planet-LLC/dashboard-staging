"use client";
import useReport from "@/hooks/useReport";
import { updateActiveReport } from "@/redux/slices/reportslice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingOverlay from "@/components/LoadingOverlay";
import LoadingState from "@/components/LoadingState";

const SubmittedReport = () => {
 
  const { reports } = useSelector((state: RootState) => state.report);
  const { getReports, reportLoading } = useReport();
  const router = useRouter();

  const dispatch = useDispatch();
  useEffect(() => {
    getReports();
  }, []);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()]; // Get month abbreviation
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const hasReports = (reports?.length ?? 0) > 0;

  if (reportLoading && !hasReports) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reportLoading && hasReports && (
        <LoadingOverlay message="Processing..." />
      )}
      <div>
        <h2 className="text-2xl"> Submitted Report</h2>
        <p className="text-sm text-[#A8A8A8]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-6">
        {reports?.map((report) => (
          <div
            onClick={() => {
              dispatch(updateActiveReport(report));
              router.push("/evaluationreportFilled");
            }}
            className="w-50 border cursor-pointer transition-all active:scale-95 rounded-[4px]"
          >
            <div className="flex justify-center bg-[#F1F1F1]">
              <Image
                src={"/icons/reportCard.svg"}
                height={70}
                width={70}
                alt="reportcard"
                className="py-4"
              />
            </div>
            <div className="px-4 py-2">
              <h2 className="font-medium text-[#111810]">{report.user_name}</h2>
              <p className="text-[12px] text-[#A4A4A4]">
                {formatDate(report.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmittedReport;
