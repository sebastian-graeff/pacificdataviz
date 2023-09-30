// set the dimensions and margins of the graph
const newDiv = d3.select("#my_dataviz");
const newWidth = newDiv.node().getBoundingClientRect().width;
const newHeight = newDiv.node().getBoundingClientRect().height;

// Define color scale for commodities
const newColorScale = d3.scaleOrdinal()
  .domain([
    'Fish, crustaceans, molluscs, aquatic invertebrates ne',
    'Coffee, tea, mate and spices',
    'Tobacco and manufactured tobacco substitutes',
    'Cereal, flour, starch, milk preparations and products',
    'Milling products, malt, starches, inulin, wheat glute',
    'Vegetable, fruit, nut, etc food preparations',
    'Animal,vegetable fats and oils, cleavage products, et',
    'Edible vegetables and certain roots and tubers',
    'Dairy products, eggs, honey, edible animal product nes',
    'Cereals', 'Sugars and sugar confectionery',
    'Beverages, spirits and vinegar', 'Cocoa and cocoa preparations',
    'Edible fruit, nuts, peel of citrus fruit, melons',
    'Oil seed, oleagic fruits, grain, seed, fruit, etc, ne',
    'Meat, fish and seafood food preparations nes',
    'Miscellaneous edible preparations', 'Meat and edible meat offal'
  ])
  .range([
    "#6A4000", "#8A5500", "#B36E00", "#FF9D00",
    "#C07820", "#FFAF40", "#D88A30", "#FFC270",
    "#E49C60", "#FFD9A0", "#FFEAD0", "#6A4001",
    "#8A5501", "#B36E01", "#FF9D01", "#C07821",
    "#FFAF41", "#D88A31"
  ]);

// Define the hint text
const newHintText = "Hint: You can click on, and move bubbles to create a clearer overview.";

// append the newSvg object to the body of the page
const newSvg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", newWidth)
  .attr("height", newHeight);

const newSelectedYearText = newSvg.append("text")
  .attr("class", "selected-year")
  .attr("x", newWidth / 2)
  .attr("y", newHeight / 2)
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .style("font-size", "50px")
  .style("fill", "white")
  .text("1995");

// Add the hint text to the bottom right region
const newHint = newSvg.append("text")
  .attr("class", "hint-text")
  .attr("x", newWidth - 100) // Adjust the x-coordinate for proper alignment
  .attr("y", newHeight - 100) // Adjust the y-coordinate for proper alignment
  .attr("text-anchor", "end") // Align the text to the end (right)
  .attr("alignment-baseline", "baseline") // Align the text to the baseline
  .style("font-size", "14px")
  .style("fill", "white")
  .text(newHintText);

