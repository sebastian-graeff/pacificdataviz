let allData;

d3.csv("https://raw.githubusercontent.com/sebastian-graeff/pacificdataviz.github.io/main/data/BubbleChartPlot.csv")
    .then(function(data) {
        allData = data;
        const initialYear = 2018;
        const initialData = filterDataByDate(allData, initialYear);
        drawBubbles(initialData);
    });

function updateDimensions() {
    return {
        svgWidth: window.innerWidth * 0.15,
        svgHeight: window.innerHeight * 0.15
    };
}

function filterDataByDate(data, year) {
    return data.filter(d => new Date(d.date).getFullYear() === year);
}

const countryPositions = {
    'Cook Islands': { row: 0, col: 0 },
    'Marshall Islands': { row: 0, col: 1 },
    'Tonga': { row: 0, col: 2 },
    'Vanuatu': { row: 0, col: 3 },
    'Kiribati': { row: 1, col: 0 },
    'New Caledonia': { row: 1, col: 1 },
    'Nauru': { row: 1, col: 2 },
    'Federated State of Micronesia': { row: 1, col: 3 },
    'Niue': { row: 2, col: 0 },
    'Papua New Guinea': { row: 2, col: 1 },
    'Samoa': { row: 2, col: 2 },
    'Fiji': { row: 2, col: 3 },
    'Solomon Islands': { row: 3, col: 0 },
    'French Polynesia': { row: 3, col: 1 },
    'Tuvalu': { row: 3, col: 2 },
    'Wallis and Futuna Islands': { row: 3, col: 3 }
};

function drawBubbles(data) {
    // Remove any previously drawn SVGs
    d3.select("#my_bubble_plot").selectAll("g").remove();

    // Get updated dimensions
    const { svgWidth, svgHeight } = updateDimensions();
    const margin = { top: 10, right: 10, bottom: 30, left: 10 };

    const colorScale = d3.scaleOrdinal()
        .range([
            "#6A4000", "#8A5500", "#B36E00", "#FF9D00",
            "#C07820", "#FFAF40", "#D88A30", "#FFC270",
            "#E49C60", "#FFD9A0", "#FFEAD0"
        ]);

    const nestedData = d3.group(data, d => d.name);
    const tooltip = d3.select("#tooltip2");

    for (const [countryName, position] of Object.entries(countryPositions)) {
        const countryData = nestedData.get(countryName) || [];

        const xPos = position.col * (svgWidth + 20);
        const yPos = position.row * (svgHeight + 20);

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

        if (countryData.length === 0) {
            svg.append("text")
                .attr("x", svgWidth / 2)
                .attr("y", svgHeight / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "gray")
                .text("No Data");
        } else {
            const totalValue = d3.sum(countryData, d => d.value);

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
        }
    }
}


const yearDisplay = document.getElementById('yearDisplay');
const dateSlider = document.getElementById('dateSlider');

dateSlider.addEventListener('input', function() {
    yearDisplay.textContent = this.value;

    // The rest of your slider event code
    const selectedYear = +this.value;
    const filteredData = filterDataByDate(allData, selectedYear);
    drawBubbles(filteredData);

});
