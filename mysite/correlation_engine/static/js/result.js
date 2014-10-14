function one_one_text_mode()
{
  var svg = d3.select("#result")
                  .append("div").attr("id","result_graph")
                  .append("svg").attr("id","result_graph")

  var m = {'top':60, 'bottom':60, 'left':100, 'right':100},
  w = 1000,
  h = 300,
  x_tickSize = preview[0]['x_labels'].length

  var x = d3.scale.linear().range([m['left'], w - m['right']]);
  x.domain([d3.min(result['cross_correlation'], function(d){return d[0]}),
            d3.max(result['cross_correlation'], function(d){return d[0]})])

  var xAxisScale = d3.scale.ordinal().rangePoints([m['left'], w - m['right']])

  var y = d3.scale.linear().range([h - m['top'], m['bottom']]);
  y.domain([-1, 1])
  // y.domain([d3.min(result['cross_correlation'], function(d){return d[1]}),
  //           d3.max(result['cross_correlation'], function(d){return d[1]})])
  
  xAxisScale.domain(result['cross_correlation'], function(d){return d[0]})

  xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(5)
      .tickSubdivide(true),

  yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);

  // A line generator, for the dark stroke.
  var line = d3.svg.line()
      .x(function(d) { return x(d[0]); })
      .y(function(d) { return y(d[1]); })
      .interpolate("linear");

  svg.attr("width", w)
     .attr("height", h)
     .append('path')
      .attr("d", function(d) {     
        return line(result['cross_correlation']) 
      })
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("fill", "none");

  svg.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (m['left']) + ',0)')
      .call(yAxis);

  svg.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (h - m['bottom']) + ')')
      .call(xAxis);

  svg.append("text")
      .attr("x", (w / 2))             
      .attr("y", (m['top']/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "14px") 
      .style("text-decoration", "underline")  
      .text('Cross Correlation between\"'+preview[0]['name']+'\" and \"'+preview[1]['name']+'\"');

  svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (m['left']/2) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Correlation");

  svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (w/2) +","+(h-(m['bottom']/3))+")")  // centre below axis
      .text("Lag");

  svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (w/2) +","+h+")")  // centre below axis
      .text("Max Correlation:" + result['max_correlation'].toFixed(4) + "; Lag:" + result['lag']);

}

function one_many_text_mode()
{

  // d3.select("#result").select("table").selectAll("tr").insert("td", "td").data(selected_series_names).enter().text(function(d){return d;})
}
function one_many_graph_mode()
{
    //Width and height
    var w = 800,
        h = 400,
        barPadding = 1,
        m = {'top':50, 'bottom':50, 'left':50, 'right':50};
      
    //Scale
    var x = d3.scale.ordinal().rangeRoundBands([m['left'], (w-m['right'])], .05);
    var y = d3.scale.linear().range([m['bottom'], m['bottom']+(h-m['top']-m['bottom'])/2]);

    var yAxisScale = d3.scale.ordinal()
                 .rangePoints([m['bottom'], (h-m['top'])])
                 .domain(d3.range(-1, 1.2, 0.2));

    x.domain(selected_series_names.map(function(d) { return d; }));
    y.domain([0, 1]);

    //Create SVG element
    var svg = d3.select("#result")
          .append("div").attr("id", "result_graph")
          .append("svg")
          .attr("width", w)
          .attr("height", h);

    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .ticks(10);

    var yAxis = d3.svg.axis()
                  .scale(yAxisScale)
                  .tickSize(5)
                  .orient("left")
                  .tickSubdivide(true);

    svg.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('+m['left']+',0)')
      .call(yAxis);

    svg.selectAll("rect")
       .data(result)
       .enter()
       .append("rect")
       .each(function(d, i){
         d3.select(this)
           .attr("x", function(d) {
              return m['left'] + i * ((w-m['left']-m['right']) / result.length);
           })
           .attr("y", function(d) {
            if(d == 'nan')
              return m['bottom']+(h-m['top']-m['bottom'])/4
            else
            {
              if(d[0]>0)
                return m['bottom']+(h-m['top']-m['bottom'])/2 - y(d[0]);
              else
                return m['bottom']+(h-m['top']-m['bottom'])/2;
            }
           })
           .attr("width", (w-m['left']-m['right']) / result.length - barPadding)
           .attr("height", function(d){
             if(d == 'nan')
              return (h-m['top']-m['bottom'])/2;
             else
              return y(Math.abs(d[0]));
           })
           .attr("fill", function(d) {
            if(d == 'nan')
              return 'orange'
            else{
              if(d[0]>0) return 'green';
              else return 'red'
            }
           });
         }
       )  
}