d3.csv("https://raw.githubusercontent.com/sebastian-graeff/pacificdataviz.github.io/main/data/FinalPlot.csv")
  .then(function(data) {

    // Convert date strings to date objects and numbers to actual numbers
    data.forEach(d => {
      d.date = new Date(d.date);
      d.value = +d.value;
      d.color = newColorScale(d.commodity); // Add a color attribute
    });

    const data2018 = data.filter(d => d.date.getFullYear() === 1995);

    const tooltip = d3.select("#tooltip3");

    // Create scales for circle sizes and colors:
    const valueScale = d3.scaleSqrt()
      .domain([0, d3.max(data2018, d => d.value)])
      .range([5, 80]);

    // Draw the circles:
    const node = newSvg.append("g")
      .selectAll("circle")
      .data(data2018)
      .join("circle")
      .attr("r", d => valueScale(d.value))
      .attr("cx", newWidth / 2)
      .attr("cy", newHeight / 2)
      .style("fill", d => d.color) // Use the color attribute for filling
      .style("fill-opacity", 0.9)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
        .on("mouseover", function(event, d) {
          tooltip.style("display", "inline");
          tooltip.html(`<b>Commodity:</b> ${d.commodity}<br><b>Country:</b> ${d.name}<br><b>Value:</b> ${d.value} tons`)
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
      .on("click", function(event, d) {
        // Remove the tooltip on click
        tooltip.style("display", "none");
      });

    const angleIncrement = 2 * Math.PI / data.length;

    data.forEach((d, i) => {
      const angle = i * angleIncrement;
      const radialDistance = Math.min(newWidth, newHeight) / 3;  // Radius of the donut
      d.x = d.initialX = newWidth / 2 + radialDistance * Math.cos(angle);  // Store initial position in initialX
      d.y = d.initialY = newHeight / 2 + radialDistance * Math.sin(angle);  // Store initial position in initialY
    });

    // Eliminate other forces; only use the gentleDonutForce and collision
    const simulation = d3.forceSimulation(data)
      .force("center", d3.forceCenter(newWidth / 2, newHeight / 2))
      .force("collide", d3.forceCollide().strength(1).radius(d => valueScale(d.value) + 5).iterations(1))
      .force("radial", radialForce)
      .alpha(1)
      .alphaDecay(0.02);

    function radialForce(d) {
      const cx = newWidth / 2;
      const cy = newHeight / 2;

      const dx = d.x - cx;
      const dy = d.y - cy;
      const angle = Math.atan2(dy, dx);

      const radialDistance = Math.min(newWidth, newHeight) / 3;
      const targetX = cx + radialDistance * Math.cos(angle);
      const targetY = cy + radialDistance * Math.sin(angle);

      const ax = targetX - d.x;
      const ay = targetY - d.y;

      d.vx += ax * 0.1;
      d.vy += ay * 0.1;
    }

    // Define a gravitational force
    function gravitationalForce(strength) {
      return function() {
        for (const d of data) {
          const cx = newWidth / 2;
          const cy = newHeight / 2;
          const dx = d.x - cx;
          const dy = d.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply a force towards the center of the donut shape
          const forceX = -dx * strength / distance;
          const forceY = -dy * strength / distance;

          // Update velocity with the gravitational force
          d.vx += forceX;
          d.vy += forceY;
        }
      };
    }

    // Add the gravitational force to the simulation
    const gravityStrength = 0.1; // Adjust the strength as needed
    simulation.force("gravity", gravitationalForce(gravityStrength));

    simulation
      .nodes(data2018)
      .on("tick", function() {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });

    // Functions to handle dragging:
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0.1);
      d.fx = null;  // Release the fixed position
      d.fy = null;  // so nodes can gently move towards their intended positions
    }

   // Define a function to update the visualization with new data
function updateVisualization(newData) {
  // Create scales for circle sizes and colors:
  const valueScale = d3.scaleSqrt()
    .domain([0, d3.max(newData, d => d.value)])
    .range([5, 80]);

  // Select all existing circles
  const node = newSvg.selectAll("circle")
    .data(newData);

  // Update the attributes of existing circles
  node
    .attr("r", d => valueScale(d.value))
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .style("fill", d => d.color)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("mouseover", function(event, d) {
      tooltip.style("display", "inline");
      tooltip.html(`<b>Commodity:</b> ${d.commodity}<br><b>Country:</b> ${d.name}<br><b>Value:</b> ${d.value} tons`)
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
    .on("click", function(event, d) {
      // Remove the tooltip on click
      tooltip.style("display", "none");
    });

  // Exit any old circles
  node.exit().remove();

  // Update the simulation with the new data
  simulation.nodes(newData);

  // Restart the simulation
  simulation.alpha(1).restart();
}

// Add an event listener for changes in the year selector
const yearSelector = document.getElementById("dateSlider2");
yearSelector.addEventListener("input", function () {
  const selectedYear = parseInt(yearSelector.value);

  // Filter the data based on the selected year
  const filteredData = data.filter(d => d.date.getFullYear() === selectedYear);

  // Update the visualization with the filtered data
  updateVisualization(filteredData);

  // Update the selected year text
  newSelectedYearText.text(`${selectedYear}`);
});



    

    window.addEventListener("resize", function() {
      // Get new width and height
      const newWidth = newDiv.node().getBoundingClientRect().width;
      const newHeight = newDiv.node().getBoundingClientRect().height;

      // Resize the SVG
      newSvg.attr("width", newWidth).attr("height", newHeight);

      // Optional: restart the simulation if you want the nodes to re-adjust immediately after resizing
      simulation.restart();
    });

  });
