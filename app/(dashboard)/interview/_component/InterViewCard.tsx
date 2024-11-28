"use client";

import APIClient from "@/libs/api-client";
import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Pagination } from "@nextui-org/pagination";
import Link from "next/link";
import { formatedDate, formatedTimeToMinutes } from "@/app/util";
import { Divider } from "@nextui-org/divider";
import { useRouter } from "next/navigation";
import { useInterviewContext } from "../_providers/InterviewProvider";

interface InterViewScheduleInterface {
  id: string;
  title: string;
  interviewDate: string;
  startTime: string;
  timeDuration: string;
  interviewFormat: string;
  interviewLocation: string;
  createdByUserId: string;
  interviewerId: string;
  createdByUser: any;
  interviewer: any;
}

export default function InterViewCard() {
  const [pageIndex, setPageIndex] = useState(1);

  const { listInterviewData } = useInterviewContext() || {};

  const router = useRouter();

  const handlePress = (id: string) => {
    router.push(`interview/details/${id}`);
  };

  return (
    <div>
      <div className="grid h-full grid-cols-3 gap-6">
        {listInterviewData?.interviewSchedules &&
          listInterviewData.interviewSchedules.map(
            (interview: InterViewScheduleInterface) => (
              <Card
                key={interview.id as string}
                className="w-full"
                shadow="lg"
                onPress={() => handlePress(interview.id)}
                isPressable
              >
                <CardHeader>
                  <div>
                    <div className="text-md mt-1 text-lg font-semibold">
                      {interview.title}
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="mb-2 grid grid-cols-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Start date: </span>
                      {formatedDate(interview.interviewDate)}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="font-semibold">Start time: </span>
                      {interview.startTime}
                    </div>
                  </div>
                  <div className="mb-2 mt-1">
                    {" "}
                    <span className="font-semibold">Interviewed by: </span>
                    {interview.interviewer?.fullName}
                  </div>

                  <div className="mb-2 mt-1">
                    <span className="font-semibold">Duration: </span>
                    {formatedTimeToMinutes(interview.timeDuration)} mins
                  </div>
                  <div className="mb-2 mt-1 flex gap-2">
                    <span className="font-semibold">Interview type: </span>
                    <div className="text-blue-600">
                      {interview.interviewFormat}
                    </div>
                  </div>
                  <div className="mb-2 mt-1 flex gap-2">
                    <span className="font-semibold">Interview location: </span>

                    {interview.interviewFormat === "Online" ? (
                      <Link
                        href="http://localhost:3000"
                        className="text-blue-600 underline"
                      >
                        Link
                      </Link>
                    ) : (
                      interview.interviewLocation
                    )}
                  </div>
                </CardBody>
              </Card>
            ),
          )}
      </div>

      <Pagination
        className="m-4 flex justify-center"
        isCompact
        loop
        showControls
        total={
          listInterviewData?.totalPages
            ? Number(listInterviewData.totalPages)
            : 0
        }
        initialPage={pageIndex}
        onChange={(page) => {
          setPageIndex(page);
        }}
      />
    </div>
  );
}
