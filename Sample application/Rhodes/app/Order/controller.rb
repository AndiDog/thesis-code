require 'date'
require 'Configuration/configuration'
require 'rho/rhocontroller'
require 'helpers/application_helper'
require 'helpers/thumbnails'

class OrderController < Rho::RhoController
  include ApplicationHelper
  include ERB::Util
  include Thumbnails

  def add_pictures
    @folders = [['file://1/Barcelona', 'Barcelona', 119], ['file://2/Stockholm', 'Stockholm', 387]]
    render :action => :add_pictures
  end

  def add_pictures_from_folder
    raise "Parameter missing" if @params['directory'].nil?

    @folderName = @params['directory'].gsub(/^.*[\/\\]/, '')
    @picturesInFolder = ['/public/images/test-thumbnail.jpg', '/public/images/iui-logo-touch-icon.png', '/public/test/1.jpg', '/public/test/2.jpg']

    render :action => :add_pictures_from_folder
  end

  def orders
    Configuration.orders
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

    render
  end

  def on_get_orders
    if @params['status'] != 'ok'
      puts "Failed to get list of orders (#{@params})"
      return
    end

    orders_list = @params['body']['orders']

    if orders_list == orders
      puts 'Orders list unchanged'
    else
      puts "Orders list changed from #{orders} to #{orders_list}"
      Configuration.last_orders_list_update = DateTime.now
      Configuration.orders = orders_list

      # Reload old orders list tab
      WebView.refresh(0)
    end

    allPictureIds = []
    orders_list.each { |o| allPictureIds += o['pictureIds'] }
    allPictureIds.uniq!
    start_thumbnail_downloads(allPictureIds)

    # TODO: refresh order detail view if it's the current view, handle errors

      #if @params['status'] != 'ok'
    #    @@error_params = @params
    #    WebView.navigate ( url_for :action => :show_error )
    #else
    #    @@get_result = @params['body']
    #    WebView.navigate ( url_for :action => :show_result )
    #end
  end

  def show
    # Workaround: ID comes as '{5}', for example
    @order = Configuration.orders.find { |o| o['id'] == @params['id'][1..-2].to_i }

    if not @order
      raise "Order #{@params['id']} not found"
    end

    render :action => :show
  end
end