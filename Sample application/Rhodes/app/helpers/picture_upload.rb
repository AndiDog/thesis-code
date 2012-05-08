require 'net/http'

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
      Thread.new do
        begin
          RestClient.put(
            'http://andidogs.dyndns.org/thesis-mobiprint-web-service/pictures/',
            :picture => filename
          )

          callback.call(filename)
        rescue => e
          puts "Failed to upload picture: #{e.response}"
        ensure
          self.on_upload_finished
        end
      end
=begin
      Rho::AsyncHttp.post(
        :http_command => 'PUT',
        :url => 'http://andidogs.dyndns.org/thesis-mobiprint-web-service/pictures/',
        :callback => callback,
        :multipart => [
        {
          :filename => filename,
          :name => "picture",
          :content_type => "application/octet-stream"
        }]
      )
=end
    rescue
      @@uploading.delete(filename)
      raise
    end
  end
end