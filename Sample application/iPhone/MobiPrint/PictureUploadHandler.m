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

+ (void)startPictureUpload:(UIImage*)img editingInfo:(NSDictionary*)editingInfo
{
    // TODO: not working yet
    NSData *data = [NSData dataWithContentsOfURL:[editingInfo objectForKey:UIImagePickerControllerReferenceURL]];
    NSLog(@"starting upload of %@ = hash %@", data, [data hash]);
}

@end
