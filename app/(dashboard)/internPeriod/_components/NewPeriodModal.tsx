"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { DatePicker } from "@nextui-org/date-picker";
import { CreateIcon } from "@/app/(dashboard)/intern/_components/Icons";
import { Calendar, CalendarDate, parseDate } from "@internationalized/date"; // Parses a date string or Date object to DateValue
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/libs/config";
import { toast } from "sonner";
import { addMonths } from "date-fns";

interface PeriodData {
  name: string;
  startDate: string;
  endDate: string;
  internshipDuration: number;
  description: string;
  universityAttended: string;
  maxCandidateQuantity: number;
  status: number;
}

export default function NewPeriodModal() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [universityAttended, setUniversityAttended] = useState("");
  const [internshipDuration, setInternshipDuration] = useState("");
  const [maxCandidateQuantity, setMaxCandidateQuantity] = useState("");

  const [status, setStatus] = useState("0");

  const [startDate, setStartDate] = useState<CalendarDate>(
    parseDate(
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ),
  );
  const [endDate, setEndDate] = useState<CalendarDate>(
    parseDate(new Date().toISOString().split("T")[0]),
  );

  const queryClient = useQueryClient();

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;

    setInternshipDuration(newDuration);

    const durationInMonths = parseInt(newDuration, 10);

    const updatedEndDate = addMonths(
      new Date(startDate.toString()),
      durationInMonths,
    );

    setEndDate(parseDate(updatedEndDate.toISOString().split("T")[0]));
  };

  const { mutate } = useMutation({
    mutationFn: async (newPeriod: PeriodData) => {
      const response = await fetch(API_ENDPOINTS.internPeriod, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPeriod),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "Failed to create intern period");
      }

      return response.json();
    },
    onError: (error) => {
      console.error("Error:", error); // Log the error to the console
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("New intern period created successfully!");
      queryClient.invalidateQueries();
      onClose();
    },
  });

  const handleSubmit = () => {
    mutate({
      name,
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      internshipDuration: Number(internshipDuration),
      description,
      universityAttended,
      maxCandidateQuantity: Number(maxCandidateQuantity),
      status: Number(status),
    });
  };

  return (
    <>
      <Button
        color="primary"
        size="md"
        startContent={<CreateIcon />}
        className="text-white"
        variant="shadow"
        onPress={onOpen}
      >
        New Intern Period
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="max-w-xl">
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add New Intern Period
            </ModalHeader>

            <ModalBody className="gap-5">
              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="Period Name"
                  placeholder="Enter period name"
                  labelPlacement="outside"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  isRequired
                />
                <Input
                  label="Description"
                  placeholder="Enter description"
                  labelPlacement="outside"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  isRequired
                />
                {/* <Input
                  label="University attended"
                  placeholder="Enter university"
                  labelPlacement="outside"
                  value={universityAttended}
                  onChange={(e) => setUniversityAttended(e.target.value)}
                  isRequired
                /> */}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Internship Duration"
                  placeholder="Enter duration (months)"
                  labelPlacement="outside"
                  value={internshipDuration}
                  onChange={handleDurationChange}
                  isRequired
                  type="number"
                  min="1"
                />

                <Input
                  label="Total member"
                  placeholder="Enter total member"
                  labelPlacement="outside"
                  value={maxCandidateQuantity}
                  onChange={(e) => setMaxCandidateQuantity(e.target.value)}
                  type="number"
                  min="1"
                  isRequired
                />
              </div>

              <div className="flex w-full gap-3">
                <DatePicker
                  label="Start date"
                  labelPlacement="outside"
                  value={startDate}
                  onChange={(newDate) => setStartDate(newDate)}
                  isRequired
                />
                <DatePicker
                  label="End date"
                  labelPlacement="outside"
                  value={endDate}
                  onChange={(endDate) => setEndDate(endDate)}
                  isRequired
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleSubmit} className="w-full">
                Submit
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
