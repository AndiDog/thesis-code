require 'date'
require 'Configuration/configuration'
require 'rho/rhocontroller'
require 'helpers/application_helper'

class OrderController < Rho::RhoController
  include ApplicationHelper

  def addPictures
    render
  end

  def orders
    Order.find(:all, :order => 'id')
  end

  def current
    render
  end

  def index
    puts "Last order list update was #{((DateTime.now - Configuration.last_orders_list_update) * 86400).to_f} seconds ago"
    puts 'Sending order list query'
    Rho::AsyncHttp.get(
      :url => 'http://andidogs.dyndns.org/thesis-mobiprint-web-service/orders/',
      :callback => (url_for :action => :on_get_orders)
    )

    render()
  end

  def on_get_orders
    if @params['status'] != 'ok'
      puts "Failed to get list of orders (#{@params})"
      return
    end

    orders = @params['body']['orders']

    for order in orders
      order_in_db = Order.find(:first, :conditions => {:id => order['id']})

      if order_in_db
        order_in_db.update_attributes(order)
      else
        Order.create(order)
      end
    end

    Configuration.last_orders_list_update = DateTime.now

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