// Load the CSV data
d3.csv("https://raw.githubusercontent.com/sebastian-graeff/pacificdataviz.github.io/main/data/BubbleChartPlot.csv").then(init);

function init(data) {
  // Define the dimensions of the individual circle packing SVG
  const svgWidth = window.innerWidth * 0.15;  // 15% of viewport width
  const svgHeight = window.innerHeight * 0.15;  // 15% of viewport height
  

  // Define the margin for the individual circle packing SVG
  const margin = { top: 10, right: 10, bottom: 30, left: 10 };

  // Create a color scale for commodities
  const colorScale = d3.scaleOrdinal()
  .range([
    "#6A4000",                // Much darker tint
    "#8A5500",                // Darker tint
    "#B36E00",                // Original darkest color
    "#FF9D00",                // Original color
    "#C07820",                // Shade in-between
    "#FFAF40",                // Tint in-between
    "#D88A30",                // Another shade in-between
    "#FFC270",                // Another tint in-between
    "#E49C60",                // Yet another shade in-between
    "#FFD9A0",                // Original lightest tint
    "#FFEAD0"                 // Much lighter tint
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

    // Ensure no more than 16 SVGs are created
    if (counter >= 16) return;
    
    const rowIndex = Math.floor(counter / 4);
    const colIndex = counter % 4;

  
    // Calculate the x and y position for each group based on its index
    const xPos = colIndex * (svgWidth + 10); // Added a 10-pixel gap between SVGs
    const yPos = rowIndex * (svgHeight + 10);

    const totalValue = d3.sum(countryData, d => d.value);

  
    // Create a group for each country and translate it to its position
    const group = d3.select("#my_bubble_plot")
      .append("g")
      .attr("transform", `translate(${xPos}, ${yPos})`);
    
    // Then, create an individual SVG for this country within the group
    const svg = group
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)

    // Add a label under the SVG for the country name
    svg.append("text")
      .attr("x", svgWidth / 2)
      .attr("y", svgHeight - 5) // 5 pixels from the bottom of SVG
      .attr("text-anchor", "middle")
      .style("font-size", "16px")    // Increased font size
      .style("fill", "white")   
      .text(countryName);

    // Define the pack layout
    const pack = d3.pack()
      .size([svgWidth - margin.left - margin.right, svgHeight - margin.top - margin.bottom])
      .padding(1);

    // Create a hierarchy from the data of a specific country
    const root = d3.hierarchy({ children: countryData })
      .sum(d => d.value);

    // Compute the circle packing layout
    pack(root);

    // Create a selection for each circle
    const circles = svg.selectAll("circle")
    .data(root.descendants().slice(1))
    .enter()
    .append("circle")
    .attr("cx", d => d.x + margin.left)
    .attr("cy", d => d.y + margin.top)
    .attr("r", d => d.r)
    .attr("fill", d => colorScale(d.data.commodity))
    .on("mouseover", function(event, d) {
        const percentage = (d.value / totalValue) * 100; // calculate the percentage
        // Display tooltip on mouseover with formatted commodity name and its percentage
        tooltip.style("display", "inline");
        tooltip.html(`<b>Commodity:</b> ${d.data.commodity}<br><b>Proportion:</b> ${percentage.toFixed(2)}%`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
        
        // Highlight the circle by setting its stroke and stroke width
        d3.select(this)
          .style("stroke", "white")
          .style("stroke-width", "2px");
    })
    .on("mouseout", function(d) {
        tooltip.style("display", "none");
        // Remove the circle's highlight by resetting its stroke and stroke width
        d3.select(this)
          .style("stroke", "none")
          .style("stroke-width", "0px");
    })

    counter++;
  });
}
