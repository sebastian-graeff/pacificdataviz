let voronoiTreeMap = d3.voronoiTreemap()
.prng(seed)
.clip(ellipse);

voronoiTreeMap(emissions_hierarchy);
colorHierarchy(emissions_hierarchy);

let allNodes = emissions_hierarchy.descendants()
.sort((a, b) => b.depth - a.depth)
.map((d, i) => Object.assign({}, d, { id: i }));

let hoveredShape = null;

voronoi.selectAll('path')
.data(allNodes)
.enter()
.append('path')
.attr('d', d => "M" + d.polygon.join("L") + "Z")
.style('fill', d => d.parent ? d.parent.color : d.color)
.attr("stroke", "#F5F5F2")
.attr("stroke-width", 0)
.style('fill-opacity', d => d.depth === 2 ? 1 : 0)
.attr('pointer-events', d => d.depth === 2 ? 'all' : 'none')
.on('mouseenter', d => {
  let label = labels.select(`.label-${d.id}`);
  label.attr('opacity', 1)
  let pop_label = pop_labels.select(`.label-${d.id}`);
  pop_label.attr('opacity', 1)
})
.on('mouseleave', d => {
  let label = labels.select(`.label-${d.id}`);
  label.attr('opacity', d => d.data.Total2018 > 400000 ? 1 : 0)
  let pop_label = pop_labels.select(`.label-${d.id}`);
  pop_label.attr('opacity', d => d.data.Total2018 > 400000 ? 1 : 0)
})
.transition()
.duration(1000)
.attr("stroke-width", d => 7 - d.depth * 2.8)
.style('fill', d => d.color);

labels.selectAll('text')
.data(allNodes.filter(d => d.depth === 2))
.enter()
.append('text')
.attr('class', d => `label-${d.id}`)
.attr('text-anchor', 'middle')
.attr("transform", d => "translate(" + [d.polygon.site.x, d.polygon.site.y + 6] + ")")
.text(d => d.data.key || d.data.Country)
//.attr('opacity', d => d.data.key === hoveredShape ? 1 : 0)
.attr('opacity', function(d) {
  if (d.data.key === hoveredShape) {
    return (1);
  } else if (d.data.Total2018 > 400000) {
    return (1);
  } else { return (0); }
})

.attr('cursor', 'default')
.attr('pointer-events', 'none')
.attr('fill', 'black')
.style('font-family', 'Montserrat');

pop_labels.selectAll('text')
.data(allNodes.filter(d => d.depth === 2))
.enter()
.append('text')
.attr('class', d => `label-${d.id}`)
.attr('text-anchor', 'middle')
.attr("transform", d => "translate(" + [d.polygon.site.x, d.polygon.site.y + 25] + ")")
.text(d => bigFormat(d.data.Total2018))
//.attr('opacity', d => d.data.key === hoveredShape ? 1 : 0)
.attr('opacity', function(d) {
  if (d.data.key === hoveredShape) {
    return (1);
  } else if (d.data.Total2018 > 400000) {
    return (1);
  } else { return (0); }
})

.attr('cursor', 'default')
.attr('pointer-events', 'none')
.attr('fill', 'black')
.style('font-size', '12px')
.style('font-family', 'Montserrat');