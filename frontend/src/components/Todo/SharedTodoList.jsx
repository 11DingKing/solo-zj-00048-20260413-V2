import { Box, Center, Container, Spinner, Text, Badge, Flex, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axios";

export const SharedTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isMounted.current) return;
    fetchSharedTodos();
    isMounted.current = true;
  }, []);

  const fetchSharedTodos = () => {
    setLoading(true);
    axiosInstance
      .get("/todo/shared-with-me")
      .then((res) => {
        setTodos(res.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const SharedTodoCard = ({ share }) => {
    return (
      <Flex
        bg={useColorModeValue("gray.300", "gray.600")}
        minHeight="3rem"
        my={3}
        p={3}
        rounded="lg"
        alignItems="center"
        justifyContent="space-between"
        _hover={{
          opacity: 0.9,
          cursor: "pointer",
          transform: "translateY(-3px)",
        }}
        onClick={() => navigate(`/shared/${share.todo_id}`, { replace: true })}
      >
        <Box>
          <Text>{share.todo_title}</Text>
          <Text fontSize="sm" color="gray.500">
            Shared by: {share.owner_email}
          </Text>
        </Box>
        <Badge colorScheme={share.todo_status ? "green" : "purple"}>
          {share.todo_status ? "Complete" : "Pending"}
        </Badge>
      </Flex>
    );
  };

  return (
    <Container mt={9}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Shared with Me
      </Text>
      {loading ? (
        <Center mt={6}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="green.200"
            color="green.500"
            size="xl"
          />
        </Center>
      ) : (
        <Box mt={6}>
          {todos?.length === 0 ? (
            <Text color="gray.500" textAlign="center">
              No todos shared with you yet.
            </Text>
          ) : (
            todos?.map((share) => (
              <SharedTodoCard share={share} key={share.share_id} />
            ))
          )}
        </Box>
      )}
    </Container>
  );
};
