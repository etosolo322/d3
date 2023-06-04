import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import moment from "moment";

const VerticalTimeline = ({ minDate, maxDate }) => {
  const dateCount = moment(maxDate).diff(moment(minDate), "days") + 1;
  const svgRef = useRef(null);

  useEffect(() => {
    const dateArray = [];

    const currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      dateArray.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log(dateArray)
    // Определение размеров графика
    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Создание шкалы времени для оси Y - первый диапазон
    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    for (let i = 0; i < dateArray.length; i++) {
      const yScale1 = d3
        .scaleTime()
        .domain([
          parseTime(`${dateArray[i]}T06:00:00`),
          parseTime(`${dateArray[i]}T18:00:00`),
        ])
        .range([0, height / dateArray.length]);

      // Создание оси Y для первого диапазона
      const yAxis1 = d3
        .axisRight(yScale1)
        .ticks(d3.timeHour.every(2))
        .tickFormat(d3.timeFormat("%d.%m, %H:%M"));

      // Добавление первой оси к графику
      svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(0, ${i * (height / dateArray.length + 15)})`)
        .call(yAxis1);
    }
    // Добавление меток дней
    svg
      .selectAll(".day-label")
      .enter()
      .append("text")
      .attr("class", "day-label")
      .attr("x", -10)
      .attr("y", 0)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .text((d) => d.label);
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default VerticalTimeline;
