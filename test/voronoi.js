const width = 600;
const height = 600;

const svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", height);

// Sample data
const data = {
  "name": "root",
  "value": 100,
  "children": [
    { "name": "A", "value": 50 },
    { "name": "B", "value": 30 },
    { "name": "C", "value": 20 }
  ]
};

// Convert data to hierarchy
const root = d3.hierarchy(data).sum(d => d.value);

// Create voronoi treemap
const voronoiTreemap = d3.voronoiTreemap()
  .extent([[0, 0], [width, height]]);

voronoiTreemap(root);

// Color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Draw cells
svg.selectAll("path")
  .data(root.leaves())
  .enter().append("path")
  .attr("d", d => "M" + d.polygon.join("L") + "Z")
  .attr("fill", d => color(d.data.name))
  .attr("stroke", "white");

// Add labels
svg.selectAll("text")
  .data(root.leaves())
  .enter().append("text")
  .attr("transform", d => `translate(${d.polygon.site.x},${d.polygon.site.y})`)
  .attr("text-anchor", "middle")
  .attr("dy", ".35em")
  .text(d => d.data.name);
