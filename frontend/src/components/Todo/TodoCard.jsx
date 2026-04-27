import {
  Badge,
  Box,
  Checkbox,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

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
  });
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  return now > due;
};

export const TodoCard = ({
  todo,
  isSelected = false,
  onToggleSelect,
  getUserName,
}) => {
  const navigate = useNavigate();
  
  const overdue = isOverdue(todo.due_date, todo.status);
  
  const baseBg = useColorModeValue("gray.300", "gray.600");
  const selectedBg = useColorModeValue("blue.100", "blue.800");
  const overdueBg = useColorModeValue("red.100", "red.900");
  
  let cardBg = baseBg;
  let borderColor = "transparent";
  
  if (overdue) {
    cardBg = overdueBg;
    borderColor = "red.500";
  } else if (isSelected) {
    cardBg = selectedBg;
    borderColor = "blue.500";
  }

  const handleClick = (e) => {
    if (e.target.closest("input[type='checkbox']")) {
      return;
    }
    navigate(`/${todo.todo_id}`, { replace: true });
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect && onToggleSelect();
  };

  return (
    <Flex
      bg={cardBg}
      minHeight="3rem"
      my={3}
      p={3}
      rounded="lg"
      alignItems="center"
      justifyContent="space-between"
      border="2px"
      borderColor={borderColor}
      _hover={{
        opacity: 0.9,
        cursor: "pointer",
        transform: "translateY(-3px)",
      }}
      onClick={handleClick}
    >
      <Flex alignItems="center" flex="1" minW={0}>
        {onToggleSelect && (
          <Box mr={3} onClick={handleCheckboxClick}>
            <Checkbox
              isChecked={isSelected}
              colorScheme="green"
              size="lg"
            />
          </Box>
        )}
        
        <Box flex="1" minW={0}>
          <HStack spacing={2} mb={1} flexWrap="wrap">
            <Text
              fontWeight="medium"
              isTruncated
              textDecoration={todo.status ? "line-through" : "none"}
              color={todo.status ? "gray.500" : "inherit"}
            >
              {todo.title}
            </Text>
          </HStack>
          
          <HStack spacing={2} flexWrap="wrap">
            <Badge
              colorScheme={todo.status ? "green" : "purple"}
              variant="solid"
            >
              {todo.status ? "已完成" : "待处理"}
            </Badge>
            
            <Badge
              colorScheme={PRIORITY_COLORS[todo.priority] || "gray"}
              variant="solid"
            >
              {PRIORITY_LABELS[todo.priority] || "Normal"}
            </Badge>
            
            {todo.due_date && (
              <Tooltip label={formatDate(todo.due_date)}>
                <Badge
                  colorScheme={overdue ? "red" : "gray"}
                  variant={overdue ? "solid" : "subtle"}
                >
                  {overdue ? "已过期: " : "到期: "}
                  {formatDate(todo.due_date)}
                </Badge>
              </Tooltip>
            )}
            
            {todo.assignee_id && getUserName && (
              <Badge colorScheme="teal" variant="subtle">
                分配给: {getUserName(todo.assignee_id)}
              </Badge>
            )}
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
};
