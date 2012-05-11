require 'date'
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

  def folders
    Configuration.picture_scan
  end

  def orders
    Configuration.orders
  end

  def index
    render
  end

  def location_callback
    if @params['status'] != 'ok'
      puts 'Failed to get location'
      return
    end

    puts "LOCATION FOUND #{@params}"
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
    @order = Configuration.orders.find { |o| o['submissionDate'].nil? }

    GeoLocation.set_notification url_for(:action => :location_callback)

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