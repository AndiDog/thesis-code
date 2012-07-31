#import <Foundation/Foundation.h>

@protocol ThumbnailDownloadDelegateProtocol

- (void)thumbnailDownloadError:(NSString*)error;
- (void)thumbnailDownloadSuccess:(int)pictureId;

@end

@interface ThumbnailDownloadDelegate : NSObject<ThumbnailDownloadDelegateProtocol>
@end

@interface ThumbnailDownloadHandler : NSObject

+(NSString*)filenameForPictureId:(int)pictureId;
-(id)initWithPictureId:(int)pictureId resultDelegate:(id)resultDelegate;
-(void)go;

@end
