#import "settings.h"
#import "ThumbnailDownloadHandler.h"

@implementation ThumbnailDownloadHandler
{
    NSURLConnection *_connection;
    ThumbnailDownloadDelegate* _resultDelegate;
    int _pictureId;
    NSFileHandle *_thumbnailFile;
}

-(void)dealloc
{
    [_thumbnailFile closeFile];
    _thumbnailFile = nil;
    
    _connection = nil;
}

-(id)initWithPictureId:(int)pictureId resultDelegate:(id)resultDelegate
{
    if(self = [super init])
    {
        _pictureId = pictureId;
        _resultDelegate = resultDelegate;
        
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, true);
        if([paths count] == 0)
        {
            NSLog(@"Documents directory not found");
            return nil;
        }

        NSString *docDir = [paths objectAtIndex:0];

        // TODO: build filename
        
        // TODO: open file
    }

    return self;
}

-(void)go
{
    if(_connection)
    {
        @throw [NSException exceptionWithName:@"ProgrammingError" reason:@"Only call go once!" userInfo:nil];
        return;
    }
    
    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@picture/%d/thumbnail/?size=%d", WEB_SERVICE_BASE_URI, _pictureId, 100]]];
    
    _connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];
}

-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse*)response;
    
    // TODO: open file here?!
    
    if([httpResponse statusCode] < 200 || [httpResponse statusCode] >= 300)
    {
        [_resultDelegate thumbnailDownloadError:[NSString stringWithFormat:@"Status code %@", [httpResponse statusCode]]];
        
        return;
    }
}

-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    // TODO: write to file
}

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    NSLog(@"Failed to update old orders");
    
    [_resultDelegate thumbnailDownloadError:@"Connection error"];
}

-(void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    _connection = nil;
    
    NSLog(@"Received thumbnail %d", _pictureId);
    
    
}

@end
