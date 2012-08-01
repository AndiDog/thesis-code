#import <Foundation/Foundation.h>

@interface PictureUploadHandler : NSObject

+ (NSArray*)getUploadingPictures;

+ (void)startPictureUpload:(UIImage*)img editingInfo:(NSDictionary*)editingInfo;

@end
