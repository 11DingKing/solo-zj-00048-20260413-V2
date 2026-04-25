import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ThemeToggler } from "../Theme/ThemeToggler";

export const NavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === "/shared" || location.pathname.startsWith("/shared/")) {
      return 1;
    }
    return 0;
  };

  return (
    <Box minHeight="100vh">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1rem"
        bg={useColorModeValue("green.300", "green.600")}
        color="white"
      >
        <Text as="h2" fontSize={24} fontWeight="bold">
          FODOIST
        </Text>
        <Stack direction="row" align="center" spacing={4}>
          <ThemeToggler size="lg" />
          <Button onClick={logout} colorScheme="green">
            Logout
          </Button>
        </Stack>
      </Flex>
      
      <Tabs 
        variant="enclosed" 
        colorScheme="green" 
        defaultIndex={getActiveTab()}
        index={getActiveTab()}
        onChange={(index) => {
          if (index === 0) {
            navigate("/");
          } else {
            navigate("/shared");
          }
        }}
      >
        <TabList bg={useColorModeValue("gray.100", "gray.700")} px={4}>
          <Tab fontWeight="medium">My Todos</Tab>
          <Tab fontWeight="medium">Shared with Me</Tab>
        </TabList>
      </Tabs>
      
      <Outlet />
    </Box>
  );
};