function many_many_text_mode()
{
  var tr = d3.select("#result")
             .append("div")
             .attr("id", "result_text")
             .append("table")
             .attr("border", "1")
             .selectAll("tr")
             .data(result).enter().append("tr")
            
  var td = tr.selectAll("td")
             .data(function(d){return d; })
             .enter()
             .append("td")
             .append("pre")
             .text(function(d){
              if(d == 'nan')
                return d
              else if(d == 'self')
                return ''
              else
                return d[0].toFixed(4)+'\n'+d[1].toFixed(4);
            })

  d3.select("#result_text")
    .select("table")
    .insert("tr","tr")
    .selectAll("td")
    .data(selected_series_names)
    .enter()
    .append("td")
    .text(function(d){return d;})

  // to make the fisr element in the fisrt coloumn empty
  // copy array
  var tmp_selected_series_names = selected_series_names.slice(0)
  tmp_selected_series_names.splice(0, 0, '')

  d3.select("#result_text")
    .select("table")
    .selectAll("tr")
    .data(tmp_selected_series_names)
    .insert("td", "td")
    .text(function(d){return d;})
  // d3.select("#result").select("table").selectAll("tr").insert("td", "td").data(selected_series_names).enter().text(function(d){return d;})
}

function many_many_graph_mode()
{
  var w = 1000,
      h = 550,
      m = {'top':30, 'bottom':100, 'left':100, 'right':100},
      innerPadding = 0.1,
      outPadding = 0.1,
      legendRange = d3.range(-1, 1.1, 0.1);
  // Scale
  result = result.slice(1).map(function(row, i){return row.slice(0,i+1)})
  var cx = d3.scale.ordinal()
                  .rangeBands([m['left'], w - m['right']], innerPadding, outPadding)
                  .domain(d3.range(selected_series_names.length-1))

  var cy = d3.scale.ordinal()
                  .rangeBands([m['top'], h - m['bottom']], innerPadding, outPadding)
                  .domain(d3.range(selected_series_names.length-1))

  var cr = cx.rangeBand()/2;
  var r = d3.scale.linear()
                  .range([0, cr])
                  .domain([0, 1]);

  var legendElementWidth = cx.rangeBand()/2;
  var legendy = d3.scale.ordinal()
                  .rangeBands([h - m['bottom'], m['top']*2])
                  .domain(d3.range(0, legendRange.length));

  var xAxisScale = d3.scale.ordinal()
                     .range(cx.range().map(function(d){return d+cr}))
                     .domain(selected_series_names.slice(0,selected_series_names.length - 1).map(function(d, i) { return d; }));

  var yAxisScale = d3.scale.ordinal()
                     .range(cy.range().map(function(d){return d+cy.rangeBand()/2}))
                     .domain(selected_series_names.slice(1).map(function(d, i) { return d; }));

  var color = d3.scale.linear()
                .domain([-1, 0, 1])
                .range(["red", "white", "green"]);

  xAxis = d3.svg.axis()
          .scale(xAxisScale)
          .tickSize(5)
          .orient("bottom")
          .tickSubdivide(true),

  yAxis = d3.svg.axis()
            .scale(yAxisScale)
            .tickSize(5)
            .orient("left")
            .tickSubdivide(true);

  var svg = d3.select("#result")
          .append("div").attr("id", "result_graph")
          .append("svg")
          .attr("width", w)
          .attr("height", h)
          
  var background = svg.append("rect")
                      .classed("svg-background", true)
                      .attr('x', m['left'])
                      .attr('y', m['top'])
                      .attr('width', w - m['left'] - m['right'])
                      .attr('height', h - m['top'] - m['bottom'])
                      .attr('fill', '#B8B8B8')
  
  // RECT MODE
  var row = svg.selectAll("g")
          .data(result)
          .enter()
          .append("g")
          .attr("row", function(d, i){
            return i;
          })
          .attr("transform", function(d, i) { 
            return "translate(0," + (cy(i)) + ")"; 
          })
  
  row.selectAll("rect")
     .data(function(d){return d; })
     .enter()
     .append("rect")
     // .transition()
     .attr('x', function(d, i){
      return cx(i)
     })
     .attr('y', 0)
     .attr('width', function(d){
      return cx.rangeBand();
     })
    .attr('height', function(d){
      return cy.rangeBand();
     })
    .on("mouseover", function(d, col){
      //highlight text
      var rect_under_mouse = this
      var row = d3.select(this.parentNode).attr('row')
      d3.select(this).classed("cell-hover",true);
      d3.selectAll("#result svg .y.axis .tick text").classed("text-highlight",function(r, ri){ return ri==row;});
      d3.selectAll("#result svg .x.axis .tick text").classed("text-highlight",function(c, ci){ return ci==col;});

      //Update the tooltip position and value
      var tooltip = d3.select("#tooltip")
                      .style("poisition", "absolute")
                      .style("left", (d3.event.pageX+10) + "px")
                      .style("top", (d3.event.pageY-10) + "px")
      if(d == 'nan')
      {
        tooltip.append("p").text(selected_series_names[Number(row)+1]+","+selected_series_names[col])
        tooltip.append("p").text("Correlation:NaN")
      }
      else
      {
        tooltip.append("p").text(selected_series_names[Number(row)+1]+","+selected_series_names[col])
        tooltip.append("p").text("Correlation:"+d[0].toFixed(4))
        tooltip.append("p").text("P_value:"+d[1].toFixed(4))
      }  
      //Show the tooltip
      d3.select("#tooltip").classed("hidden", false);

      d3.select("#result #result_graph svg")
        .selectAll("rect:not(.svg-background)")
        .style('opacity',function () {
          return (this === rect_under_mouse) ? 1.0 : 0.3;
        });
    })
    .on("mouseout", function(){
      d3.select(this).classed("cell-hover",false);
      d3.selectAll(".y.axis .tick text").classed("text-highlight",false);
      d3.selectAll(".x.axis .tick text").classed("text-highlight",false);
      $("#tooltip p").remove()
      d3.select("#tooltip").classed("hidden", true);
   
      // Recompense the color of other rect
      d3.select("#result #result_graph svg")
        .selectAll("rect:not(.svg-background)")
        .style('opacity', function(){
          return 1.0;
        });
    })
    .attr('fill', function(d){
      if(d == 'nan')
        return '#FF9900'
      else if(d == 'self')
        return '#B8B8B8'
      else
        return color(d[0])
    })
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    ;

  svg.append('svg:g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + (m['left']) + ',0)')
    .call(yAxis);
  
  svg.append('svg:g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + (h - m['bottom']) + ')')
    .call(xAxis)

  var legend = svg.selectAll(".legend")
                  .data(legendRange)
                  .enter().append("g")
                  .attr("class", "legend");
  
  legend.append("rect")
        .attr("x", w - m['right']/1.5)
        .attr("y", function(d, i) { return legendy(i); })
        .attr("width", m['right']/4)
        .attr("height", legendy.rangeBand())
        .style("fill", function(d, i) { return color(d); });
 
  legend.append("text")
        .text(function(d, i) { if(i%2 == 0)return d; })
        // .attr("width", legendElementWidth)
        .attr("x", w - m['right']/1.5 + m['right']/4)
        .attr("y", function(d, i) { return legendy(i) + legendy.rangeBand()/2; })

  // Special notation
  var nan_legend = svg.append("g")
                      .attr("class", "legend")

  nan_legend.append("rect")
            .attr("x", w - m['right']/1.5 )
            .attr("y", legendy(legendRange.length-1)-2*legendy.rangeBand())
            .attr("width", m['right']/4)
            .attr("height", legendy.rangeBand())
            .style("fill", "#FF9900");

  nan_legend.append("text")
            .text("NaN")
            .attr("x", w - m['right']/1.5 + m['right']/4)
            .attr("y", legendy(legendRange.length-1)-2*legendy.rangeBand()+legendy.rangeBand()/2)
}
