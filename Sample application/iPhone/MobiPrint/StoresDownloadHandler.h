#import <Foundation/Foundation.h>

@protocol StoresDownloadDelegate

- (void)storesRetrieved:(NSArray*)stores error:(NSString*)error;

@end

@interface StoresDownloadHandler : NSObject

- (id)initWithLocation:(NSString*)location resultDelegate:(id<StoresDownloadDelegate>)resultDelegate;
- (void)cancel;
- (void)go;

@end
