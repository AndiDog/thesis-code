class PictureUpload
  @@uploading = {}

  def self.is_uploading?(filename)
    @@uploading.has_key?(filename)
  end

  def self.on_upload_finished(filename)
    @@uploading.delete(filename)
  end

  def self.upload_picture(filename, callback)
    return if @@uploading.has_key?(filename)

    @@uploading[filename] = true

    begin
      puts "Starting picture upload of #{filename}"
      Rho::AsyncHttp.upload_file(
        :url => 'http://andidogs.dyndns.org/thesis-mobiprint-web-service/pictures/put-by-post-workaround/',
        :callback => callback,
        :callback_param => "filename=#{Rho::RhoSupport.url_encode(filename)}",
        :multipart => [
        {
          :filename => filename,
          :name => "picture",
          :content_type => "application/octet-stream"
        }]
      )
    rescue
      @@uploading.delete(filename)
      raise
    end
  end

  def self.uploading_pictures
    # Creates a new copy of the keys list
    @@uploading.keys
  end
end