import { Card, Col, Row, Statistic } from "antd";
import { useMemo } from "react";
import {
  getAverageInArray,
  getMedianInArray,
  pickUniqueByKey,
} from "../lib/helpers";

const Stats = ({ data, loading, isFiltered }) => {
  const stats = useMemo(() => {
    const locations = pickUniqueByKey(data, "location");
    const salaries = data.map((listing) => listing.salary.range[0]);

    return {
      totalListings: {
        title: "Total listings",
        value: data.length,
      },
      totalLocations: {
        title: "Total locations",
        value: locations.length,
      },
      highestSalary: {
        title: "Highest salary",
        suffix: "BGN",
        value: data.length && Math.max(...salaries),
      },
      averageSalary: {
        title: "Average salary",
        suffix: "BGN",
        value: getAverageInArray(salaries),
      },
      medianSalary: {
        title: "Median salary",
        suffix: "BGN",
        value: getMedianInArray(salaries),
      },
      lowestSalary: {
        title: "Lowest salary",
        suffix: "BGN",
        value: data.length && Math.min(...salaries),
      },
    };
  }, [loading, data]);

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 16 }}>
      {Object.keys(stats).map((key) => (
        <Col key={key} xs={{ span: 12 }} sm={{ span: 8 }} lg={{ span: 4 }}>
          <Card
            size="small"
            bodyStyle={{
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: isFiltered ? "#1890ff" : "transparent",
            }}
          >
            <Statistic
              title={stats[key].title}
              value={stats[key].value}
              suffix={stats[key].suffix || null}
              precision={0}
              loading={!Boolean(stats[key].value)}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Stats;
