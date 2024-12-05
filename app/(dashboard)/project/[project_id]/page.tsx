"use client";
import APIClient from "@/libs/api-client";
import { useQuery } from "@tanstack/react-query";
import { GetProjectResponse } from "../_types/Project";
import { Spinner } from "@nextui-org/spinner";
import GeneralInformation from "./_components/GeneralInformation";
import RelatedUsers from "./_components/RelatedUsers";
import TaskList from "./_components/TaskList";
import { useState } from "react";

const apiClient = new APIClient({
  onFulfilled: (response) => response,
  onRejected: (error) => {
    console.log(error.response.data);
  },
});

export type RelatedUser = {
  id: string;
  fullName: string;
  role: string;
};

type Params = Promise<{ project_id: string }>;

export default async function ProjectDetails({ params }: { params: Params }) {
  const { project_id } = await params;

  const [filterTask, setFilterTask] = useState<number>(0);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", project_id, filterTask],
    queryFn: async () => {
      const response = await apiClient.get<GetProjectResponse>(
        `/project/${project_id}/summary-details?filterTask=${filterTask}`,
      );

      if (response?.statusCode === "200") {
        return response.data;
      }
    },
  });

  const relatedUser = project?.groupUserRelated.reduce((acc, group) => {
    const usersWithRole = group.users.map((user) => ({
      ...user,
      role: group.role,
      id: user.id, // Ensure id is a number
    }));

    return [...acc, ...usersWithRole];
  }, [] as RelatedUser[]);

  return (
    <div className="flex h-full w-full flex-col p-9">
      <h1 className="text-left text-2xl font-semibold capitalize text-black">
        Project Details
      </h1>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex w-full gap-6">
            <GeneralInformation project={project as any} />
            <RelatedUsers
              groups={relatedUser as any}
              projectId={project_id}
              projectName={project?.title as string}
            />
          </div>

          <TaskList
            tasks={project?.taskList as any}
            relatedUsers={relatedUser as any}
            filterTask={filterTask}
            setFilterTask={setFilterTask}
            projectId={project_id}
          />
        </div>
      )}
    </div>
  );
}
