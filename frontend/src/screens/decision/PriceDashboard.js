import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { theme } from "../../styles/theme";
import Tooltip from "../../components/Tooltip";
import { LinearGradient } from "expo-linear-gradient";

const PriceDashboard = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [priceData, setPriceData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: [t("loading")],
  });

  const [recentPrices, setRecentPrices] = useState([]);
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [thirtyDayAverage, setThirtyDayAverage] = useState(0);
  const [trend, setTrend] = useState("stable");
  const [confidence, setConfidence] = useState(0);
  const [volatility, setVolatility] = useState("");
  const [momentum, setMomentum] = useState({
    value: 0,
    label: "Neutral",
  });
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    fetchCropsAndRecent();
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      fetchPriceHistory(selectedCrop);
    }
  }, [selectedCrop]);

  const fetchCropsAndRecent = async () => {
    try {
      // Fetch distinct crop list directly for the dropdown
      const cropsRes = await api.get("/market/crops/unique");
      const uniqueCropNames = cropsRes.data.crops || [];

      // Structure it for the picker
      const uniqueCrops = uniqueCropNames.map((name, index) => ({
        id: `crop-${index}`,
        name: name,
      }));

      setCrops(uniqueCrops);

      if (uniqueCrops.length > 0 && !selectedCrop) {
        setSelectedCrop(uniqueCrops[0].name);
      } else if (!selectedCrop) {
        setSelectedCrop("Wheat"); // Fallback
      }

      // Fetch recent updates
      const recentRes = await api.get("/market/prices/recent");

      const uniqueUpdatesMap = new Map();
      (recentRes.data || []).forEach((item) => {
        if (!uniqueUpdatesMap.has(item.crop)) {
          uniqueUpdatesMap.set(item.crop, item);
        }
      });
      const uniqueUpdates = Array.from(uniqueUpdatesMap.values());

      setRecentPrices(uniqueUpdates);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  };

  const fetchPriceHistory = async (cropName) => {
    setLoading(true);
    try {
      const res = await api.get(`/market/prices/history?crop=${cropName}`);
      const responseData = res.data;

      // Check if backend returned early with "No price history available"
      if (
        responseData.message ||
        !responseData.datasets ||
        responseData.datasets.length === 0
      ) {
        setShowNoData(true);
        setPriceData(null);
        setRecommendation(null);
        setSuggestedPrice(null);
        setMomentum({
          value: 0,
          label: "Neutral",
        });
        return;
      }

      setShowNoData(false);

      let datasets = (responseData.datasets || []).map((ds) => ({
        data:
          Array.isArray(ds.data) && ds.data.length > 0
            ? ds.data
            : [0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 2,
      }));

      if (datasets.length === 0) {
        datasets = [
          {
            data: [0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            strokeWidth: 2,
          },
        ];
      }

      setPriceData({
        labels: responseData.labels || [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
        ],
        legend: [responseData.crop || cropName],
        datasets,
      });

      setRecommendation(responseData.recommendation || null);
      setSuggestedPrice(responseData.suggestedPrice || null);
      setCurrentPrice(responseData.current_price || 0);
      setThirtyDayAverage(responseData.thirty_day_average || 0);
      setTrend(responseData.trend || "stable");
      setConfidence(responseData.confidence || 0);
      setVolatility(responseData.volatility || "Stable Market ✅");
      setMomentum(
        responseData.momentum || {
          value: 0,
          label: "Neutral",
        },
      );
    } catch (err) {
      const message =
        (err && err.response && err.response.data && err.response.data.error) ||
        (err && err.message) ||
        "Failed to load price history. Please try again.";
      console.error("Failed to fetch prices", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCropsAndRecent();
    if (selectedCrop) {
      await fetchPriceHistory(selectedCrop);
    }
    setRefreshing(false);
  };

  const renderTrendInsight = () => {
    if (
      !priceData ||
      !priceData.datasets ||
      !priceData.datasets[0].data ||
      priceData.datasets[0].data.length < 2
    ) {
      return null;
    }

    const data = priceData.datasets[0].data;
    const lastPrice = data[data.length - 1];
    const prevPrice = data[data.length - 2];

    if (lastPrice === 0 || prevPrice === 0) return null; // data not ready

    const diff = lastPrice - prevPrice;
    const percent = ((diff / prevPrice) * 100).toFixed(1);

    const isUp = diff >= 0;

    return (
      <View style={styles.insightContainer}>
        <Ionicons
          name={isUp ? "trending-up" : "trending-down"}
          size={24}
          color={isUp ? theme.colors.success : theme.colors.error}
        />{" "}
        <Text style={styles.insightText}>
          {" "}
          {isUp ? t("upward_trend") : t("downward_trend")}{" "}
          {t("trend_in_last_month")}{" "}
        </Text>{" "}
        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: isUp
                ? theme.colors.success + "20"
                : theme.colors.error + "20",
            },
          ]}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: isUp ? theme.colors.success : theme.colors.error,
            }}
          >
            {" "}
            {isUp ? "+" : ""} {percent} %
          </Text>{" "}
        </View>{" "}
      </View>
    );
  };

  const renderSixMonthTrend = () => {
    if (
      !priceData ||
      !priceData.datasets ||
      !priceData.datasets[0].data ||
      priceData.datasets[0].data.length < 2
    ) {
      return null;
    }

    const data = priceData.datasets[0].data;
    const firstPrice = data[0];
    const lastPrice = data[data.length - 1];

    if (firstPrice === 0 || lastPrice === 0) return null;

    const diff = lastPrice - firstPrice;
    const percent = (diff / firstPrice) * 100;
    const percentStr = percent.toFixed(2);

    let trendText = t("stable_trend") + " " + t("trend_in_last_month");
    let trendColor = theme.colors.text.secondary;
    let iconName = "remove-circle-outline";

    if (percent > 2) {
      trendText = t("upward_trend") + " " + t("trend_in_last_month");
      trendColor = theme.colors.success;
      iconName = "trending-up";
    } else if (percent < -2) {
      trendText = t("downward_trend") + " " + t("trend_in_last_month");
      trendColor = theme.colors.error;
      iconName = "trending-down";
    }

    return (
      <View style={styles.insightCard}>
        <View
          style={[
            styles.insightIcon,
            {
              backgroundColor: trendColor + "20",
            },
          ]}
        >
          <Ionicons name={iconName} size={24} color={trendColor} />{" "}
        </View>{" "}
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={styles.insightTitleRow}>
            <Text style={styles.insightTitle}> {t("six_month_analysis")} </Text>{" "}
            <Tooltip
              text={
                t("six_month_tooltip") ||
                "This shows the overall price movement over 6 months."
              }
              iconSize={14}
            />{" "}
          </View>{" "}
          <Text style={styles.insightSubtitle}> {trendText} </Text>{" "}
        </View>{" "}
        <Text
          style={[
            styles.insightValue,
            {
              color: trendColor,
            },
          ]}
        >
          {" "}
          {diff > 0 ? "+" : ""} {percentStr} %
        </Text>{" "}
      </View>
    );
  };

  const renderMarketStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}> Current Price </Text>{" "}
          <Text style={styles.statValue}> ₹{currentPrice} </Text>{" "}
        </View>{" "}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}> 30 - Day Avg </Text>{" "}
          <Text style={styles.statValue}> ₹{thirtyDayAverage} </Text>{" "}
        </View>{" "}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}> Trend </Text>{" "}
          <Text
            style={[
              styles.statValue,
              {
                color:
                  trend === "increasing"
                    ? theme.colors.success
                    : trend === "decreasing"
                      ? theme.colors.error
                      : theme.colors.primary,
              },
            ]}
          >
            {" "}
            {trend.charAt(0).toUpperCase() + trend.slice(1)}{" "}
          </Text>{" "}
        </View>{" "}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}> Confidence </Text>{" "}
          <Text style={styles.statValue}> {confidence} % </Text>{" "}
        </View>{" "}
        <View
          style={[
            styles.statBox,
            {
              width: "65%",
            },
          ]}
        >
          <Text style={styles.statLabel}> Volatility </Text>{" "}
          <Text
            style={[
              styles.statValue,
              {
                color: volatility.includes("Risk")
                  ? theme.colors.error
                  : theme.colors.success,
              },
            ]}
          >
            {" "}
          </Text>{" "}
        </View>{" "}
        <View
          style={[
            styles.statBox,
            {
              width: "100%",
            },
          ]}
        >
          <Text style={styles.statLabel}> Momentum </Text>{" "}
          <Text
            style={[
              styles.statValue,
              {
                color: momentum.label.includes("Drop")
                  ? theme.colors.error
                  : momentum.label.includes("Upward")
                    ? theme.colors.success
                    : theme.colors.primary,
              },
            ]}
          >
            {" "}
            {momentum.label}({momentum.value > 0 ? "+" : ""} {momentum.value} %
            ){" "}
          </Text>{" "}
        </View>{" "}
      </View>
    );
  };

  const renderRecommendation = () => {
    if (!recommendation) return null;

    let icon = "alert-circle";
    let color = theme.colors.primary;
    let bgColor = theme.colors.p20;

    if (recommendation.includes("Sell Now")) {
      icon = "rocket";
      color = theme.colors.success;
      bgColor = theme.colors.success + "20";
    } else if (recommendation.includes("Wait")) {
      icon = "time";
      color = theme.colors.warning;
      bgColor = theme.colors.warning + "20";
    } else if (
      recommendation.includes("Urgent") ||
      recommendation.includes("Risk")
    ) {
      icon = "warning";
      color = theme.colors.error;
      bgColor = theme.colors.error + "20";
    }

    return (
      <View
        style={[
          styles.recommendationCard,
          {
            borderColor: color,
          },
        ]}
      >
        <View
          style={[
            styles.recIconContainer,
            {
              backgroundColor: bgColor,
            },
          ]}
        >
          <Ionicons name={icon} size={28} color={color} />{" "}
        </View>{" "}
        <View style={styles.recTextContainer}>
          <Text style={styles.recTitle}>
            {" "}
            {t("ai_recommendation") || "AI Smart Advice"}{" "}
          </Text>{" "}
          <Text
            style={[
              styles.recValue,
              {
                color: color,
              },
            ]}
          >
            {" "}
            {recommendation}{" "}
          </Text>{" "}
        </View>{" "}
      </View>
    );
  };

  const renderSuggestedPrice = () => {
    if (!suggestedPrice || suggestedPrice <= 0) return null;

    return (
      <View
        style={[
          styles.recommendationCard,
          {
            borderColor: theme.colors.secondary,
          },
        ]}
      >
        <View
          style={[
            styles.recIconContainer,
            {
              backgroundColor: theme.colors.secondary + "20",
            },
          ]}
        >
          <Ionicons
            name="pricetag"
            size={28}
            color={theme.colors.secondary}
          />{" "}
        </View>{" "}
        <View style={styles.recTextContainer}>
          <Text style={styles.recTitle}> AI Suggested Selling Price </Text>{" "}
          <Text
            style={[
              styles.recValue,
              {
                color: theme.colors.text.primary,
                fontSize: 24,
              },
            ]}
          >
            {" "}
            ₹ {suggestedPrice}{" "}
          </Text>{" "}
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              marginTop: 4,
            }}
          >
            Based on current market trend and volatility{" "}
          </Text>{" "}
        </View>{" "}
      </View>
    );
  };

  const handleChartPress = () => {
    if (tooltipPos.visible) {
      setTooltipPos((prev) => ({
        ...prev,
        visible: false,
      }));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>{" "}
          <Text style={styles.headerTitle}> {t("market_price_trends")} </Text>{" "}
          <View
            style={{
              width: 24,
            }}
          />{" "}
        </View>{" "}
      </LinearGradient>{" "}
      <ScrollView
        style={styles.content}
        onTouchStart={handleChartPress}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.pickerContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}> {t("select_crop")} </Text>{" "}
            <Tooltip
              text={
                t("select_crop_tooltip") ||
                "Choose a crop to view its price trends and market analysis over the past 6 months."
              }
              iconSize={16}
            />{" "}
          </View>{" "}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCrop}
              onValueChange={(itemValue) => setSelectedCrop(itemValue)}
              style={styles.picker}
              dropdownIconColor={theme.colors.primary}
            >
              {" "}
              {crops.map((crop) => (
                <Picker.Item
                  key={crop.id}
                  label={crop.name}
                  value={crop.name}
                />
              ))}{" "}
            </Picker>{" "}
          </View>{" "}
        </View>{" "}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {" "}
            {selectedCrop} {t("price_analysis")}{" "}
          </Text>{" "}
          <Text style={styles.chartSubtitle}> {t("last_6_months")} </Text>{" "}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : showNoData ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 220,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={theme.colors.text.secondary}
              />{" "}
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  color: theme.colors.text.secondary,
                }}
              >
                No price data available for this crop{" "}
              </Text>{" "}
            </View>
          ) : priceData ? (
            <LineChart
              data={priceData}
              width={Dimensions.get("window").width - 40}
              height={220}
              yAxisLabel="₹"
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.text.secondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: theme.colors.secondary,
                },
              }}
              bezier
              style={styles.chart}
              onDataPointClick={(data) => {
                const isSamePoint =
                  tooltipPos.x === data.x && tooltipPos.y === data.y;
                isSamePoint
                  ? setTooltipPos((prev) => ({
                      ...prev,
                      visible: !prev.visible,
                    }))
                  : setTooltipPos({
                      x: data.x,
                      y: data.y,
                      visible: true,
                      value: data.value,
                    });
              }}
              decorator={() => {
                return tooltipPos.visible ? (
                  <View>
                    <View
                      style={{
                        position: "absolute",
                        left: tooltipPos.x - 30,
                        top: tooltipPos.y - 45,
                        backgroundColor: theme.colors.primaryDark,
                        padding: 8,
                        borderRadius: 8,
                        zIndex: 100,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {" "}
                        ₹ {parseFloat(tooltipPos.value).toFixed(2)}{" "}
                      </Text>{" "}
                    </View>{" "}
                  </View>
                ) : null;
              }}
            />
          ) : null}{" "}
          {renderTrendInsight()}{" "}
        </View>{" "}
        {renderSixMonthTrend()} {renderMarketStats()} {renderRecommendation()}{" "}
        {renderSuggestedPrice()}{" "}
        <View style={styles.updatesSection}>
          <View style={styles.updatesTitleRow}>
            <Text style={styles.subHeader}> {t("recent_market_updates")} </Text>{" "}
            <Tooltip
              text={
                t("recent_updates_tooltip") ||
                "Latest price updates from major mandis across India. These prices are updated daily and help you understand current market rates for different crops. Use this information to set competitive prices for your produce."
              }
              iconSize={16}
            />{" "}
          </View>{" "}
          {recentPrices.map((item) => (
            <View key={item.id} style={styles.priceItem}>
              <View style={styles.priceIconPlaceholder}>
                <Text style={styles.priceIconText}>
                  {" "}
                  {item.crop.charAt(0)}{" "}
                </Text>{" "}
              </View>{" "}
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.cropName}> {item.crop} </Text>{" "}
                <Text style={styles.date}> {item.date} </Text>{" "}
              </View>{" "}
              <Text style={styles.price}>
                {" "}
                ₹ {parseFloat(item.price).toFixed(0)}
                /q{" "}
              </Text>{" "}
            </View>
          ))}{" "}
          {recentPrices.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {" "}
                {t("no_recent_updates")}{" "}
              </Text>{" "}
            </View>
          )}{" "}
        </View>{" "}
        <View
          style={{
            height: 40,
          }}
        />{" "}
      </ScrollView>{" "}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: theme.borderRadius.l,
    borderBottomRightRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pickerWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows.small,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.small,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  chartSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: 15,
  },
  loader: {
    marginVertical: 50,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  insightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
  },
  insightText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 8,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.m,
    marginBottom: 24,
    ...theme.shadows.small,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  insightTitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  insightTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  updatesSection: {
    marginBottom: 20,
  },
  updatesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  priceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.m,
    marginBottom: 10,
    ...theme.shadows.small,
  },
  priceIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.p20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  priceIconText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  cropName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: theme.colors.text.disabled,
  },
  errorBanner: {
    backgroundColor: theme.colors.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#fff",
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  recommendationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    ...theme.shadows.medium,
  },
  recIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  recTextContainer: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  recValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.borderRadius.m,
    marginBottom: 10,
    alignItems: "center",
    ...theme.shadows.small,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
  },
});

export default PriceDashboard;
