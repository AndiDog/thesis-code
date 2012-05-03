module Thumbnails
  def on_get_thumbnail
    # @params['status'] != 'ok'
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

      Rho::AsyncHttp.download_file(
        :url => "http://andidogs.dyndns.org/thesis-mobiprint-web-service/picture/#{pictureId}/thumbnail/?size=120",
        :filename => filename,
        :callback => (url_for :action => :on_get_thumbnail),
        :callback_param => "pictureId=#{pictureId}"
      )
    end
  end
end