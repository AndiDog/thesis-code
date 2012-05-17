require 'json'

module Thumbnails
  def on_get_thumbnail
    return if @params['status'] != 'ok'

    # to_i to ensure we actually got the ID
    pictureId = @params['pictureId'].to_i

    expiresHeader = @params['headers']['expires']

    if expiresHeader
      # Parsing of format "Thu, 15 Apr 2010 20:00:00 GMT" works directly with Time.parse
      expires = Time.parse(expiresHeader)
    else
      # One hour by default
      expires = Time.now + 3600
    end

    filename = get_thumbnail_filename(pictureId) + '.json'
    f = File.open(filename, 'wb')
    begin
      f.write(JSON.generate({:expires => expires}))
    ensure
      f.close()
    end

    for order in Configuration.orders
      if order['submissionDate']
        if WebView.current_location(0) =~ /\{#{pictureId}\}/
          puts "Thumbnail #{pictureId} downloaded - refreshing order detail view of order #{order['id']} (location=#{WebView.current_location(0)})"
          WebView.refresh(0)
        end
      else
        if order['pictureIds'].member?(pictureId)
          puts 'Thumbnail #{pictureId} downloaded - refreshing order detail view of current order'
          WebView.refresh(2)
        end
      end
    end
  end

  def get_thumbnail_filename(pictureId, fallback_if_not_exists=false)
    filename = File.join(Rho::RhoApplication::get_app_path('db'), "#{pictureId}.jpg")

    if fallback_if_not_exists and not File.exists?(filename)
      '/public/images/test-thumbnail.jpg'
    else
      filename
    end
  end

  def start_thumbnail_downloads(allPictureIds)
    for pictureId in allPictureIds
      filename = get_thumbnail_filename(pictureId)
      infoFilename = filename + '.json'

      if File.exists?(infoFilename)
        f = File.open(infoFilename, 'rb')
        begin
          content = f.read()
        ensure
          f.close()
        end

        info = Rho::JSON.parse(content)

        if Time.parse(info['expires']) > Time.now
          puts "Cache hit for thumbnail #{pictureId}"
          next
        end

        File.delete(filename) if File.exists?(filename)
        File.delete(infoFilename)
      end

      puts "Reloading thumbnail #{pictureId} (cache miss)"

      requested_size = System.get_property('screen_width')
      if requested_size <= 5
        requested_size = 120
      elsif requested_size >= 500
        requested_size = 500
      end

      Rho::AsyncHttp.download_file(
        :url => "http://andidogs.dyndns.org/thesis-mobiprint-web-service/picture/#{pictureId}/thumbnail/?size=#{requested_size}",
        :filename => filename,
        :callback => (url_for :action => :on_get_thumbnail),
        :callback_param => "pictureId=#{pictureId}"
      )
    end
  end
end