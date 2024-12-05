"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/libs/config";
import { Tooltip } from "@nextui-org/tooltip";
import {
  CreateIcon,
  DeleteIcon,
  EditIcon,
} from "@/app/(dashboard)/question/_components/Icons";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { Spinner } from "@nextui-org/spinner";
import Link from "next/link";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { toast } from "sonner";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import Image from "next/image";

// interface QuestionData {
//   content: string;
//   imageUri: string;
//   difficulty: string;
//   technologyId: string;
// }

export default function QuestionBankPage() {
  const params = useParams();

  const techId = params.questionsbank as string;
  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
    onOpenChange: onOpenDeleteChange,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
    onOpenChange: onOpenEditChange,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
    onOpenChange: onOpenCreateChange,
  } = useDisclosure();

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [technologyId] = useState(techId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["data", techId],
    queryFn: async () => {
      const response = await fetch(
        `${API_ENDPOINTS.interviewQuestion}/technology/${techId}/interview-questions`,
      );

      const questions = response.json();

      return questions;
    },
  });

  const questionsData = data?.data?.interviewQuestions;
  const techName = data?.data?.technologyName;

  const [updateData, setUpdateData] = useState({
    content: "",
    imageUri: "",
    difficulty: "",
    technologyId: techId,
  });

  const mutation = useMutation({
    mutationFn: (id: string) =>
      fetch(API_ENDPOINTS.interviewQuestion + "/" + id, {
        method: "DELETE",
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(errorData.message);
        }

        return response.json();
      }),

    onError: (error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success("Deleted university successfully!");
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await fetch(API_ENDPOINTS.interviewQuestion + "/" + selectedQuestion, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      toast.success("Updated successfully!");
      refetch();
      onCloseEdit();
    },

    onError: (error) => {
      console.error("Error:", error); // Log the error to the console
      toast.error(error.message);
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (newQuestion: FormData) => {
      const response = await fetch(API_ENDPOINTS.interviewQuestion, {
        method: "POST",
        body: newQuestion,
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message);
      }

      return response.json();
    },

    onError: (error) => {
      console.error("Error:", error); // Log the error to the console
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success("New university added successfully!");
      refetch();
      onCloseCreate();
    },
  });

  const handleDelete = (id: string) => {
    mutation.mutate(id);
    onCloseDelete();
  };

  const openModalDelete = (id: string) => {
    onOpenDelete();
    setSelectedQuestion(String(id));
  };

  const openEditModal = (
    id: React.SetStateAction<string>,
    content: string,
    imageUri: string,
    difficulty: number,
    technologyId: string,
  ) => {
    setSelectedQuestion(id);
    setUpdateData({
      content,
      imageUri,
      difficulty: difficulty.toString(),
      technologyId,
    });
    onOpenEdit();
  };

  const handleUpdate = () => {
    updateMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreate = () => {
    if (!content || !difficulty || !technologyId || !selectedFile) {
      toast.error("All fields are required and select an image!");
      return;
    }

    const formData = new FormData();

    formData.append("content", content);
    formData.append("difficulty", difficulty.toString());
    formData.append("technologyId", technologyId);
    formData.append("ImageUri", selectedFile);
    mutate(formData);

    // mutate({
    //   content,
    //   difficulty,
    //   imageUri,
    //   technologyId,
    // });
  };

  const columns = [
    {
      key: "no",
      label: "NO",
    },
    {
      key: "imageUri",
      label: "IMAGE URI",
    },
    {
      key: "content",
      label: "CONTENT",
    },

    {
      key: "difficulty",
      label: "DIFFICULTY",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ];

  const renderCell = React.useCallback(
    (question: any, columnKey: React.Key, index: number) => {
      const cellValue = question[columnKey as keyof typeof question];

      switch (columnKey) {
        case "no":
          return <div>{index + 1}</div>;
        case "content":
          return <div>{question.content}</div>;
        case "imageUri":
          return (
            <div>
              {question.imageUri ? (
                <Image
                  width={50}
                  height={50}
                  alt={`${question.content} Image`}
                  src={question.imageUri}
                  className="object-contain"
                />
              ) : (
                <Image
                  width={50}
                  height={50}
                  alt="Default Question Image"
                  src="/icons/technology/noimg.png"
                  className="object-contain"
                />
              )}
            </div>
          );
        case "difficulty":
          return <div>{question.difficulty}</div>;
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit ">
                <button
                  className="cursor-pointer text-lg text-default-400 active:opacity-50"
                  onClick={() => {
                    openEditModal(
                      question.id,
                      question.content,
                      question.imageUri,
                      question.difficulty,
                      techId,
                    );
                  }}
                >
                  <EditIcon />
                </button>
              </Tooltip>
              <Tooltip color="danger" content="Delete">
                <button
                  className="cursor-pointer text-lg text-danger active:opacity-50"
                  onClick={() => openModalDelete(question.id)}
                >
                  <DeleteIcon />
                </button>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [],
  );

  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <h1 className="text-left text-2xl font-semibold capitalize text-black">
        Question List Management
      </h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/question"
            className="bold font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Question Bank
          </Link>
          <span className="mx-2"> &gt; </span>
          <div className="font-semibold">{techName}</div>
        </div>
        <Button color="primary" variant="shadow" onPress={onOpenCreate}>
          <CreateIcon />
          Create new question
        </Button>
      </div>

      <Table>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={questionsData ?? []}
          loadingState={isLoading ? "loading" : "idle"}
          loadingContent={
            <div className="flex items-center gap-2">
              <Spinner />
              Loading...
            </div>
          }
          emptyContent={<div>No question found!</div>}
        >
          {questionsData?.map(
            (
              question: any,
              index: number, // Use .map to handle the index
            ) => (
              <TableRow key={question.id}>
                {(columnKey) => (
                  <TableCell>
                    {renderCell(question, columnKey, index)}
                  </TableCell> // Pass index to renderCell
                )}
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onOpenDeleteChange}
        className="max-w-fit"
      >
        <ModalContent>
          <ModalBody className="mt-5">
            Are you sure you want to delete?
            <div className="mt-5 grid grid-cols-2 gap-5">
              <Button
                onClick={() => handleDelete(selectedQuestion)}
                color="primary"
              >
                Yes
              </Button>
              <Button onClick={onCloseDelete}>No</Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onOpenChange={onOpenEditChange}
        className="max-w-xl"
      >
        <ModalContent>
          <ModalHeader className="mt-2 flex justify-center">
            Update information
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="Content"
              label="Content"
              value={updateData.content}
              onChange={(e) =>
                setUpdateData({ ...updateData, content: e.target.value })
              }
            />

            <Input
              placeholder="Image URL"
              label="Image URL"
              className="mt-2"
              value={updateData.imageUri}
              onChange={(e) =>
                setUpdateData({ ...updateData, imageUri: e.target.value })
              }
            />
            <Input
              placeholder="Difficulty"
              label="Difficulty"
              className="mt-2"
              value={updateData.difficulty}
              onChange={(e) =>
                setUpdateData({ ...updateData, difficulty: e.target.value })
              }
            />

            <div className="mt-2 grid grid-cols-2 gap-5">
              <Button onClick={handleUpdate} color="primary">
                Update
              </Button>
              <Button onClick={onCloseEdit}>Cancel</Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isCreateOpen}
        onOpenChange={onOpenCreateChange}
        className="max-w-xl"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add New Question
            </ModalHeader>

            <ModalBody>
              <div className="grid gap-5">
                <Input
                  label="Question content"
                  placeholder="Enter question's content"
                  labelPlacement="outside"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  isRequired
                />

                <Input
                  label="Difficult"
                  placeholder="Enter question's difficult "
                  labelPlacement="outside"
                  type="number"
                  value={difficulty.toString()}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  isRequired
                />
                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-500 hover:text-blue-700"
                  >
                    Upload Image
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".png, .jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Selected file: </span>
                      {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex">
              <Button color="primary" onPress={handleCreate} className="w-full">
                Submit
              </Button>
              <Button onPress={onCloseCreate} className="w-full">
                Cancel
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
}
