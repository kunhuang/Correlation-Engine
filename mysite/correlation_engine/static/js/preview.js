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
  selected_series_names.forEach(function(e){
    series = {
      'y_values':dataset.map(function(row){return row[e]}).slice(1).map(Number),
      'x_labels':x_labels,
      'name':series_names[e]
    }
    preview.push(series)
  })

  preview.push()
  $("#preview_svg").remove();
  preview_draw()
}
function preview_draw()
{
  $('<div id="preview_svg"></div>').appendTo('#preview')
  $('#preview_svg').highcharts({
        title: {
            text: 'Monthly Average Temperature',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: WorldClimate.com',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'New York',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });

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
