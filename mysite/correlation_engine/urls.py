from django.conf.urls import patterns, url

from correlation_engine import views

urlpatterns = patterns('',
  url(r'^$', views.index, name='index'),
  url(r'^option/$', views.option, name='option'),
  
  
  url(r'^calculate/$', views.calculate, name='calculate'),
  url(r'^upload_file/$', views.upload_file, name='upload_file'),
)