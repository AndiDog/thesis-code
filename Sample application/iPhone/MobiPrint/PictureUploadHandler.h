#import <Foundation/Foundation.h>

@protocol PictureUploadDelegateProtocol

- (void)pictureUploadFinished:(UIImage*)img error:(NSString*)error;

@end

@interface PictureUploadDelegate : NSObject<PictureUploadDelegateProtocol>
@end

@interface PictureUploadHandler : NSObject

+ (NSArray*)getUploadingPictures;

- (id)initWithImage:(UIImage*)img target:(PictureUploadDelegate*)target;

- (void)startPictureUpload;

@end
