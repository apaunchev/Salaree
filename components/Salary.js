import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { formatNumber } from "../lib/helpers";

const renderSalaryRange = (range, currency) =>
  range.length > 1
    ? `${range[0]}–${range[1]} ${currency}`
    : `${range[0]} ${currency}`;

const Salary = ({ range, rangeOriginal, currency, isGross }) => {
  range = range.map(formatNumber);
  rangeOriginal = rangeOriginal.map(formatNumber);

  return (
    <div style={{ whiteSpace: "nowrap" }}>
      {renderSalaryRange(range, currency)}{" "}
      {isGross && (
        <Tooltip title={`${renderSalaryRange(rangeOriginal, currency)} gross`}>
          <QuestionCircleOutlined />
        </Tooltip>
      )}
    </div>
  );
};

export default Salary;
