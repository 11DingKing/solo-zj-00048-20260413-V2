import {
  Box,
  Card,
  CardBody,
  Container,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Center,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axiosInstance from "../../services/axios";

const COLORS = ["#FF4444", "#FF8C00", "#3182CE", "#68D391"];

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    axiosInstance
      .get("/todo/stats")
      .then((res) => {
        setStats(res.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getBarChartData = () => {
    if (!stats?.daily_completed) return [];
    return stats.daily_completed.map((item) => ({
      date: item.date.slice(5),
      completed: item.count,
    }));
  };

  const getPieChartData = () => {
    if (!stats?.priority_distribution) return [];
    const { urgent, high, normal, low } = stats.priority_distribution;
    return [
      { name: "Urgent", value: urgent },
      { name: "High", value: high },
      { name: "Normal", value: normal },
      { name: "Low", value: low },
    ].filter((item) => item.value > 0);
  };

  if (loading) {
    return (
      <Container mt={9}>
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
    <Container maxW="container.xl" mt={9}>
      <Heading mb={6} size="lg" color={textColor}>
        Dashboard
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Total Tasks
              </StatLabel>
              <StatNumber fontSize="3xl" color={textColor}>
                {stats?.total_count || 0}
              </StatNumber>
              <StatHelpText></StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Completed
              </StatLabel>
              <StatNumber fontSize="3xl" color="green.500">
                {stats?.completed_count || 0}
              </StatNumber>
              <StatHelpText></StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Completion Rate
              </StatLabel>
              <StatNumber fontSize="3xl" color="blue.500">
                {stats?.completion_rate?.toFixed(1) || 0}%
              </StatNumber>
              <StatHelpText></StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                New This Week
              </StatLabel>
              <StatNumber fontSize="3xl" color="orange.500">
                {stats?.this_week_new || 0}
              </StatNumber>
              <StatHelpText></StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Card bg={cardBg} shadow="md" borderRadius="lg" p={6}>
            <Heading size="md" mb={4} color={textColor}>
              Tasks Completed (Last 7 Days)
            </Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3182CE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} shadow="md" borderRadius="lg" p={6}>
            <Heading size="md" mb={4} color={textColor}>
              Priority Distribution
            </Heading>
            <Box h="300px">
              {getPieChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPieChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPieChartData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Center h="100%">
                  <Text color="gray.500">No data available</Text>
                </Center>
              )}
            </Box>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};
