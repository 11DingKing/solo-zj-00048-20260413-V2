import {
  Button,
  Center,
  Container,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  Badge,
  Box,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";

export const SharedTodoDetail = () => {
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const isMounted = useRef(false);
  const { todoId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const background = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    if (isMounted.current) return;
    fetchSharedTodo();
    isMounted.current = true;
  }, [todoId]);

  const fetchSharedTodo = () => {
    setLoading(true);
    axiosInstance
      .get("/todo/shared-with-me")
      .then((res) => {
        const found = res.data.find((s) => s.todo_id === todoId);
        if (found) {
          setShare(found);
        } else {
          toast({
            title: "Todo not found",
            status: "error",
            isClosable: true,
            duration: 2000,
          });
          navigate("/shared", { replace: true });
        }
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Failed to load todo",
          status: "error",
          isClosable: true,
          duration: 2000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleStatus = () => {
    if (!share) return;
    
    setUpdating(true);
    axiosInstance
      .put(`/todo/${share.todo_id}`, { status: !share.todo_status })
      .then((res) => {
        setShare((prev) => ({
          ...prev,
          todo_status: res.data.status,
          todo_updated_at: res.data.updated_at,
        }));
        toast({
          title: res.data.status ? "Marked as complete" : "Marked as pending",
          status: "success",
          isClosable: true,
          duration: 1500,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Failed to update status",
          status: "error",
          isClosable: true,
          duration: 2000,
        });
      })
      .finally(() => setUpdating(false));
  };

  if (loading) {
    return (
      <Container mt={6}>
        <Center mt={6}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="green.200"
            color="green.500"
            size="xl"
          />
        </Center>
      </Container>
    );
  }

  if (!share) {
    return null;
  }

  return (
    <>
      <Container mt={6}>
        <Button
          colorScheme="gray"
          onClick={() => navigate("/shared", { replace: true })}
        >
          Back
        </Button>
      </Container>
      <Container
        bg={background}
        minHeight="7rem"
        my={3}
        p={3}
        rounded="lg"
      >
        <Text fontSize={22} fontWeight="bold">
          {share.todo_title}
        </Text>
        <Text fontSize="sm" color="gray.500" mb={3}>
          Shared by: {share.owner_email}
        </Text>
        <Text bg="gray.500" mt={2} p={2} rounded="lg" mb={4}>
          {share.todo_description}
        </Text>
        
        <Box mb={4}>
          <Badge colorScheme={share.todo_status ? "green" : "purple"} fontSize="md" px={3} py={1}>
            {share.todo_status ? "Complete" : "Pending"}
          </Badge>
        </Box>

        <FormControl display="flex" alignItems="center" mb={4}>
          <FormLabel htmlFor="status-toggle" mb={0}>
            Mark as Complete
          </FormLabel>
          <Switch
            id="status-toggle"
            size="lg"
            colorScheme="green"
            isChecked={share.todo_status}
            onChange={toggleStatus}
            isLoading={updating}
          />
        </FormControl>

        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          Note: As a shared user, you can only update the status of this todo.
          Title and description cannot be modified.
        </Text>
      </Container>
    </>
  );
};
