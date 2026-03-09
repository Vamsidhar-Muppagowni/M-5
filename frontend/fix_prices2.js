const fs = require('fs');
const file = 'c:\\\\Users\\\\SIDDHARTHA\\\\Desktop\\\\sprint2\\\\Final_Sprint2\\\\M-5\\\\frontend\\\\src\\\\screens\\\\decision\\\\PriceDashboard.js';
let content = fs.readFileSync(file, 'utf8');

// Inject import
if (!content.includes('import MetricCard')) {
    // Try to find import api
    if (content.includes('import api ')) {
        content = content.replace('import api ', "import MetricCard from '../../components/MetricCard';\nimport api ");
    }
}

// Replace renderMarketStats
const startReg = /const renderMarketStats = \(\) => \{[\s\S]*?const renderRecommendation = \(\) => \{/;
const replacement = `const renderMarketStats = () => {
    return (
      <View style={styles.statsGrid}>
        <MetricCard 
          label="Current Price" 
          value={\`₹\${currentPrice}\`} 
          containerStyle={styles.halfCard} 
        />
        <MetricCard 
          label="30-Day Avg" 
          value={\`₹\${thirtyDayAverage}\`} 
          containerStyle={styles.halfCard} 
        />
        <MetricCard 
          label="Trend" 
          value={trend.charAt(0).toUpperCase() + trend.slice(1)} 
          valueColor={
            trend === "increasing"
              ? theme.colors.success
              : trend === "decreasing"
              ? theme.colors.error
              : theme.colors.primary
          }
          containerStyle={styles.halfCard} 
        />
        <MetricCard 
          label="Confidence" 
          value={\`\${confidence}%\`} 
          containerStyle={styles.halfCard} 
        />
        <MetricCard 
          label="Volatility" 
          value={volatility} 
          valueColor={
            volatility.includes("High") || volatility.includes("No")
              ? theme.colors.error
              : volatility.includes("Moderate")
              ? theme.colors.warning
              : theme.colors.success
          }
          containerStyle={styles.fullCard} 
        />
        <MetricCard 
          label="Momentum" 
          value={\`\${momentum.label} (\${momentum.value > 0 ? "+" : ""} \${momentum.value}%)\`} 
          valueColor={
            momentum.label.includes("Drop")
              ? theme.colors.error
              : momentum.label.includes("Upward")
              ? theme.colors.success
              : theme.colors.primary
          }
          containerStyle={styles.fullCard} 
        />
      </View>
    );
  };

  const renderRecommendation = () => {`;

content = content.replace(startReg, replacement);

// And replace with a conditional wrapper. Need to escape literal parenthesis.
content = content.replace(
    /\) : null\}\{renderTrendInsight\(\)\}<\/View>\{renderSixMonthTrend\(\)\}\{renderMarketStats\(\)\}\{renderRecommendation\(\)\}\{renderSuggestedPrice\(\)\}/g,
    `) : null}
            {!showNoData && renderTrendInsight()}
          </View>
          
          {!showNoData && (
            <>
              {renderSixMonthTrend()}
              {renderMarketStats()}
              {renderRecommendation()}
              {renderSuggestedPrice()}
            </>
          )}`
);

// We also need to add Grid styles.
const stylesAdd = `
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  halfCard: {
    width: "48%",
    marginBottom: 16,
  },
  fullCard: {
    width: "100%",
    marginBottom: 16,
  },
  statsContainer: {`;

if (!content.includes('statsGrid: {')) {
    // insert before 'statsContainer: {'
    content = content.replace('statsContainer: {', stylesAdd);
}

fs.writeFileSync(file, content);
console.log('Fixed PriceDashboard.js');