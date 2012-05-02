require 'rho/rhocontroller'
require 'helpers/application_helper'

class OrderController < Rho::RhoController
  include ApplicationHelper

  # Class variable because controller instance gets recreated
  @@cached_orders_list = []

  def addPictures
    render
  end

  def orders
    @@cached_orders_list
  end

  def current
    render
  end

  def index
    Rho::AsyncHttp.get(
      :url => 'http://andidogs.dyndns.org/thesis-mobiprint-web-service/orders/',
      :callback => (url_for :action => :on_get_orders)
    )

    render()
  end

  def on_get_orders
    return unless @params['status'] == 'ok'
    @@cached_orders_list = @params['body']['orders']
    # TODO: refresh order detail view if it's the current view, handle errors

      #if @params['status'] != 'ok'
    #    @@error_params = @params
    #    WebView.navigate ( url_for :action => :show_error )
    #else
    #    @@get_result = @params['body']
    #    WebView.navigate ( url_for :action => :show_result )
    #end
  end
end