from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django import forms
from django.template import RequestContext, loader
from django.views.decorators.csrf import csrf_exempt
from scipy.stats.stats import pearsonr
import csv
import json
import numpy
import pdb
import math
import math

file_directory = 'correlation_engine/file/'
# converting the the correlation matrix result
def spec_convert(l):
  for i, row in enumerate(l):
    for j, column in enumerate(row):
      if i == j:
        l[i][j] = str('self')
      else:
        for k, item in enumerate(column):
          if math.isnan(item):
            l[i][j] = str('nan')
  return l

def index(request):
  return render_to_response('correlation_engine/correlation_engine.html')
  
@csrf_exempt
def option(request):
  if request.method == 'POST':
    f = request.FILES['data_file']
    
    client = request.META['REMOTE_ADDR']
    file_type = '.csv'

    myfile = open(file_directory+client+file_type, 'wb+')
    
    for chunk in f.chunks():
      myfile.write(chunk)
    myfile.close()

    myfile = open(file_directory+client+file_type, 'rU')
    data_file = csv.reader(myfile, delimiter=',')
      
    data = []
    for row in data_file:
      data.append(row)
    myfile.close()

    return HttpResponse(json.dumps(data))

@csrf_exempt
def calculate(request):
  if request.method == 'POST':
    client = request.META['REMOTE_ADDR']
    file_type = '.csv'

    if request.POST['option_mode'] == 'one_one':
      myfile1 = open(file_directory+client+file_type, 'rU')
      data = csv.reader(myfile1, delimiter=',')

      matrix = []
      for row in data:
        matrix.append(row)

      if(request.POST.get('option_data_mode') == 'data_by_row'):
        matrix = map(list, zip(*matrix))

      data = {
          'labels':matrix[0],
          'dataset':matrix[1:]
          }
      myfile1.close()
      
      index1 = map(int, request.POST.get('option_data1'))
      index2 = map(int, request.POST.get('option_data2'))
    
      np_data1 = numpy.array(data['dataset'])[:,index1].astype(numpy.float)
      np_data2 = numpy.array(data['dataset'])[:,index2].astype(numpy.float)
      
      # Cross Correlation calculation for time series analysis
      if request.POST['time_series_analysis'] == 'true':
        result = {"cross_correlation":[],
                  "max_correlation":[],
                  "lag":[]}

        l = len(np_data1)
        result["max_correlation"] = 0
        for i in range(-l+1, l-1):
          if i < 0:
            correlation = spec_convert(pearsonr(np_data1[range(-i,l), :], np_data2[range(0, i+l),:])[0][0])
          else:
            correlation = spec_convert(pearsonr(np_data1[range(0,l-i), :], np_data2[range(i, l),:])[0][0])

          if(numpy.isnan(correlation) == True):
            correlation = 0
         
          if(abs(correlation) > result["max_correlation"]):
            result["max_correlation"] = abs(correlation)
            result["lag"] = i
          result['cross_correlation'].append([i, correlation])
      
      return HttpResponse(json.dumps(result))
    elif request.POST['option_mode'] == 'one_many':
      myfile1 = open(file_directory+client+file_type, 'rU')
      data = csv.reader(myfile1, delimiter=',')

      matrix = []
      for row in data:
        matrix.append(row)

      if(request.POST.get('option_data_mode') == 'data_by_row'):
        matrix = map(list, zip(*matrix))

      data = {
          'labels':matrix[0],
          'dataset':matrix[1:]
          }
      myfile1.close()
      
      index1 = map(int, request.POST.get('option_data1'))
      index2 = map(int, request.POST.getlist('option_data2[]'))
      
      np_data1 = numpy.array(data['dataset'])[:,index1].astype(numpy.float)
      np_data2 = numpy.array(data['dataset'])[:,index2].astype(numpy.float)
      
      result = numpy.zeros((len(index2), 2))
      for i in range(len(index2)):
        result[i] = map(spec_convert, pearsonr(np_data1, np_data2[:,i]))
      result = result.tolist()
      # result = [[0.6, 0.5], [-.3, 0.1]];
    elif request.POST['option_mode'] == 'many_many':
      myfile1 = open(file_directory+client+file_type, 'rU')
      data = csv.reader(myfile1, delimiter=',')

      matrix = []
      for row in data:
        matrix.append(row)
      if(request.POST.get('option_data_mode') == 'data_by_row'):
        matrix = map(list, zip(*matrix))


      data = {'labels':matrix[0],'dataset':matrix[1:]}
      myfile1.close()
      
      index = map(int, request.POST.getlist('option_data[]'))

      np_data = numpy.array(data['dataset'])
      np_data = np_data[:,index].astype(numpy.float)
      
      result = numpy.zeros((len(index), len(index), 2))
      for i in range(len(index)):
        for j in range(len(index)):
          if i != j:
            result[i, j] = pearsonr(np_data[:,i], np_data[:,j])

      result = result.tolist()
      result = spec_convert(result)
      # result = [[[0.6, 0.5], [-.3, 0.1]], [[0.6, 0.5], [-.3, 0.1]]];
    return HttpResponse(json.dumps(result))
  else:
    return HttpResponse('fail')

@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
      f = request.FILES['data_file']
      myfile = open(file_directory+client+file_type, 'wb+')
            
      for chunk in f.chunks():
        myfile.write(chunk)
      myfile.close()

      myfile = open(file_directory+client+file_type, 'rb')
      data = csv.reader(myfile, delimiter=',', quotechar='\n')
      
      matrix = []
      for row in data:
        matrix.append(row)

      return HttpResponse(matrix)
    else:
      template = loader.get_template('correlation_engine/input.html')
      context = RequestContext(request)
      return HttpResponse(template.render(context))
    # return render_to_response('correlation_engine/input.html', context_instance=RequestContext(request))
    