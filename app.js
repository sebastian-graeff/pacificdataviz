d3.csv("https://raw.githubusercontent.com/sebastian-graeff/college-majors-visualisation/master/data/CountryYearly.csv", d3.autoType).then(data => {

    const margin = { top: 16, right: 6, bottom: 6, left: 250 }; // Increase the left margin value
    const height = 0.8 * window.innerHeight - margin.top - margin.bottom;

    
    const containerWidth = document.querySelector("#my-chart-container").clientWidth;
    const width = 0.8 * containerWidth - margin.left - margin.right;

    const duration = 250;
    const n = 15;
    const k = 10;
    const barSize = (height - margin.top - margin.bottom) / n;

    const names = new Set(data.map(d => d.name));
    const datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
      .map(([date, data]) => [new Date(date), data])
      .sort(([a], [b]) => d3.ascending(a, b));
  
      const svg = d3.select("#my-chart-container").append("svg")
      .attr("width", `${width + margin.left + margin.right}px`)
      .attr("height", `${height + margin.top + margin.bottom}px`);
  
    const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
  
    const y = d3.scaleBand()
   .domain(d3.range(n))
   .rangeRound([margin.top, height - margin.bottom])
   .padding(0.1);
  
  
    function rank(value) {
      const data = Array.from(names, name => ({ name, value: value(name) }));
      data.sort((a, b) => d3.descending(a.value, b.value));
      for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
      return data;
    }
  
    function generateKeyframes() {
      const keyframes = [];
      let ka, a, kb, b;
      for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
          const t = i / k;
          keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
          ]);
        }
      }
      keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
      return keyframes;
    }
  
    function bars(svg) {
      let bar = svg.append("g")
          .attr("fill-opacity", 0.6)
          .selectAll("rect");
  
      return ([date, data], transition) => bar = bar
          .data(data.slice(0, n), d => d.name)
          .join(
              enter => enter.append("rect")
                  .attr("height", y.bandwidth())
                  .attr("x", x(0))
                  .attr("y", d => y(d.rank))
                  .attr("width", d => x(d.value) - x(0)),
              update => update,
              exit => exit.transition(transition).remove()
          )
          .call(bar => bar.transition(transition)
              .attr("y", d => y(d.rank))
              .attr("width", d => x(d.value) - x(0)));
  }
  
  
    function labels(svg) {
      let label = svg.append("g")
          .style("font", "bold 12px var(--sans-serif)")
          .style("font-variant-numeric", "tabular-nums")
          .attr("text-anchor", "end")  // Right align text
          .selectAll("text");

      return ([date, data], transition) => label = label
          .data(data.slice(0, n), d => d.name)
          .join(
              enter => enter.append("text")
                  .attr("transform", d => `translate(${margin.left - 10},${y(d.rank)})`) // Positioned to the left of the bars
                  .attr("y", y.bandwidth() / 2)
                  .attr("x", 0)
                  .attr("dy", "-0.25em")
                  .text(d => d.name),
              update => update,
              exit => exit.transition(transition).remove()
          )
          .call(label => label.transition(transition)
              .attr("transform", d => `translate(${margin.left - 10},${y(d.rank)})`)); // Translate to new rank position
  }

    function axis(svg) {
      const g = svg.append("g")
        .attr("transform", `translate(0,${margin.top})`);
  
      return (_, transition) => {
        const axis = d3.axisTop(x).ticks(width / 160).tickSizeOuter(0).tickSizeInner(-barSize * (n + y.padding()));
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();
      };
    }
  
    function ticker(svg) {
      const now = svg.append("text")
        .style("font", `bold ${barSize}px var(--sans-serif)`)
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .attr("x", width - 6)
        .attr("y", margin.top + barSize * (n - 0.45))
        .attr("dy", "0.32em");
  
      return ([date], transition) => {
        transition.end().then(() => now.text(d3.utcFormat("%Y")(date)));
      };
    }
  
    const updateBars = bars(svg);
    const updateLabels = labels(svg);
    const updateAxis = axis(svg);
    const updateTicker = ticker(svg);

    let currentFrameIndex = 0;

    let isChartCentered = false;
    let isScrollingStopped = false;
    let lastScrollPosition = window.scrollY;
    
    const chartContainer = document.querySelector("#my-chart-container");
    const containerTop = chartContainer.getBoundingClientRect().top + window.scrollY;
    const containerHeight = chartContainer.clientHeight;
    const centerPosition = containerTop + (containerHeight / 2) - (window.innerHeight / 2);
    
    let stopPosition = centerPosition;

    // Set up a flag to know when we are in "in-place" scrolling mode
    let inPlaceScrolling = false;
    // Track the progress of in-place scrolling
    let inPlaceScrollProgress = 0;
    // Set speed of in-place scrolling
    let scrollIncrement = 0.003;

    // Update the handleScroll function
    function handleScroll() {
        const scrollPosition = window.scrollY;

        // If chart is centered and not already in "in-place" scrolling mode
        if (scrollPosition >= centerPosition && !inPlaceScrolling) {
            inPlaceScrolling = true;
            stopPosition = scrollPosition; // Set stopPosition
            window.scrollTo(0, stopPosition); // Freeze the page scroll
            return; // Do not process the rest on first centering
        } else if (scrollPosition < centerPosition && inPlaceScrolling) {
            inPlaceScrolling = false; // Return to normal scrolling if user scrolls above the chart
        } else if (inPlaceScrolling) {
            window.scrollTo(0, stopPosition); // Keep the page frozen
        }
    }

    // Handle the wheel event for in-place scrolling
    function handleWheel(event) {
      if (!inPlaceScrolling) return;

      event.preventDefault(); // Prevent the default scrolling

      // Determine the scroll direction
      let scrollDirection = event.deltaY > 0 ? 1 : -1;

      // Calculate the target frame based on scroll direction
      inPlaceScrollProgress += scrollDirection * scrollIncrement;
      let targetFrameIndex = Math.round(currentFrameIndex + inPlaceScrollProgress);
      if (targetFrameIndex < 0) {
          targetFrameIndex = 0;
          inPlaceScrollProgress = 0; // Reset the progress
      } else if (targetFrameIndex > keyframes.length - 1) {
          targetFrameIndex = keyframes.length - 1;
          inPlaceScrolling = false; // Stop in-place scrolling at the end
      }

      // Update the chart if the frame has changed
      if (targetFrameIndex !== currentFrameIndex) {
          updateChartForFrame(keyframes[targetFrameIndex]);
          currentFrameIndex = targetFrameIndex;
      }
    }
  

    function updateChartForFrame(keyframe) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);

        x.domain([0, keyframe[1][0].value]);

        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateAxis(keyframe, transition);
        updateTicker(keyframe, transition);
    }

    const keyframes = generateKeyframes();
    
    //Initialize the chart with the first frame
    updateChartForFrame(keyframes[0]);


    // Set up the scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("wheel", handleWheel, { passive: false }); // "passive: false" allows us to prevent the default event

  });