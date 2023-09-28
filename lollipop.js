// Load the CSV data
d3.csv("https://raw.githubusercontent.com/sebastian-graeff/pacificdataviz.github.io/main/data/CountryYearly.csv").then(data => {

    const filtered2018 = data.filter(d => d.date === "2018-01-01");
    filtered2018.sort((a, b) => b.value - a.value);  // Sort the 2018 data

    const filtered1995Map = new Map(data.filter(d => d.date === "1995-01-01").map(d => [d.name, d.value]));

    const combinedData = filtered2018.map(d2018 => {
        return {
            name: d2018.name,
            value_1995: filtered1995Map.get(d2018.name) || 0,
            value_2018: d2018.value
        };
    });
    

    const margin = {top: 20, right: 120, bottom: 30, left: 200},
          width = 1100 - margin.left - margin.right,
          height = combinedData.length * 40;

    const svg = d3.select("#my-lollipop-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.value)])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(filtered2018.map(d => d.name))
        .range([0, height])
        .padding(0.1);

    const xGrid = d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat("")
        .ticks(10);

    const yGrid = d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
        .ticks(5);

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(xGrid);

    svg.append("g")
        .attr("class", "grid")
        .call(yGrid);

    // add arrows and percentage change
    const arrowUp = "M10,0 L20,10 L30,0 L20,0 Z";
    const arrowDown = "M10,10 L20,0 L30,10 L20,10 Z";


    combinedData.forEach(d => {

        svg.append("line")
            .attr("x1", xScale(d.value_1995))
            .attr("x2", xScale(d.value_2018))
            .attr("y1", yScale(d.name) + yScale.bandwidth() / 2)
            .attr("y2", yScale(d.name) + yScale.bandwidth() / 2)
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 5);

        svg.append("circle")
            .attr("cx", xScale(d.value_1995))
            .attr("cy", yScale(d.name) + yScale.bandwidth() / 2)
            .attr("r", 15)
            .attr("fill", "#B36E00")
            .on("mouseover", function(event) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(`Country: ${d.name} <br> Value (1995): ${d.value_1995}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("circle")
            .attr("cx", xScale(d.value_2018))
            .attr("cy", yScale(d.name) + yScale.bandwidth() / 2)
            .attr("r", 15)
            .attr("fill", "#FF9D00")
            .on("mouseover", function(event) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(`Country: ${d.name} <br> Value (2018): ${d.value_2018}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        const changePercentage = ((d.value_2018 - d.value_1995) / d.value_1995) * 100;
        const arrow = changePercentage > 0 ? arrowDown : arrowUp;
        const arrowColor = changePercentage > 0 ? "#FF9D00" : "#B36E00";  // Light brown for 2018 greater, Dark brown for 1995 greater
            
            // Append the arrow
            svg.append("path")
                .attr("d", arrow)
                .attr("fill", arrowColor)
                .attr("transform", `translate(${width + 20}, ${yScale(d.name) + yScale.bandwidth() / 2 -5})`);
        
            // Append the percentage change
            svg.append("text")
                .attr("x", width + 60)
                .attr("y", yScale(d.name) + yScale.bandwidth() / 2 + 5) // 5 to center-align the text vertically
                .text(`${changePercentage.toFixed(2)}%`)
                .style("font-size", "12px")
                .style("fill", "white");
    });

    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);
    const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(10)
        .tickSize(0);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .style("color", "white");

    svg.append("g")
        .call(yAxis)
        .style("color", "white")
        .selectAll("text")
        .style("font", "bold 12px Montserrat");

    const tooltip = d3.select("#tooltip");
});
