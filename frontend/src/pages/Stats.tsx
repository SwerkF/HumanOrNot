import { useEffect, useRef } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getGames } from "@/redux/slices/gameSlices";
import { RootState } from "@/redux/store";

import Loader from "@/components/Loader/Loader";

import { Game } from "@/models/Game";

import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";

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

export default function Stats() {
  const { games, error, status } = useAppSelector(
    (state: RootState) => state.game
  );
  const dispatch = useAppDispatch();

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  let barChartInstance = useRef<echarts.ECharts | null>(null);
  let pieChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    dispatch(getGames());
  }, []);

  useEffect(() => {
    if (!games || games.length === 0) return;

    if (!barChartRef.current || !pieChartRef.current) return;

    // Parties sur les 6 derniers mois
    const last6Months = [...Array(6)]
      .map((_, i) => dayjs().subtract(i, "month").format("YYYY-MM"))
      .reverse();

    // Regrouper les parties par mois
    const gamesPerMonth = last6Months.map((month) => ({
      month,
      count: games.filter(
        (game: Game) => dayjs(game.createdAt).format("YYYY-MM") === month
      ).length,
    }));

    // Supprimer les graphiques existants
    if (barChartInstance.current) {
      barChartInstance.current.dispose();
    }
    if (pieChartInstance.current) {
      pieChartInstance.current.dispose();
    }

    // Initialiser les graphiques
    barChartInstance.current = echarts.init(barChartRef.current);
    pieChartInstance.current = echarts.init(pieChartRef.current);

    // Configurer le BarChart
    barChartInstance.current.setOption({
      tooltip: {},
      xAxis: {
        type: "category",
        data: gamesPerMonth.map((g) => g.month),
        axisLabel: { color: "#fff" },
      },
      yAxis: { type: "value", axisLabel: { color: "#fff" } },
      series: [
        {
          name: "Parties",
          type: "bar",
          data: gamesPerMonth.map((g) => g.count),
          itemStyle: { color: colors.primary, opacity: 0.8 }, // Barres plus foncées
        },
      ],
    });

    // Compter les victoires et défaites
    const wins = games.filter((game: Game) => game.vote === 1).length;
    const losses = games.length - wins;

    // Configurer le PieChart
    pieChartInstance.current.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: "#fff" } },
      series: [
        {
          name: "Résultats",
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
        },
      ],
    });

    // Redimensionner les graphiques quand la fenêtre change de taille
    const handleResize = () => {
      barChartInstance.current?.resize();
      pieChartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      barChartInstance.current?.dispose();
      pieChartInstance.current?.dispose();
    };
  }, [games]);

  return (
    <main className="flex flex-col justify-center items-center gap-4 h-screen">
      <h1 className="text-6xl font-bold text-white">Stats</h1>
      <p className="text-white text-md">
        Voir les statistiques sur vos parties jouées.
      </p>
      <i className="text-white text-xs mb-5">
        Ne vous en faites pas, ça arrive de perdre.
      </i>
      {status === "loading" && <Loader />}
      {error && (
        <p className="text-white text-md mb-5">
          Erreur lors du chargement des stats...
        </p>
      )}

      {games && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="flex flex-col w-full items-start font-semibold">
            <p className="text-white text-lg text-center">
              Nombre de parties jouées par mois
            </p>
            <div ref={barChartRef} className="w-full h-80"></div>
          </div>
          <div className="flex flex-col w-full items-start font-semibold">
            <p className="text-white text-lg text-center">
              Répartition victoires / défaites
            </p>
            <div ref={pieChartRef} className="w-full h-80"></div>
          </div>
        </div>
      )}
    </main>
  );
}
