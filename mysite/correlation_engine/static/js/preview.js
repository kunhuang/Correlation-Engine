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
      selected_series = options['option_data']
    }
    else if(($('#option_mode').val() == 'one_many'))
    {
      options['option_data1'] = Number($('#option_data>#data1').val())  
      options['option_data2'] = $('#option_data>#data2').val().map(Number)
      selected_series = options['option_data2']
      selected_series.splice(0,0,options['option_data1'])
    }
    else
    {
      options['option_data1'] = Number($('#option_data>#data1').val())  
      options['option_data2'] = Number($('#option_data>#data2').val())
      selected_series = [options['option_data1'], options['option_data2']]
    }
  }

  preview = [];
  selected_series.forEach(function(e){
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
  
  preview.forEach(function(d, i){
    $('<div id="preview'+d['name']+'"></div>').appendTo('#preview_svg')
    $('#preview'+d['name']).highcharts({
        title: {
            text: d['name'],
            x: -20 //center
        },
        yAxis: {
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: d['name'],
            data: preview[0]['y_values'],
        }]
    });
  })
}
