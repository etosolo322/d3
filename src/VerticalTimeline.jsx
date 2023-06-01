import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function getDuration(milli) {
  let minutes = Math.floor(milli / 60000);
  let hours = Math.round(minutes / 60);
  let days = Math.round(hours / 24);
  return days * 400;
}

const VerticalTimeline = ({ data, minDate, maxDate }) => {
  const timelineRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const margin = { top: 70, right: 0, bottom: 0, left: 0 };
    const height =
      timelineRef.current.clientHeight - margin.top - margin.bottom;
    const width = timelineRef.current.clientWidth;

    const svg = d3
      .select(timelineRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = (e, d) => {
      // console.log(new Date(e), d);
      return new Date(e);
    };

    const y = d3.scaleTime().domain([minDate, maxDate]).range([0, height]);
    const barWidth = 50;

    data.forEach((element, index) => {
      const bars = svg
        .selectAll(".timeline-bar" + index)
        .data(() => element.operations)
        .enter()
        .append("g")
        .attr("class", "timeline-bar" + index)
        .attr(
          "transform",
          (d, i) => `translate(0, ${y(parseDate(d.startTime))})`
        )
        .on("mouseover", function (event, d) {
          d3.select(this).select("rect").attr("opacity", 1);
          console.log(d);
        })
        .on("mouseout", function (event, d) {
          d3.select(this).select("rect").attr("opacity", 0.6);
        });

      bars
        .append("rect")
        .attr("x", index * 100)
        .attr("y",0)
        .attr("width", 100)
        .attr(
          "height",
          (d, i) => y(parseDate(d.endTime, d)) - y(parseDate(d.startTime, d))
        )
        .attr("fill", "#87BC45")
        .attr("opacity", "0.6");
    });

    // Добавление серых блоков для заполнения разницы
    data.map((element, index) => {
      const greyBars = svg
        .selectAll(".grey-bar" + index)
        .data(() => element.operations)
        .enter()
        .append("g")
        .attr("class", "grey-bar" + index);

      greyBars
        .append("rect")
        .attr("x", index * 100)
        .attr("y", 0)
        .attr("width", 80)
        .attr(
          "transform",
          (d, i) => `translate(0, ${i === 0 ? "0" : y(parseDate(d.endTime))})`
        )
        .attr("height", (d, i) => {
          if (i === 0) {
            return y(parseDate(d.startTime)) - y(minDate);
          }
          if (i < element.operations.length - 1) {
            console.log(element);
            const nextDate = parseDate(element.operations[i + 1].startTime);
            return y(nextDate) - y(parseDate(d.endTime)) > 0
              ? y(nextDate) - y(parseDate(d.endTime))
              : 1;
          }
          return y(maxDate) - y(parseDate(d.endTime));
        })
        .attr("fill", "#CCCCCC");
    });

    const timeFormat = d3.timeFormat("%d.%m, %H:%M");
    const yAxis = d3
      .axisRight(y)
      .ticks(d3.timeHour.every(2))
      .tickFormat(timeFormat);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr(
        "transform",
        `translate(${wrapperRef.current.clientWidth - 100}, 0)`
      )
      .call(yAxis);

    return () => {
      d3.select(timelineRef.current).selectAll("*").remove();
    };
  }, [data, minDate, maxDate]);

  return (
    <div className="wrapper" ref={wrapperRef}>
      <div
        ref={timelineRef}
        style={{
          width: `${data.length * 100}px`,
          height: `${getDuration(maxDate - minDate)}px`,
        }}
      />
        {data.map((element, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: "10px",
            left: `${100 * index}px`,
          }}
        >
          <span className="title_text">{element.operationName}</span>
        </div>
      ))}
    </div>
  );
};

export default VerticalTimeline;
