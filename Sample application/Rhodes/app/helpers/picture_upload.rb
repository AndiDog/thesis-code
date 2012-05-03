class PictureUpload
  @@uploading = {}

  def is_uploading?(filename)
    @@uploading.has_key?(filename)
  end
end