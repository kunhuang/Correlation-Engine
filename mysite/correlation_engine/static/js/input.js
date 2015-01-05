var client = new XMLHttpRequest();

// $("#parser").hide();
// $("#option").hide();
// $("#result").hide();
// $("#preview").hide();

function check_input_file()
{
  if($("#check_input_file").attr('checked'))
    $("#input_file").show()
  else
    $("#input_file").hide()
}
function check_option()
{
  if($("#check_option").attr('checked'))
    $("#option").show()
  else
    $("#option").hide()
}
function check_drop_area()
{
  if($("#check_drop_area").attr('checked'))
  {  
    $("#drop_area").show()
    $("#preview").parent().removeClass('col-md-12')
    $("#preview").parent().addClass('col-md-9')
  }
  else
  {
    $("#drop_area").hide()
    $("#preview").parent().removeClass('col-md-9')
    $("#preview").parent().addClass('col-md-12')
  }
}
function check_preview()
{
  if($("#check_preview").attr('checked'))
    $("#preview").show()
  else
    $("#preview").hide()
}
function check_result()
{
  if($("#check_result").attr('checked'))
    $("#result").show()
  else
    $("#result").hide()
}

function upload() 
{
  $("#upload").val("uploading...")
              .addClass("disabled");
  
  var file = document.getElementById("data_file");

  /* Create a FormData instance */
  var formData = new FormData();
  /* Add the file */ 
  //formData.append("data_file", file.files[0]);

  formData.append("data_file", file.files[0])
  client.open("post", "option/", true);
  client.send(formData);  /* Send to server */ 
}

/* Check the response status */  
client.onreadystatechange = function() 
{
  if(client.readyState == 4)
  {  
    if(client.status == 200) 
    {
      // alert(client.statusText);
      var responseJSON = JSON.parse(client.responseText)
      if(responseJSON['success'] == 0)
        alert(responseJSON['reason'])
      else
      {  
        dataset = responseJSON['content']
        series_names = dataset[0]
        x_labels = dataset.map(function(row){
          return row[0]+','+row[1]
        }).slice(1);
        x_label_name = series_names[0]
        $("#option_data_mode").val('data_by_column')
        $("#option_mode").val('many_many')
        change_mode('many_many')
        alert("upload successfully!")
      }
    }
    else
    {
      alert("try again!")
    }
    $("#upload").val("upload").removeClass("disabled");
  }
}

function one_one()
{
  var data1_select = d3.select("#option_data").append("select").attr("id", "data1")
  data1_select.selectAll("option").data(series_names).enter()
  .append("option")
  .attr("value", function(d, i){return i; })
  .text(function(d){return d; })
  
  var data2_select = d3.select("#option_data").append("select").attr("id", "data2")
  data2_select.selectAll("option").data(series_names).enter()
  .append("option")
  .attr("value", function(d, i){return i; })
  .text(function(d){return d; })
}
function one_many()
{
  d3.select("#option_data")
    .append("select")
    .attr("id", "data1")
    .selectAll("option")
    .data(series_names).enter()
    .append("option")
    .attr("value", function(d, i){return i; })
    .text(function(d){return d; })

  d3.select("#option_data")
    .append("select")
    .attr("multiple","")
    .attr("size", "15")
    .attr("id", "data2")
    .selectAll("option")
    .data(series_names).enter()
    .append("option")
    .attr("selected","")
    .attr("value", function(d, i){return i; })
    .text(function(d){return d; })      
}
function many_many()
{
  var data_select = d3.select("#option_data")
                        .append("select")
                        .attr("multiple","")
                        .attr("size", 15)
                        .attr("id", "data")
                        .attr("class", "form-control tagdiv")
                        .attr("ondrop", "drop(event)")
                        .attr("ondragover", "allowDrop(event)");

    data_select.selectAll("option")
                .data(series_names)
                .enter()
                .append("option")
                .attr("selected","")
                .attr("draggable",true)
                .attr("ondragstart", "drag(event)")
                .attr("class", "dragElement")
                .attr("id", function(d, i){return i+d; })
                .attr("value", function(d, i){return i; })
                .text(function(d){return d; });          
}
function change_mode(mode)
{
  if(data=document.getElementById("data1"))
    data.remove()
  if(data=document.getElementById("data2"))
    data.remove()
  if(data=document.getElementById("data"))
    data.remove()
  
  if (mode=="one_one") {one_one();}
  else if(mode=="one_many") {one_many();}
  else if(mode=="many_many") {many_many();}
}
function change_data_mode(data_mode)
{
  var newdataset = dataset[0].map(function(col, i) { 
    return dataset.map(function(row) { 
      return row[i] 
    })
  });
  dataset = newdataset;
  series_names = dataset[0];
  x_labels = dataset.map(function(row){
    return row[0]
  }).slice(1);
  x_label_name = series_names[0]
  change_mode($('#option_mode').val());
}

function calculate(drag_event)
{
  options['option_mode'] = $('#option_mode').val(),
  options['option_algorithm'] = $('#option_algorithm').val(),
  options['option_data_mode'] = $('#option_data_mode').val(),
  options['time_series_analysis'] = ($('#time_series_analysis').attr('checked') == 'checked')

  
  // FOR BUTTON VERSION
  if(!drag_event)
  {
    if($('#option_mode').val() == 'many_many')
    {
      options['option_data'] = $('#option_data>#data').val().map(Number)
      selected_series_names = options['option_data'].map(function(d){return series_names[d]})
    }
    else if(($('#option_mode').val() == 'one_many'))
    {
      options['option_data1'] = Number($('#option_data>#data1').val())  
      options['option_data2'] = $('#option_data>#data2').val().map(Number)
      selected_series_names = options['option_data2'].map(function(d){return series_names[d]})
    }
    else
    {
      options['option_data1'] = Number($('#option_data>#data1').val())  
      options['option_data2'] = Number($('#option_data>#data2').val())
    }
  }  
  
  $.post( "calculate/", options, function(responseText) {
    result = responseText
    result = JSON.parse(responseText)
    $('#result').show();
    $("#result").scrollTop;
    $('#result_text').remove();
    $('#result_graph').remove();
    if(options['option_mode'] == 'one_one')
      one_one_text_mode();
    else if(options['option_mode'] == 'one_many')
    {  
      one_many_text_mode();
      one_many_graph_mode();
      // checkField('graph_mode');
    }
    else if(options['option_mode'] == 'many_many')
    {  
      many_many_graph_mode();
      // many_many_text_mode();
    }
    $("#download_result").show()
  });
}

function checkField(mode)
{
  // $.('#result').remove();
  // if(result=document.getElementById("result"))
  //   result.remove()
  if (mode == "text_mode") 
  {
    $('#result_text').show();
    $('#result_graph').hide();
  }
  else if(mode == "graph_mode")
  {
    $('#result_text').hide();
    $('#result_graph').show();
  }
}