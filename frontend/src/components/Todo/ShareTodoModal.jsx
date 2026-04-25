import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axiosInstance from "../../services/axios";


export const ShareTodoModal = ({ todoId, onSuccess = () => {}, ...rest }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharing, setSharing] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (isOpen && todoId) {
      fetchShares();
    }
  }, [isOpen, todoId]);

  const fetchShares = () => {
    if (!todoId) return;
    setLoadingShares(true);
    axiosInstance
      .get(`/todo/my-shares/${todoId}`)
      .then((res) => {
        setShares(res.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoadingShares(false);
      });
  };

  const onSubmit = async (values) => {
    if (!todoId) return;
    
    setSharing(true);
    try {
      await axiosInstance.post("/todo/share", {
        todo_id: todoId,
        shared_with_email: values.email,
      });
      toast({
        title: "Todo shared successfully",
        status: "success",
        isClosable: true,
        duration: 1500,
      });
      reset({ email: "" });
      fetchShares();
      onSuccess();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Something went wrong";
      toast({
        title: errorMessage,
        status: "error",
        isClosable: true,
        duration: 2000,
      });
    } finally {
      setSharing(false);
    }
  };

  const cancelShare = async (shareId) => {
    try {
      await axiosInstance.delete(`/todo/share/${shareId}`);
      toast({
        title: "Share cancelled",
        status: "success",
        isClosable: true,
        duration: 1500,
      });
      fetchShares();
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to cancel share",
        status: "error",
        isClosable: true,
        duration: 2000,
      });
    }
  };

  return (
    <Box {...rest}>
      <Button w="100%" colorScheme="blue" onClick={onOpen}>
        Share
      </Button>
      <Modal
        closeOnOverlayClick={false}
        size="xl"
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Todo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={errors.email} mb={4}>
                <FormLabel>Share with (Email)</FormLabel>
                <Input
                  placeholder="Enter user email..."
                  background={useColorModeValue("gray.300", "gray.600")}
                  type="email"
                  variant="filled"
                  size="lg"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>

              <Button
                colorScheme="blue"
                type="submit"
                isLoading={sharing || isSubmitting}
                loadingText="Sharing..."
                width="100%"
                mb={6}
              >
                Share
              </Button>
            </form>

            <Box>
              <Text fontWeight="bold" mb={2}>
                Shared with:
              </Text>
              {loadingShares ? (
                <Text color="gray.500">Loading...</Text>
              ) : shares.length === 0 ? (
                <Text color="gray.500">Not shared with anyone yet.</Text>
              ) : (
                <Stack spacing={2}>
                  {shares.map((share) => (
                    <HStack
                      key={share.share_id}
                      bg={useColorModeValue("gray.200", "gray.700")}
                      p={2}
                      rounded="md"
                      justify="space-between"
                    >
                      <Box>
                        <Text fontWeight="medium">{share.shared_with.email}</Text>
                        <Text fontSize="xs" color="gray.500">
                          @{share.shared_with.username}
                        </Text>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => cancelShare(share.share_id)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  ))}
                </Stack>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
