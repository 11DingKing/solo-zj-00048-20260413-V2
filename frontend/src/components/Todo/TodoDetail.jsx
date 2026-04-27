import {
  Badge,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import { AddUpdateTodoModal } from "./AddUpdateTodoModal";
import { ShareTodoModal } from "./ShareTodoModal";

const PRIORITY_COLORS = {
  urgent: "red",
  high: "orange",
  normal: "blue",
  low: "gray",
};

const PRIORITY_LABELS = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDueDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const TodoDetail = () => {
  const [todo, setTodo] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);
  const { todoId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const background = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    if (isMounted.current) return;
    fetchAllData();
    isMounted.current = true;
  }, [todoId]);

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([fetchTodo(), fetchUsers()])
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchTodo = () => {
    return axiosInstance
      .get(`/todo/${todoId}`)
      .then((res) => {
        setTodo(res.data);
      })
      .catch((error) => console.error(error));
  };

  const fetchUsers = () => {
    return axiosInstance
      .get("/users/list")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((error) => console.error(error));
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? user.username : userId;
  };

  const deleteTodo = () => {
    setLoading(true);
    axiosInstance
      .delete(`/todo/${todoId}`)
      .then(() => {
        toast({
          title: "Todo deleted successfully",
          status: "success",
          isClosable: true,
          duration: 1500,
        });
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Couldn't delete todo",
          status: "error",
          isClosable: true,
          duration: 2000,
        });
      })
      .finally(() => setLoading(false));
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

  return (
    <>
      <Container mt={6}>
        <Button
          colorScheme="gray"
          onClick={() => navigate("/", { replace: true })}
        >
          Back
        </Button>
      </Container>
      <Container
        bg={background}
        minHeight="7rem"
        my={3}
        p={6}
        rounded="lg"
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="lg">{todo.title}</Heading>
          
          <HStack spacing={2} flexWrap="wrap">
            <Badge
              colorScheme={todo.status ? "green" : "purple"}
              variant="solid"
              fontSize="md"
              p={2}
            >
              {todo.status ? "已完成" : "待处理"}
            </Badge>
            
            <Badge
              colorScheme={PRIORITY_COLORS[todo.priority] || "gray"}
              variant="solid"
              fontSize="md"
              p={2}
            >
              {PRIORITY_LABELS[todo.priority] || "Normal"}
            </Badge>
            
            {todo.due_date && (
              <Badge
                colorScheme="gray"
                variant="subtle"
                fontSize="md"
                p={2}
              >
                到期: {formatDate(todo.due_date)}
              </Badge>
            )}
          </HStack>

          {todo.assignee_id && (
            <Badge
              colorScheme="teal"
              variant="subtle"
              fontSize="md"
              p={2}
              width="fit-content"
            >
              分配给: {getUserName(todo.assignee_id)}
            </Badge>
          )}

          <Text fontSize="sm" color="gray.600">
            创建时间: {formatDate(todo.created_at)} | 更新时间: {formatDate(todo.updated_at)}
          </Text>

          <Text
            bg="gray.500"
            mt={2}
            p={4}
            rounded="lg"
            color="white"
            minH="100px"
          >
            {todo.description}
          </Text>
          
          <Stack spacing={3} mt={4}>
            <AddUpdateTodoModal
              editable={true}
              defaultValues={{
                title: todo.title,
                description: todo.description,
                status: todo.status,
                priority: todo.priority || "normal",
                due_date: formatDueDate(todo.due_date),
                assignee_id: todo.assignee_id || "",
              }}
              onSuccess={fetchAllData}
              users={users}
            />
            <ShareTodoModal todoId={todo.todo_id} onSuccess={fetchAllData} />
            <Button
              isLoading={loading}
              colorScheme="red"
              width="100%"
              onClick={deleteTodo}
            >
              Delete
            </Button>
          </Stack>
        </VStack>
      </Container>
    </>
  );
};
