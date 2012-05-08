module PictureScan
  def scanPictures
    return [['/sdcard/Muenchen', 2], ['/sdcard/Rage Comics', 47]]

    ret = []

    _scanPictures(ret, '/sdcard', 0)

    puts "SCAN RESULT: #{ret}"

    ret
  end

  private

  def _scanPictures(results, directory, recursionDepth)
    return if recursionDepth >= 3 or not File.directory?(directory)

    resultForThisDir = nil

    for filename in Dir.new(directory).entries
      fullFilename = File.join(directory, filename)

      puts "FULL:"
      puts fullFilename
      if filename =~ /\.jpg$/i and File.file?(fullFilename)
        resultForThisDir ||= [directory, 0]
        resultForThisDir[1] += 1
      elsif not filename =~ /^\./
        _scanPictures(results, fullFilename, recursionDepth + 1)
      end
    end
  end
end