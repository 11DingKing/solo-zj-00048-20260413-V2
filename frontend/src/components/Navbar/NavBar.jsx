import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
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

  const navBg = useColorModeValue("green.300", "green.600");
  const tabListBg = useColorModeValue("gray.100", "gray.700");

  const isDashboard = location.pathname === "/dashboard";
  const isShared = location.pathname === "/shared" || location.pathname.startsWith("/shared/");
  const isTodoList = location.pathname === "/" || (location.pathname.startsWith("/") && !isDashboard && !isShared && !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register"));

  const getActiveTab = () => {
    if (isShared) return 1;
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
        bg={navBg}
        color="white"
      >
        <HStack spacing={6}>
          <Text as="h2" fontSize={24} fontWeight="bold" cursor="pointer" onClick={() => navigate("/")}>
            FODOIST
          </Text>
          
          <ButtonGroup spacing={2}>
            <Button
              onClick={() => navigate("/dashboard")}
              colorScheme={isDashboard ? "white" : "green"}
              variant={isDashboard ? "solid" : "ghost"}
              bg={isDashboard ? "white" : undefined}
              color={isDashboard ? "green.600" : undefined}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => navigate("/")}
              colorScheme={isTodoList ? "white" : "green"}
              variant={isTodoList ? "solid" : "ghost"}
              bg={isTodoList ? "white" : undefined}
              color={isTodoList ? "green.600" : undefined}
            >
              My Todos
            </Button>
            <Button
              onClick={() => navigate("/shared")}
              colorScheme={isShared ? "white" : "green"}
              variant={isShared ? "solid" : "ghost"}
              bg={isShared ? "white" : undefined}
              color={isShared ? "green.600" : undefined}
            >
              Shared
            </Button>
          </ButtonGroup>
        </HStack>
        
        <Stack direction="row" align="center" spacing={4}>
          <ThemeToggler size="lg" />
          <Button onClick={logout} colorScheme="green">
            Logout
          </Button>
        </Stack>
      </Flex>
      
      {isTodoList && (
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
          <TabList bg={tabListBg} px={4}>
            <Tab fontWeight="medium">My Todos</Tab>
            <Tab fontWeight="medium">Shared with Me</Tab>
          </TabList>
        </Tabs>
      )}
      
      <Outlet />
    </Box>
  );
};
