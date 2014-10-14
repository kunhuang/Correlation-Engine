function make_preview(drag_event)
{
  options['option_mode'] = $('#option_mode').val(),
  options['option_algorithm'] = $('#option_algorithm').val(),
  options['option_data_mode'] = $('#option_data_mode').val(),
  options['time_series_analysis'] = ($('#time_series_analysis').attr('checked') == 'checked')

  if(!drag_event)
  {
    if($('#option_mode').val() == 'many_many')
    {  
      options['option_data'] = $('#option_data>#data').val().map(Number)
      selected_series_names = options['option_data']
    }
    else if(($('#option_mode').val() == 'one_many'))
    {
      options['option_data1'] = Number($('#option_data>#data1').val())  
      options['option_data2'] = $('#option_data>#data2').val().map(Number)
      selected_series_names = options['option_data2']
      selected_series_names.splice(0,0,options['option_data1'])
    }
    else
    {
      options['option_data1'] = Number($('#option_data>#data1').val())  
      options['option_data2'] = Number($('#option_data>#data2').val())
      selected_series_names = [options['option_data1'], options['option_data2']]
    }
  }

  preview = [];
  options['option_data'].forEach(function(e){
    series = {
      'y_values':dataset.map(function(row){return row[e]}).slice(1).map(Number),
      'x_labels':x_labels,
      'name':series_names[e]
    }
    preview.push(series)
  })

  // $("#preview").show()
  $("#preview_svg").remove();
  preview_draw()
}
function preview_draw()
{
  d3.select("#preview").append("div").attr("id","preview_svg")

  var m = {'top':20, 'bottom':20, 'left':100, 'right':20},
  w = 700,
  h = 200,
  x_tickSize = preview[0]['x_labels'].length

  var x = d3.scale.linear().range([m['left'], w - m['right']]);
  x.domain([0, preview[0]['x_labels'].length - 1])

  var xAxisScale = d3.scale.ordinal().rangePoints([m['left'], w - m['right']])

  var y = d3.scale.linear().range([h - m['top'], m['bottom']]);
  // y.domain([0, 10])

  xAxis = d3.svg.axis()
      .scale(xAxisScale)
      .tickSize(5)
      .tickSubdivide(true),

  yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);

  // A line generator, for the dark stroke.
  var line = d3.svg.line()
      .x(function(d, i) { return x(i); })
      .y(function(d) { return y(d); })
      // .interpolate("basis");

  var svg = d3.select('#preview_svg')
              .selectAll('svg')
              .data(preview)
              .enter()
              .append('svg')
              .attr("width", w)
              .attr("height", h)

  svg.each(function(d, i){
    y.domain([d3.min(d['y_values']),
              d3.max(d['y_values'])])
    xAxisScale.domain(d['x_labels'])

    d3.select(this)
      .attr('id', function(d){return 'preview'+d['name']})

    d3.select(this)
      .append('path')
      .attr("d", function(d) {     
        return line(d['y_values']) 
      })
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    // d3.select(this)
    //   .append('svg:g')
    //   .attr('class', 'x axis')
    //   .attr('transform', 'translate(0,' + (h - m['bottom']) + ')')
    //   .call(xAxis);

    d3.select(this)
      .append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (m['left']) + ',0)')
      .call(yAxis);

    d3.select(this)
      .append("text")
      .attr("x", (w / 2))             
      .attr("y", (m['top']/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "14px") 
      .style("text-decoration", "underline")  
      .text(function(d){return d['name']});

    d3.select(this)
      .append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (m['left']/2) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Value");

    d3.select(this)
      .append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (w/2) +","+(h-(m['bottom']/3))+")")  // centre below axis
      .text(x_label_name);

  })
}
