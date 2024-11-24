import React from "react";
import Card from "@/components/ui/Card";
import CoursesStatistical from "./course-statistical";
import SessionStatisticsChart from "./session-statistics-chart";
import TuitionStatisticsChart from"./tuition-statistics-chart";


const ChartJs = () => {
  return (
    <div className=" space-y-5">
      <Card title="Session Statistics Chart">
        <SessionStatisticsChart />
      </Card>
      <Card title="Courses Statistical">
        <CoursesStatistical />
      </Card>
      <Card title="Tuition Statistics Chart">
        <TuitionStatisticsChart />
      </Card>
    </div>
  );
};

export default ChartJs;
