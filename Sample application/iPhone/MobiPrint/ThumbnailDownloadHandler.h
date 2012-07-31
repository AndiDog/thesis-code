#import <Foundation/Foundation.h>

@protocol ThumbnailDownloadDelegateProtocol

- (void)thumbnailDownloadError:(NSString*)error;

@end

@interface ThumbnailDownloadDelegate : NSObject<ThumbnailDownloadDelegateProtocol>
@end

@interface ThumbnailDownloadHandler : NSObject

-(id)initWithPictureId:(int)pictureId resultDelegate:(id)resultDelegate;
-(void)go;

@end
