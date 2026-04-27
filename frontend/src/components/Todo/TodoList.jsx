import {
  Box,
  Center,
  Container,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
  Button,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../services/axios";
import { AddUpdateTodoModal } from "./AddUpdateTodoModal";
import { TodoCard } from "./TodoCard";

const PRIORITY_COLORS = {
  urgent: "red",
  high: "orange",
  normal: "blue",
  low: "gray",
};

export const TodoList = () => {
  const [ownedTodos, setOwnedTodos] = useState([]);
  const [assignedTodos, setAssignedTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const isMounted = useRef(false);
  const toast = useToast();

  const barBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (isMounted.current) return;
    fetchAllData();
    isMounted.current = true;
  }, []);

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([fetchOwnedTodos(), fetchAssignedTodos(), fetchUsers()])
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchOwnedTodos = () => {
    return axiosInstance
      .get("/todo/owned")
      .then((res) => {
        setOwnedTodos(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchAssignedTodos = () => {
    return axiosInstance
      .get("/todo/assigned")
      .then((res) => {
        setAssignedTodos(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchUsers = () => {
    return axiosInstance
      .get("/users/list")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? user.username : userId;
  };

  const getCurrentTodos = () => {
    return activeTab === 0 ? ownedTodos : assignedTodos;
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    setSelectedIds(new Set());
  };

  const toggleSelect = (todoId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(todoId)) {
      newSelected.delete(todoId);
    } else {
      newSelected.add(todoId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    const todos = getCurrentTodos();
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map((t) => t.todo_id)));
    }
  };

  const handleBatchDelete = async () => {
    try {
      await axiosInstance.post("/todo/batch/delete", {
        todo_ids: Array.from(selectedIds),
      });
      toast({
        title: "Success",
        description: `Deleted ${selectedIds.size} todos`,
        status: "success",
        isClosable: true,
      });
      setSelectedIds(new Set());
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete todos",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleBatchMarkComplete = async (status) => {
    try {
      await axiosInstance.post("/todo/batch/update-status", {
        todo_ids: Array.from(selectedIds),
        status,
      });
      toast({
        title: "Success",
        description: `Updated ${selectedIds.size} todos`,
        status: "success",
        isClosable: true,
      });
      setSelectedIds(new Set());
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update todos",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleBatchUpdatePriority = async (priority) => {
    try {
      await axiosInstance.post("/todo/batch/update-priority", {
        todo_ids: Array.from(selectedIds),
        priority,
      });
      toast({
        title: "Success",
        description: `Updated ${selectedIds.size} todos`,
        status: "success",
        isClosable: true,
      });
      setSelectedIds(new Set());
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update todos",
        status: "error",
        isClosable: true,
      });
    }
  };

  const hasSelected = selectedIds.size > 0;

  return (
    <Container mt={9} maxW="container.lg">
      <AddUpdateTodoModal onSuccess={fetchAllData} users={users} />
      
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
          <Tabs
            variant="enclosed"
            colorScheme="green"
            index={activeTab}
            onChange={handleTabChange}
          >
            <TabList mb={4}>
              <Tab fontWeight="medium">我创建的</Tab>
              <Tab fontWeight="medium">分配给我的</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                {ownedTodos.length === 0 ? (
                  <Center py={8}>
                    <Text color="gray.500">暂无任务</Text>
                  </Center>
                ) : (
                  <Box>
                    {hasSelected && (
                      <Flex
                        position="sticky"
                        top={0}
                        zIndex={10}
                        bg={barBg}
                        shadow="md"
                        p={3}
                        mb={4}
                        rounded="md"
                        justify="space-between"
                        align="center"
                      >
                        <Text fontWeight="medium">
                          已选择 {selectedIds.size} 项
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleBatchMarkComplete(true)}
                          >
                            标记完成
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="yellow"
                            onClick={() => handleBatchMarkComplete(false)}
                          >
                            标记未完成
                          </Button>
                          <Menu>
                            <MenuButton
                              as={Button}
                              size="sm"
                              colorScheme="blue"
                            >
                              修改优先级
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                onClick={() =>
                                  handleBatchUpdatePriority("urgent")
                                }
                              >
                                Urgent
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  handleBatchUpdatePriority("high")
                                }
                              >
                                High
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  handleBatchUpdatePriority("normal")
                                }
                              >
                                Normal
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  handleBatchUpdatePriority("low")
                                }
                              >
                                Low
                              </MenuItem>
                            </MenuList>
                          </Menu>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={handleBatchDelete}
                          >
                            删除
                          </Button>
                        </HStack>
                      </Flex>
                    )}

                    <Box mb={3}>
                      <Checkbox
                        isChecked={
                          selectedIds.size === ownedTodos.length &&
                          ownedTodos.length > 0
                        }
                        onChange={toggleSelectAll}
                        colorScheme="green"
                      >
                        全选
                      </Checkbox>
                    </Box>

                    {ownedTodos.map((todo) => (
                      <TodoCard
                        todo={todo}
                        key={todo.todo_id}
                        isSelected={selectedIds.has(todo.todo_id)}
                        onToggleSelect={() => toggleSelect(todo.todo_id)}
                        getUserName={getUserName}
                      />
                    ))}
                  </Box>
                )}
              </TabPanel>

              <TabPanel p={0}>
                {assignedTodos.length === 0 ? (
                  <Center py={8}>
                    <Text color="gray.500">暂无分配给我的任务</Text>
                  </Center>
                ) : (
                  <Box>
                    {hasSelected && (
                      <Flex
                        position="sticky"
                        top={0}
                        zIndex={10}
                        bg={barBg}
                        shadow="md"
                        p={3}
                        mb={4}
                        rounded="md"
                        justify="space-between"
                        align="center"
                      >
                        <Text fontWeight="medium">
                          已选择 {selectedIds.size} 项
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleBatchMarkComplete(true)}
                          >
                            标记完成
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="yellow"
                            onClick={() => handleBatchMarkComplete(false)}
                          >
                            标记未完成
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={handleBatchDelete}
                          >
                            删除
                          </Button>
                        </HStack>
                      </Flex>
                    )}

                    <Box mb={3}>
                      <Checkbox
                        isChecked={
                          selectedIds.size === assignedTodos.length &&
                          assignedTodos.length > 0
                        }
                        onChange={toggleSelectAll}
                        colorScheme="green"
                      >
                        全选
                      </Checkbox>
                    </Box>

                    {assignedTodos.map((todo) => (
                      <TodoCard
                        todo={todo}
                        key={todo.todo_id}
                        isSelected={selectedIds.has(todo.todo_id)}
                        onToggleSelect={() => toggleSelect(todo.todo_id)}
                        getUserName={getUserName}
                      />
                    ))}
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
};
