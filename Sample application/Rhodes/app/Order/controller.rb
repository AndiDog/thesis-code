require 'date'
require 'json'
require 'Configuration/configuration'
require 'rho/rhocontroller'
require 'helpers/application_helper'
require 'helpers/picture_scan'
require 'helpers/picture_upload'
require 'helpers/thumbnails'

class OrderController < Rho::RhoController
  include ApplicationHelper
  include PictureScan
  include Thumbnails

  @@previous_location = '-'
  @@location = ''

  def add_pictures
    puts "Last picture scan was #{Time.now.utc - Configuration.last_picture_scan_update} seconds ago"

    Configuration.picture_scan = scanPictures
    Configuration.last_picture_scan_update = Time.now.utc

    render :action => :add_pictures
  end

  def add_pictures_from_folder
    raise "Parameter missing" if @params['directory'].nil?

    directory = @params['directory']
    @folderName = directory.gsub(/^.*[\/\\]/, '')
    @picturesInFolder = []

    if File.directory?(directory)
      Dir.new(directory).entries.each {
        |filename|
        fullFilename = File.join(directory, filename)
        if filename =~ /\.jpg$/i and File.file?(fullFilename)
          @picturesInFolder << fullFilename
        end
      }
    end

    render :action => :add_pictures_from_folder
  end

  def do_submit_order
    puts "Submitting order (#{@params})"

    order_id = nil
    for order in Configuration.orders
      if order['submissionDate'].nil?
        order_id = order['id']
        break
      end
    end

    if not order_id
      raise 'No current order found'
    end

    res = Rho::AsyncHttp.post(
      :url => "http://andidogs.dyndns.org/thesis-mobiprint-web-service/order/#{order_id}/submit/",
      :body => "username=#{Rho::RhoSupport.url_encode(@params['username'])}&password=#{Rho::RhoSupport.url_encode(@params['password'])}&storeId=#{Rho::RhoSupport.url_encode(@params['storeId'])}"
    )
    if res['status'] != 'ok'
      raise "Order submission request failed: #{res}"
    end

    update_orders_list

    Rho::Timer.start(1200, url_for(:action => :switch_to_orders_list), '')
  end

  def switch_to_orders_list
    Rho::NativeTabbar.switch_tab(0)
  end

  def folders
    Configuration.picture_scan
  end

  def orders
    Configuration.orders
  end

  def index
    render
  end

  def location
    @@location
  end

  def location_callback
    if @params['status'] != 'ok'
      if (@@location or '').empty?
        Rho::Timer.start(2000, url_for(:action => :location_changed), '')
      end
      puts 'Failed to get location'
      Rho::Timer.start(15000, url_for(:action => :location_stop_callback), '')
      return
    end
    GeoLocation.turnoff
    @@location = "#{@params['latitude']},#{@params['longitude']}"
    puts "Location found: #{@@location}"

    Rho::Timer.stop(url_for(:action => :location_changed))
    WebView.execute_js("setLocation('#{@@location}')")
    location_changed
  end

  def location_changed
    if @params.has_key?('loc')
      @@location = @params['loc'] or ''
      Rho::Timer.stop(url_for(:action => :location_changed))
      Rho::Timer.start(1000, url_for(:action => :location_changed), '')
      return
    end

    puts "Location change callback (#{@@location})"

    if @@location != @@previous_location
      @@previous_location = @@location

      match = /^(\d+\.\d+),(\d+\.\d+)$/.match(@@location)
      if match
        query_params = "lat=#{Rho::RhoSupport.url_encode(match[1])}&lng=#{Rho::RhoSupport.url_encode(match[2])}"
      else
        loc = @@location or ''
        query_params = "loc=#{Rho::RhoSupport.url_encode(loc)}"
      end

      Rho::AsyncHttp.get(
        :url => "http://andidogs.dyndns.org/thesis-mobiprint-web-service/stores/by-location/?#{query_params}",
        :callback => (url_for :action => :on_get_stores)
      )
    end
  end

  def location_stop_callback
    Rho::Timer.stop(url_for(:action => :location_stop_callback))
    GeoLocation.turnoff
  end

  def on_get_orders
    if @params['status'] != 'ok'
      puts "Failed to get list of orders (#{@params})"
      return
    end

    orders_list = @params['body']['orders']

    Configuration.last_orders_list_update = Time.now.utc

    if orders_list == orders
      puts 'Orders list unchanged'
    else
      puts "Orders list changed from #{orders} to #{orders_list}"
      Configuration.orders = orders_list

      # Reload old orders list tab
      WebView.refresh(0)

      # ...and the current order tab
      WebView.refresh(2)
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

  def on_get_stores
    return if @params['status'] != 'ok'

    puts "Received stores: #{@params}"

    stores = @params['body']['stores']
    WebView.execute_js("showStores(#{JSON.generate(stores)})")
  end

  def on_upload_finished
    filename = @params['filename']

    # Change state to not uploading
    PictureUpload.on_upload_finished(filename)

    if @params['status'] != 'ok'
      puts "Failed to upload picture #{filename}"
      return
    end

    puts "Successfully uploaded picture #{filename}"
  end

  def show
    # Workaround: ID comes as '{5}', for example
    id = @params['id'][1..-2]

    if id == 'current'
      @order = Configuration.orders.find { |o| o['submissionDate'].nil? }
      @uploading_pictures = PictureUpload.uploading_pictures

      if not @order
        @order = {'pictureIds' => [], 'submissionDate' => nil}
      end
    else
      id = id.to_i
      @order = Configuration.orders.find { |o| o['id'] == id }
      @uploading_pictures = nil
    end

    if not @order
      raise "Order #{@params['id']} not found"
    end

    render :action => :show
  end

  def submit_order
    @@previous_location = '-'

    @order = Configuration.orders.find { |o| o['submissionDate'].nil? }

    GeoLocation.set_notification(url_for(:action => :location_callback), nil)

    render :action => :submit_order
  end

  def update_orders_list
    puts "Last order list update was #{Time.now.utc - Configuration.last_orders_list_update} seconds ago"
    puts 'Sending order list query'
    Rho::AsyncHttp.get(
      :url => 'http://andidogs.dyndns.org/thesis-mobiprint-web-service/orders/',
      :callback => (url_for :action => :on_get_orders)
    )
  end

  def upload_pictures
    for key, value in @params
      if key =~ /^checkbox-/ and value == 'on'
        filename = @params["filename-#{key.slice(9..-1)}"]
        puts "Will try to upload #{filename}"
        PictureUpload.upload_picture(filename, url_for(:action => :on_upload_finished))
      end
    end

    Rho::NativeTabbar.switch_tab(2)
    redirect :action => :add_pictures, :query => {:switch_to_current_order => true}
  end
end