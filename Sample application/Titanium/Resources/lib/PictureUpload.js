function PictureUpload()
{
    if(!(this instanceof PictureUpload))
        return new PictureUpload()

    this.isUploading = function(pictureId)
    {
        for(var i = 0; i < this.uploadingPictureIds.length; ++i)
            if(this.uploadingPictureIds[i] == pictureId)
                return true

        return false
    }

    // Pictures that are currently being uploaded
    this.uploadingPictureIds = [1] // TODO: this is only test data
}

module.exports = new PictureUpload()
