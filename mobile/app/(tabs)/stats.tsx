import { useEffect, useRef } from "react";
import { View, Text, ScrollView, SafeAreaView, Dimensions } from "react-native";
import * as echarts from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getGames } from "@/redux/slices/gameSlices";
import { RootState } from "@/redux/store";
import { Game } from "@/models/Game";
import dayjs from "dayjs";

echarts.use([
  BarChart,
  PieChart,
  CanvasRenderer,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

const colors = {
  primary: "#75f120",
  secondary: "#fa43c2",
};

const chartHeight = 300;
const screenWidth = Dimensions.get("window").width;

export default function Stats() {
  const { games, error, status } = useAppSelector(
    (state: RootState) => state.game
  );
  const dispatch = useAppDispatch();

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    dispatch(getGames());
  }, []);

  // Data processing
  const last6Months = [...Array(6)]
    .map((_, i) => dayjs().subtract(i, "month").format("YYYY-MM"))
    .reverse();

  const gamesPerMonth = last6Months.map((month) => ({
    month,
    count:
      games?.filter(
        (game: Game) => dayjs(game.createdAt).format("YYYY-MM") === month
      ).length || 0,
  }));

  const wins = games?.filter((game: Game) => game.vote === 1).length || 0;
  const losses = (games?.length || 0) - wins;

  const barChartOption = {
    tooltip: {},
    xAxis: {
      type: "category",
      data: gamesPerMonth.map((g) => g.month),
      axisLabel: { color: "#fff" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#fff" },
    },
    series: [
      {
        data: gamesPerMonth.map((g) => g.count),
        type: "bar",
        itemStyle: { color: colors.primary },
      },
    ],
  };

  const pieChartOption = {
    tooltip: {},
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          {
            value: wins,
            name: "Victoires",
            itemStyle: { color: colors.primary },
          },
          {
            value: losses,
            name: "Défaites",
            itemStyle: { color: colors.secondary },
          },
        ],
        label: { color: "#fff" },
      },
    ],
  };

  useEffect(() => {
    if (barChartRef.current) {
      const barChart = echarts.init(barChartRef.current);
      barChart.setOption(barChartOption);
    }
    if (pieChartRef.current) {
      const pieChart = echarts.init(pieChartRef.current);
      pieChart.setOption(pieChartOption);
    }
  }, [games]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView className="mx-12 flex flex-col items-center justify-center gap-8">
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "#fff" }}>
            Stats
          </Text>
          <Text style={{ color: "#fff", marginTop: 8 }}>
            Voir les statistiques sur vos parties
          </Text>
        </View>

        <View className="flex flex-col md:flex-row gap-8">
          <View className="flex flex-col items-start">
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
              Parties par mois
            </Text>
            <View
              ref={barChartRef}
              style={{
                width: 400,
                height: chartHeight,
              }}
            />
          </View>

          <View className="flex flex-col items-start">
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
              Taux de victoire
            </Text>
            <View
              ref={pieChartRef}
              style={{
                width: 400,
                height: chartHeight,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
