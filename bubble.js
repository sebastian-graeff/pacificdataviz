// Load the CSV data
d3.csv("https://raw.githubusercontent.com/sebastian-graeff/pacificdataviz.github.io/main/data/BubbleChartPlot.csv").then(init);

function updateDimensions() {
    return {
        svgWidth: window.innerWidth * 0.15,
        svgHeight: window.innerHeight * 0.15
    };
}

function init(data) {
    // Define the dimensions of the individual circle packing SVG
    const svgWidth = window.innerWidth * 0.15;  // 15% of viewport width
    const svgHeight = window.innerHeight * 0.15;  // 15% of viewport height

    // Define the margin for the individual circle packing SVG
    const margin = { top: 10, right: 10, bottom: 30, left: 10 };

    // Create a color scale for commodities
    const colorScale = d3.scaleOrdinal()
    .range([
        "#6A4000", "#8A5500", "#B36E00", "#FF9D00",
        "#C07820", "#FFAF40", "#D88A30", "#FFC270",
        "#E49C60", "#FFD9A0", "#FFEAD0"
    ]);

    // Convert the value column to numeric
    data.forEach(function(d) {
        d.value = +d.value;
    });

    // Nest the data by country name
    const nestedData = d3.group(data, d => d.name);

    let counter = 0;
    const tooltip = d3.select("#tooltip2");

    nestedData.forEach(function(countryData, countryName) {
        if (counter >= 16) return;
        
        const rowIndex = Math.floor(counter / 4);
        const colIndex = counter % 4;

        const xPos = colIndex * (svgWidth + 20);  // Adjusted gap between SVGs
        const yPos = rowIndex * (svgHeight + 20);  // Adjusted gap between SVGs

        const totalValue = d3.sum(countryData, d => d.value);

        const group = d3.select("#my_bubble_plot")
            .append("g")
            .attr("transform", `translate(${xPos}, ${yPos})`);

        const svg = group
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)

        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "white")   
            .text(countryName);

        const pack = d3.pack()
            .size([svgWidth - margin.left - margin.right, svgHeight - margin.top - margin.bottom])
            .padding(1);

        const root = d3.hierarchy({ children: countryData })
            .sum(d => d.value);

        pack(root);

        svg.selectAll("circle")
            .data(root.descendants().slice(1))
            .enter()
            .append("circle")
            .attr("cx", d => d.x + margin.left)
            .attr("cy", d => d.y + margin.top)
            .attr("r", d => d.r)
            .attr("fill", d => colorScale(d.data.commodity))
            .on("mouseover", function(event, d) {
                const percentage = (d.value / totalValue) * 100;
                tooltip.style("display", "inline");
                tooltip.html(`<b>Commodity:</b> ${d.data.commodity}<br><b>Proportion:</b> ${percentage.toFixed(2)}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
                
                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", "2px");
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none");
                d3.select(this)
                    .style("stroke", "none")
                    .style("stroke-width", "0px");
            })

        counter++;
    });

    while (counter < 16) {
        const rowIndex = Math.floor(counter / 4);
        const colIndex = counter % 4;

        const xPos = colIndex * (svgWidth + 10);
        const yPos = rowIndex * (svgHeight + 10);

        const group = d3.select("#my_bubble_plot")
            .append("g")
            .attr("transform", `translate(${xPos}, ${yPos})`);

        const svg = group
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "gray")
            .text("No Data");

        counter++;
    }
}

function drawBubbles(data) {
    // Remove any previously drawn SVGs
    d3.select("#my_bubble_plot").selectAll("g").remove();

    // Get updated dimensions
    const { svgWidth, svgHeight } = updateDimensions();

    // Define the margin for the individual circle packing SVG
    const margin = { top: 10, right: 10, bottom: 30, left: 10 };

    const colorScale = d3.scaleOrdinal()
        .range([
            "#6A4000", "#8A5500", "#B36E00", "#FF9D00",
            "#C07820", "#FFAF40", "#D88A30", "#FFC270",
            "#E49C60", "#FFD9A0", "#FFEAD0"
        ]);

    const nestedData = d3.group(data, d => d.name);

    let counter = 0;
    const tooltip = d3.select("#tooltip2");

    nestedData.forEach(function(countryData, countryName) {
        if (counter >= 16) return;

        const rowIndex = Math.floor(counter / 4);
        const colIndex = counter % 4;

        const xPos = colIndex * (svgWidth + 20);  // Adjusted gap between SVGs
        const yPos = rowIndex * (svgHeight + 20);  // Adjusted gap between SVGs

        const totalValue = d3.sum(countryData, d => d.value);

        const group = d3.select("#my_bubble_plot")
            .append("g")
            .attr("transform", `translate(${xPos}, ${yPos})`);

        const svg = group
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "white")
            .text(countryName);

        const pack = d3.pack()
            .size([svgWidth - margin.left - margin.right, svgHeight - margin.top - margin.bottom])
            .padding(1);

        const root = d3.hierarchy({ children: countryData })
            .sum(d => d.value);

        pack(root);

        svg.selectAll("circle")
            .data(root.descendants().slice(1))
            .enter()
            .append("circle")
            .attr("cx", d => d.x + margin.left)
            .attr("cy", d => d.y + margin.top)
            .attr("r", d => d.r)
            .attr("fill", d => colorScale(d.data.commodity))
            .on("mouseover", function(event, d) {
                const percentage = (d.value / totalValue) * 100;
                tooltip.style("display", "inline");
                tooltip.html(`<b>Commodity:</b> ${d.data.commodity}<br><b>Proportion:</b> ${percentage.toFixed(2)}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");

                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", "2px");
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none");
                d3.select(this)
                    .style("stroke", "none")
                    .style("stroke-width", "0px");
            });

        counter++;
    });

    while (counter < 16) {
        const rowIndex = Math.floor(counter / 4);
        const colIndex = counter % 4;

        const xPos = colIndex * (svgWidth + 10);
        const yPos = rowIndex * (svgHeight + 10);

        const group = d3.select("#my_bubble_plot")
            .append("g")
            .attr("transform", `translate(${xPos}, ${yPos})`);

        const svg = group
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "gray")
            .text("No Data");

        counter++;
    }
}

window.addEventListener("resize", function() {
    d3.csv("https://raw.githubusercontent.com/sebastian-graeff/pacificdataviz.github.io/main/data/BubbleChartPlot.csv").then(drawBubbles);
});
