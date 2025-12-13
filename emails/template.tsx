import {
  Button,
  Head,
  Html,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data1 = {
    budgetAmount: 0,
    totalExpenses: 0,
    percentageUsed: 0,
    accountName: "",
  },
  data2 = {
    stats: {
      totalExpenses: 0,
      totalIncome: 0,
      transactionCount: 0,
      byCategory: {},
    },
    month: "",
    insights: [] as string[],
  },
}) {
  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>
              📊 Monthly Financial Report 📊
            </Heading>

            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here is your financial summary for {data2?.month}:
            </Text>

            {/* Summary Section */}
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Income</Text>
                <Text style={styles.heading}>£{data2?.stats.totalIncome}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Expenses</Text>
                <Text style={styles.heading}>
                  £{data2?.stats.totalExpenses}
                </Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Net</Text>
                <Text style={styles.heading}>
                  £{data2?.stats.totalIncome - data2?.stats.totalExpenses}
                </Text>
              </div>
            </Section>

            {/* Category Section */}
            {data2?.stats.byCategory && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(data2.stats.byCategory).map(
                  ([category, amount]) => (
                    <div key={category} style={styles.row}>
                      <Text style={styles.text}>{category}</Text>
                      <Text style={styles.text}>£{String(amount)}</Text>
                    </div>
                  )
                )}
              </Section>
            )}

            {/* Insights Section */}
            {data2?.insights && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Financial Insights</Heading>
                {data2.insights.map((insight, index) => (
                  <Text key={index} style={styles.text}>
                    • {insight}
                  </Text>
                ))}
              </Section>
            )}

            <Text style={styles.footer}>
              Thank you for using our service! Keep managing your finances
              wisely for a better future.
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>⚠️ Budget Alert ⚠️</Heading>
            <Hr style={styles.hr} />
            <Text style={styles.text}>Dear {userName},</Text>
            <Text style={styles.text}>
              You&rsquo;ve used {data1?.percentageUsed.toFixed(2)}% of your
              budget.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Budget Amount</Text>
                <Text style={styles.heading}>£{data1?.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Spent So Far</Text>
                <Text style={styles.heading}>£{data1?.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Remaining Budget</Text>
                <Text style={styles.heading}>
                  £{data1?.budgetAmount - data1?.totalExpenses}
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  } as React.CSSProperties,
  container: {
    backgroundColor: "black",
    borderRadius: "5px",
    margin: "0 auto",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  title: {
    color: "white",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  } as React.CSSProperties,
  heading: {
    color: "white",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 20px",
    textAlign: "center",
  } as React.CSSProperties,
  text: {
    color: "white",
    textAlign: "center",
    fontSize: "16px",
    margin: "20px 0 10px",
    textTransform: "capitalize",
  } as React.CSSProperties,
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "5px",
  } as React.CSSProperties,
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "5px",
  } as React.CSSProperties,
  stat: {
    marginBottom: "12px",
    padding: "12px",
    backgroundColor: "#2a2a2a",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  } as React.CSSProperties,
  hr: {
    border: "none",
    borderTop: "2px solid #444",
    margin: "20px 0",
  } as React.CSSProperties,
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #2a2a2a",
  } as React.CSSProperties,
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #2a2a2a",
  } as React.CSSProperties,
};
