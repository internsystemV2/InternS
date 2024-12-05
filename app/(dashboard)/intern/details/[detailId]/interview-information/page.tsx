"use client";
import APIClient from "@/libs/api-client";
import { API_ENDPOINTS } from "@/libs/config";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { PaginationResponseSuccess } from "@/libs/types";

import { Select, SelectItem } from "@nextui-org/select";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { toast } from "sonner";
import {
  GetPositionPaginationResponse,
  Position,
} from "../../../_types/GetPositionPaginationResponse";
import { GetCandidateQuestionTemplateResponse } from "../../../_types/GetCandidateQuestionTemplate";
import { useParams } from "next/navigation";
import Image from "next/image";

const apiClient = new APIClient({
  onFulfilled: (response) => response,
  onRejected: (error) => {
    if (error.response) {
      console.log(error.response.data);
    }

    return {
      data: error.response.data,
    };
  },
});

enum QuestionTemplateStatus {
  NOT_CREATED = "NOT_CREATED",
  CREATED = "CREATED",
  SUBMITTED = "SUBMITTED",
  EVALUATED = "EVALUATED",
}

export default function InterviewInformationPage() {
  const { detailId: candidateId } = useParams();

  const [selectedPosition, setSelectedPosition] = React.useState<string | null>(
    null,
  );

  const [selectedTechnologies, setSelectedTechnologies] = React.useState(
    new Set([]),
  );

  const {
    data: candidateQuestionTemplateDetails,
    isLoading: isCandidateQuestionTemplateDetailsLoading,
    refetch: refetchCandidateQuestionTemplateDetails,
  } = useQuery({
    queryKey: ["candidateQuestionTemplateDetails", candidateId],
    queryFn: async () => {
      const response =
        await apiClient.get<GetCandidateQuestionTemplateResponse>(
          API_ENDPOINTS.questionTemplate +
            `/${candidateId}/question-template-details`,
        );

      if (response.statusCode == "200") {
        return response.data;
      }

      return null;
    },
  });

  const { data: positions, isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const response = (await apiClient.get<GetPositionPaginationResponse>(
        API_ENDPOINTS.position,
        {
          params: {
            pageSize: 20,
          },
        },
      )) as PaginationResponseSuccess<Position>;

      return response.data.pagingData;
    },
  });

  const createQuestions = async () => {
    // make sure that selectedPosition and selectedTechnologies are not empty
    if (!selectedPosition || selectedTechnologies.size === 0) {
      toast.error("Please select position and technologies");

      return;
    }

    const params = {
      positionId: selectedPosition,
      technologyIds: Array.from(selectedTechnologies),
    };

    const response = await apiClient.post<{
      statusCode: string;
      message: string;
    }>(API_ENDPOINTS.questionTemplate + `/candidate/${candidateId}`, params);

    if (response.statusCode == "200") {
      toast.success("Successfully created questions");
      refetchCandidateQuestionTemplateDetails();
    } else {
      toast.error(response.message);
    }
  };

  let answers: any[] = [];

  let evaluation: any[] = [];

  const technologies =
    positions?.find((position) => position.id === selectedPosition)
      ?.tenologies || [];

  const submitAnswer = async (formData: FormData) => {
    const answers = Array.from(formData.entries()).map(([key, value]) => ({
      interviewQuestionId: key,
      answer: value,
    }));

    const response = await apiClient.post<{
      statusCode: string;
      message: string;
    }>(
      API_ENDPOINTS.questionTemplate +
        `/${candidateQuestionTemplateDetails?.id}/submit-answers`,
      answers,
      {},
      true,
    );

    if (response.statusCode === "200") {
      toast.success("Successfully submitted answers");

      refetchCandidateQuestionTemplateDetails();
    } else {
      toast.error(response.message);
    }
  };

  const submitEvaluation = async (formData: FormData) => {
    const evaluation = Array.from(formData.entries()).map(([key, value]) => ({
      questionTemplateDetailId: key,
      answerScore: value,
    }));

    const response = await apiClient.post<{
      statusCode: string;
      message: string;
    }>(
      API_ENDPOINTS.questionTemplate +
        `/${candidateQuestionTemplateDetails?.id}/evaluate`,
      evaluation,
      {},
      true,
    );

    if (response.statusCode === "200") {
      refetchCandidateQuestionTemplateDetails();
      toast.success("Successfully submitted evaluation");
    } else {
      toast.error(response.message);
    }
  };

  let status: QuestionTemplateStatus = QuestionTemplateStatus.NOT_CREATED;

  if (candidateQuestionTemplateDetails) {
    status = QuestionTemplateStatus.EVALUATED;

    if (candidateQuestionTemplateDetails.result === "WaitAnswer") {
      status = QuestionTemplateStatus.CREATED;
    }

    if (candidateQuestionTemplateDetails.result === "WaitResult") {
      status = QuestionTemplateStatus.SUBMITTED;
    }
  }
  if (isCandidateQuestionTemplateDetailsLoading || isLoading) {
    return <div>Loading...</div>;
  }

  console.log(status);

  const titleMapping = {
    [QuestionTemplateStatus.NOT_CREATED]: "Create questions",
    [QuestionTemplateStatus.CREATED]:
      "Answers not submitted! Please submit your answers.",
    [QuestionTemplateStatus.SUBMITTED]:
      "Answers submitted! Please evaluate the answers.",
    [QuestionTemplateStatus.EVALUATED]: "📝 Evaluation completed!",
  };

  if (status === QuestionTemplateStatus.NOT_CREATED)
    return (
      <form className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          <span role="img" aria-label="form-icon">
            📝
          </span>{" "}
          Interview Questions Form
        </h2>
        <div className="mb-2">
          This candidate do not have question form yet, please create one!
        </div>
        <Select
          label="Select one position"
          placeholder="Back-end"
          items={positions || []}
          onChange={(item) => {
            setSelectedPosition(item.target.value);
            setSelectedTechnologies(new Set([]));
          }}
        >
          {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
        </Select>
        {selectedPosition && (
          <div className="flex flex-col gap-3">
            <Select
              label="Select technologies"
              placeholder="Java, Javascript, Nodejs, ..."
              items={technologies}
              selectionMode="multiple"
              // disabled={!selectedPosition}
              onSelectionChange={setSelectedTechnologies as any}
              selectedKeys={selectedTechnologies}
            >
              {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
            </Select>
          </div>
        )}
        {Array.from(selectedTechnologies)[0] ? (
          <Button onClick={createQuestions}>Create questions</Button>
        ) : (
          <></>
        )}
      </form>
    );
  else
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{titleMapping[status]}</h1>
        {
          // Show the evaluation result
          status === QuestionTemplateStatus.EVALUATED && (
            <Card shadow="sm">
              <CardHeader>
                <div className="flex w-full items-center justify-between">
                  <p className="text-lg font-medium">
                    {candidateQuestionTemplateDetails?.name}
                  </p>
                </div>
              </CardHeader>
              <CardBody className="gap-3">
                <p>
                  Total score:{" "}
                  {candidateQuestionTemplateDetails?.totalAnswerScore}/
                  {candidateQuestionTemplateDetails?.totalQuestionScore}
                </p>
                <p className="flex gap-1">
                  Result:
                  <p
                    className={
                      candidateQuestionTemplateDetails?.result == "Passed"
                        ? "font-medium text-green-600"
                        : "font-medium text-red-600"
                    }
                  >
                    {candidateQuestionTemplateDetails?.result}
                  </p>
                </p>
                <div className="flex gap-2">
                  Evaluator name:{" "}
                  <p className="font-medium">
                    {candidateQuestionTemplateDetails?.reviewerName}
                  </p>
                </div>
              </CardBody>
            </Card>
          )
        }
        <form
          className="mt-2 flex flex-col gap-3"
          action={
            status === QuestionTemplateStatus.CREATED
              ? submitAnswer
              : submitEvaluation
          }
        >
          {candidateQuestionTemplateDetails?.questionTemplateDetails.map(
            (questionTemplateDetail, id) => (
              <div
                className="mb-6 flex h-fit gap-4"
                key={questionTemplateDetail.id}
              >
                <Card shadow="sm" className="w-9/12">
                  <CardHeader>
                    <div className="flex w-full items-center justify-between">
                      <p className="text-2xl font-semibold">
                        Question {id + 1}
                      </p>
                      <div className="flex flex-col items-end gap-2">
                        <Chip className="ml-auto">
                          Max score: {questionTemplateDetail.maxQuestionScore}
                        </Chip>

                        {status !== QuestionTemplateStatus.CREATED && (
                          <Input
                            label="Your score:"
                            labelPlacement="outside-left"
                            type="number"
                            defaultValue={"0"}
                            name={questionTemplateDetail.id}
                            max={questionTemplateDetail.maxQuestionScore}
                            min={0}
                            validate={(value) => {
                              if (Number(value) < 0) {
                                return "Score must be greater than 0";
                              }

                              if (
                                Number(value) >
                                Number(questionTemplateDetail.maxQuestionScore)
                              ) {
                                return "Score must be less than max score";
                              }
                            }}
                            onChange={(e) => {
                              // remove the evaluation if it already exists
                              evaluation = evaluation.filter(
                                (evaluation) =>
                                  evaluation.questionTemplateDetailId !==
                                  questionTemplateDetail.id,
                              );

                              evaluation.push({
                                questionTemplateDetailId:
                                  questionTemplateDetail.id,
                                answerScore: Number(e.target.value),
                              });
                            }}
                            variant={
                              status === QuestionTemplateStatus.SUBMITTED
                                ? "bordered"
                                : "flat"
                            }
                            disabled={
                              status !== QuestionTemplateStatus.SUBMITTED
                            }
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="gap-3">
                    <h2>{questionTemplateDetail.interviewQuestion.content}</h2>
                    <Textarea
                      variant={
                        status === QuestionTemplateStatus.CREATED
                          ? "bordered"
                          : "flat"
                      }
                      maxRows={7}
                      minRows={5}
                      name={questionTemplateDetail.interviewQuestion.id}
                      placeholder="Your Answer"
                      label="Your Answer:"
                      labelPlacement="outside"
                      onChange={(e) => {
                        // remove the answer if it already exists
                        answers = answers.filter(
                          (answer) =>
                            answer.interviewQuestionId !==
                            questionTemplateDetail.interviewQuestion.id,
                        );

                        answers.push({
                          interviewQuestionId:
                            questionTemplateDetail.interviewQuestion.id,
                          answer: e.target.value,
                        });
                      }}
                      defaultValue={
                        // get the last answer
                        questionTemplateDetail?.interviewAnswers[
                          questionTemplateDetail.interviewAnswers.length - 1
                        ]?.answer || ""
                      }
                      disabled={status !== QuestionTemplateStatus.CREATED}
                    />
                  </CardBody>
                </Card>
                <div className="h-fit w-fit border">
                  {questionTemplateDetail?.interviewQuestion?.imageUri ? (
                    <Image
                      width={250}
                      height={250}
                      alt={`${questionTemplateDetail?.interviewQuestion?.content} Image`}
                      src={questionTemplateDetail?.interviewQuestion?.imageUri}
                      className="object-contain"
                    />
                  ) : (
                    <Image
                      className="border"
                      width={250}
                      height={250}
                      alt="Default Question Image"
                      src="/icons/technology/noimg.png"
                    />
                  )}
                </div>
              </div>
            ),
          )}

          {status !== QuestionTemplateStatus.EVALUATED && (
            <Button type="submit" color="primary" fullWidth variant="shadow">
              {status === QuestionTemplateStatus.CREATED
                ? "Submit Answers"
                : "Submit Evaluation"}
            </Button>
          )}
        </form>
      </div>
    );
}
