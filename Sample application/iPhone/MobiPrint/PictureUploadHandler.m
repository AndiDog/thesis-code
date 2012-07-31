#import "PictureUploadHandler.h"

@implementation PictureUploadHandler

+ (NSArray*)getUploadingPictures
{
    return [PictureUploadHandler uploadingPictures];
}

+ (NSMutableArray*)uploadingPictures
{
    static NSMutableArray* uploadingPictures = nil;

    if(!uploadingPictures)
        uploadingPictures = [[NSMutableArray alloc] init];

    return uploadingPictures;
}

@end
