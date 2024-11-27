import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import React from "react";
import { deleteTask } from "@/actions/delete-task";
import { TrashIcon } from "@/components/icons/OtherIcons";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
export type TaskModalProps = {
  taskId: string;
};

export default function TaskDeleteModal(props: TaskModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const queryClient = useQueryClient();

  return (
    <>
      <Button onClick={onOpen} isIconOnly variant="light">
        <TrashIcon size={16} />
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="w-[800px]">
        <ModalContent className="">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1 className="">Delete Task</h1>
              </ModalHeader>
              <ModalBody className="">
                <h1>Are you sure you want to delete this task?</h1>
              </ModalBody>

              <ModalFooter>
                <Button
                  onClick={() => {
                    deleteTask(props.taskId);
                    queryClient.invalidateQueries();
                    toast.success("Task deleted successfully");
                    onClose();
                  }}
                  fullWidth
                  variant="shadow"
                  color="danger"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                  }}
                  fullWidth
                  variant="shadow"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
