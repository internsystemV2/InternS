"use client";

import {
  Criteria,
  SubmitScore,
} from "@/app/(dashboard)/intern/_types/GetCriterias";
import { formatDate } from "@/app/util";
import APIClient from "@/libs/api-client";
import { API_ENDPOINTS } from "@/libs/config";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { PDFExport } from "@progress/kendo-react-pdf";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { Key, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function FinalReportPage() {
  const statusColor: Record<string, string> = {
    NotPassed: "text-danger font-medium",
    Passed: "text-success font-medium",
    Excellent: "text-success font-medium",
  };

  const difficultyMap: any = {
    Easy: 1,
    MediumEasy: 2,
    Medium: 3,
    MediumHard: 4,
    Hard: 5,
  };

  const params = useParams();
  const candidateId = params.detailId as string;

  const apiClient = new APIClient({
    onFulfilled: (response) => response,
    onRejected: (error) => {
      console.log(error.response.data);
    },
  });

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["data", candidateId],
    queryFn: async () => {
      const response = await fetch(
        `${API_ENDPOINTS.internshipReport}/${candidateId}/internship-report-details`,
      );
      const candidate = await response.json();

      return candidate;
    },
  });

  console.log(candidateId);

  const { mutate } = useMutation({
    mutationFn: async (submitScore: SubmitScore[]) => {
      const response = await apiClient.post<{
        statusCode: string;
        message: string;
      }>(
        `${API_ENDPOINTS.internshipReport}/${candidateId}/record-compliance-evaluation`,
        submitScore,
        {},
        true,
      );

      if (response.statusCode !== "200") {
        const errorData = response.message;

        throw new Error(errorData || "Failed to submit score");
      }

      return response;
    },
    onError: (error) => {
      console.error("Error:", error); // Log the error to the console
      toast.error(error.message);
    },
    onSuccess: () => {
      setIsEditable(false);
      toast.success("Submit score successfully!");
      refetch();
    },
  });

  const internPeriodViewReport = data?.data?.internPeriodViewReport || {};
  const candidateInfor = data?.data || {};
  const complianceEvaluate = data?.data?.complianceEvaluation || {};
  const complianceCriterias = complianceEvaluate?.complianceCriterias || [];

  const workPerformance =
    data?.data?.workPerformanceEvaluationFinal?.projectEvaluation || [];

  const workPerformanceEvaluationFinal =
    data?.data?.workPerformanceEvaluationFinal;
  const [isScored, setIsScored] = useState(false);

  const handleGetIsScored = () => {
    const result = complianceCriterias?.some((complianceCriteria: Criteria) => {
      return complianceCriteria.evaluateScore > 0;
    });

    setIsScored(result);
  };

  useEffect(() => {
    handleGetIsScored();
  }, [data]);

  const columnsCompany = useMemo(
    () => [
      { key: "no", label: "NO" },
      { key: "content", label: "Criteria content" },
      { key: "percent", label: "Percent" },
      { key: "maxScore", label: "Max score" },
      { key: "evaluateScore", label: "Evaluate score" },
      { key: "finalScore", label: "Final score" },
      { key: "note", label: "Note" },
    ],
    [],
  );

  const columnsProject = useMemo(
    () => [
      { key: "no", label: "NO" },
      { key: "task", label: "Task name" },
      { key: "difficulty", label: "Difficulty" },
      { key: "target", label: "Target(%)" },
      { key: "completionProgress", label: "Candidate(30%)" },
      { key: "progressAssessment", label: "Mentor(70%)" },
      { key: "kpiScore", label: "KPI score" },
      { key: "note", label: "Note" },
    ],
    [],
  );

  const [isEditable, setIsEditable] = useState(false);
  const [criteriaArray, setcriteriaArray] = useState<Criteria[]>([]);

  const renderCellTask = (task: any, columnKey: Key, index: number) => {
    const cellValue = task[columnKey as keyof any];

    switch (columnKey) {
      case "no":
        return <div>{index + 1}</div>;
      case "task":
        return <p className="text-xs">{task.title}</p>;
      case "difficulty":
        return (
          <p className="text-xs">
            {difficultyMap[task.difficulty] ?? task.difficulty}
          </p>
        );
      case "target":
        return <p className="text-xs">100</p>;
      case "completionProgress":
        return <p className="text-xs">{task.completionProgress}</p>;
      case "progressAssessment":
        return <p className="text-xs">{task.progressAssessment}</p>;
      case "kpiScore":
        return <p className="text-xs">{task.kpiScore}</p>;
      case "note":
        return <p className="text-xs">{task.note}</p>;
      default:
        return null;
    }
  };

  const renderCell = (criterias: Criteria, columnKey: Key, index: number) => {
    const cellValue = criterias[columnKey as keyof Criteria];

    const cloneCriterias = () => {
      if (
        !criteriaArray.find((criteria) => {
          return criteria.content === criterias.content;
        })
      ) {
        criteriaArray.push(criterias);
      }
    };

    const updateTheCriteriaScore = (content: string, newScore: number) => {
      if (!newScore) return;

      const clonedCriteriaArray = [...criteriaArray];
      const criteriaInformation = clonedCriteriaArray.find(
        (criteria) => criteria.content === content,
      );

      if (!criteriaInformation || newScore > 10 || newScore < 0) return;

      criteriaInformation.evaluateScore = newScore;
      setcriteriaArray(clonedCriteriaArray);
    };

    const updateTheCriteriaNote = (content: string, newNote: string) => {
      const clonedCriteriaArray = [...criteriaArray];
      const criteriaInformation = clonedCriteriaArray.find(
        (criteria) => criteria.content === content,
      );

      if (!criteriaInformation) return;

      criteriaInformation.notes = newNote;
      setcriteriaArray(clonedCriteriaArray);
    };

    cloneCriterias();

    switch (columnKey) {
      case "no":
        return <div>{index + 1}</div>;
      case "content":
        return <p className="text-xs">{criterias.content}</p>;
      case "unit":
        return <p className="text-xs">Score</p>;
      case "percent":
        return <p className="text-xs">{criterias.percent}%</p>;
      case "maxScore":
        return <p className="text-xs">{criterias.maxScore}</p>;
      case "evaluateScore":
        return (
          <Input
            type="number"
            name={criterias.content}
            readOnly={!isEditable}
            classNames={{
              inputWrapper: `${isEditable ? "bg-transparent shadow-none" : ""}`,
            }}
            value={
              isEditable
                ? criteriaArray[index].evaluateScore?.toString()
                : criterias.evaluateScore?.toString()
            }
            onValueChange={(value) =>
              updateTheCriteriaScore(criterias.content, Number(value))
            }
          />
        );
      case "note":
        return (
          <Input
            name={criterias.content}
            readOnly={!isEditable}
            classNames={{
              inputWrapper: `${isEditable ? "bg-transparent shadow-none" : ""}`,
            }}
            value={
              isEditable
                ? criteriaArray[index].notes?.toString()
                : criterias.notes?.toString()
            }
            onValueChange={(note) =>
              updateTheCriteriaNote(criterias.content, note)
            }
          />
        );
      case "finalScore":
        return <p className="text-xs">{criterias.finalScore}</p>;
      default:
        return null;
    }
  };

  const handleUpdateCriteria = () => {
    const criteriaRecord: {
      complianceCriteriaId: string;
      evaluateScore: number;
      notes: string;
    }[] = [];

    criteriaArray.map((criteria: Criteria) => {
      const criteriaObject = {
        complianceCriteriaId: "",
        evaluateScore: 0,
        notes: "",
      };

      criteriaObject.complianceCriteriaId = criteria.id;
      criteriaObject.evaluateScore = criteria.evaluateScore;
      criteriaObject.notes = criteria.notes;

      criteriaRecord.push(criteriaObject);
    });

    //.....
    mutate(criteriaRecord);
  };

  const pdfExportComponent = useRef<PDFExport>(null);

  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  return (
    <div className="p-6">
      <Button type="button" onClick={exportPDFWithComponent}>
        Export with component
      </Button>
      <PDFExport ref={pdfExportComponent} paperSize="auto" margin={40}>
        <div>
          <div className="text-center text-3xl font-semibold">
            INTERNSHIP FINAL REPORT
          </div>
          <h1 className="mb-3 mt-2 text-xl font-semibold">
            General Information
          </h1>
          <div className="mt-4 grid grid-cols-3 gap-6 text-sm">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Candidate Details
              </h2>
              <div className="mb-2">
                <span className="font-medium">Full Name:</span>{" "}
                {candidateInfor.candidateName}
              </div>
              <div className="mb-2">
                <span className="font-medium">University:</span>{" "}
                {candidateInfor.university}
              </div>
              <div>
                <span className="font-medium">Student Code:</span>{" "}
                {candidateInfor.studentCode}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Internship Details
              </h2>
              <div className="mb-2">
                <span className="font-medium">Internship Name:</span>{" "}
                {internPeriodViewReport.name}
              </div>
              <div className="mb-2">
                <span className="font-medium">Start Date:</span>{" "}
                {formatDate(internPeriodViewReport.startDate)}
              </div>
              <div>
                <span className="font-medium">End Date:</span>{" "}
                {formatDate(internPeriodViewReport.endDate)}
              </div>
            </div>

            <div>
              <h1 className="mb-4 text-lg font-semibold text-gray-800">
                Company Information
              </h1>
              <div className="mb-2">
                <span className="font-medium">Company Name:</span> Amazing Tech
              </div>
            </div>
          </div>
          <h1 className="mt-8 text-lg font-semibold">
            I. Work Performance Evaluation
          </h1>
          <div>
            {workPerformance?.map((workPerformance: any) => {
              const projectTasks = workPerformance.tasks || [];

              return (
                <div key={workPerformance.title}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mt-3">
                      <span className="font-medium">Project name:</span>{" "}
                      {workPerformance.title}
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Leader:</span>{" "}
                      {workPerformance.leader}
                    </div>
                    <div className="mb-4">
                      <span className="font-medium">Start date:</span>{" "}
                      {formatDate(workPerformance.startDate)}
                    </div>
                    <div className="mb-4">
                      <span className="font-medium">Release date:</span>{" "}
                      {formatDate(workPerformance.releaseDate)}
                    </div>
                  </div>

                  <div>
                    <Table className="w-full">
                      <TableHeader columns={columnsProject}>
                        {(column) => (
                          <TableColumn key={column.key}>
                            {column.label}
                          </TableColumn>
                        )}
                      </TableHeader>
                      <TableBody
                        items={projectTasks}
                        loadingState={isLoading ? "loading" : "idle"}
                        loadingContent={
                          <div className="flex items-center gap-2">
                            <Spinner />
                            Loading...
                          </div>
                        }
                        emptyContent={
                          <div>No tasks found for this project!</div>
                        }
                      >
                        {projectTasks.map((task: any, index: number) => (
                          <TableRow key={task.id}>
                            {(colKey) => (
                              <TableCell>
                                {renderCellTask(task, colKey, index)}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mb-4 grid grid-cols-2 text-sm">
                    {" "}
                    <div className="mt-3">
                      <span className="font-medium">Total difficulty: </span>{" "}
                      {workPerformance.totalDifficulty}
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Total KPI: </span>{" "}
                      {workPerformance.totalKPI}
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Total average score: </span>{" "}
                      {workPerformance.averageScore}
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Result: </span>{" "}
                      <span className={statusColor[workPerformance.result]}>
                        {workPerformance.result}
                      </span>
                    </div>
                  </div>
                  <Divider className="mb-8" />
                </div>
              );
            })}
          </div>
          <h1 className="mb-1 mt-3 text-lg font-semibold">
            Final project score
          </h1>
          <div className="mb-5 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Total difficulty: </span>
              {workPerformanceEvaluationFinal?.totalDifficulty}
            </div>
            <div>
              <span className="font-medium">Total KPI: </span>
              {workPerformanceEvaluationFinal?.totalKPI}
            </div>
            <div>
              <span className="font-medium">Total average score: </span>
              {workPerformanceEvaluationFinal?.averageScore}
            </div>
            <div>
              <span className="font-medium">Result: </span>
              {/* {statusColor(workPerformanceEvaluationFinal?.result)} */}
              <span
                className={statusColor[workPerformanceEvaluationFinal?.result]}
              >
                {workPerformanceEvaluationFinal?.result}
              </span>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">II. Compliance Evaluation</h1>
            <div className="flex justify-end gap-2">
              <Button
                variant="solid"
                color="primary"
                className={`${isEditable === false ? "hidden" : ""}`}
                onClick={handleUpdateCriteria}
              >
                Update
              </Button>

              <Button
                variant="solid"
                color="primary"
                onClick={() => setIsEditable(!isEditable)}
                className={`${isScored ? "hidden" : ""}`}
              >
                {isEditable ? "Cancel" : "Evaluate"}
              </Button>
            </div>
          </div>
          <div>
            <div>
              <Table className="w-full">
                <TableHeader columns={columnsCompany}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody
                  items={complianceCriterias}
                  loadingState={isLoading ? "loading" : "idle"}
                  loadingContent={
                    <div className="flex items-center gap-2">
                      <Spinner />
                      Loading...
                    </div>
                  }
                  emptyContent={<div>No evaluate found!</div>}
                >
                  {complianceCriterias.map(
                    (criteria: Criteria, index: number) => (
                      <TableRow key={criteria.id}>
                        {(colKey) => (
                          <TableCell>
                            {renderCell(criteria, colKey, index)}
                          </TableCell>
                        )}
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div>Total Percent: {complianceEvaluate.totalPercent}%</div>
              <div>
                Total Converted Score: {complianceEvaluate.totalConvertedScore}
              </div>
              <div>
                Result:{" "}
                <span className={statusColor[complianceEvaluate.result]}>
                  {complianceEvaluate.result}
                </span>
              </div>
            </div>
          </div>
          <h1 className="mt-8 text-xl font-semibold">Evaluation Total</h1>
          <div className="mt-2 grid grid-cols-2 gap-72">
            <div>
              <h1 className="text-lg">
                <span className="font-medium">Overall Score: </span>{" "}
                {candidateInfor.overallScore}
              </h1>
              <div className="text-lg">
                <span className="font-medium"> Final result: </span>
                <span className={statusColor[candidateInfor?.result]}>
                  {candidateInfor?.result}
                </span>
              </div>
            </div>
            <div>
              <div className="text-center font-semibold">Evaluator name </div>
              <div className="text-center">(Sign and write full name) </div>
            </div>
          </div>
        </div>
      </PDFExport>
    </div>
  );
}
