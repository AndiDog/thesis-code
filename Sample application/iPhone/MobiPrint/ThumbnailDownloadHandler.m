#import "settings.h"
#import "ThumbnailDownloadHandler.h"

@implementation ThumbnailDownloadHandler
{
    NSURLConnection *_connection;
    NSString *_docDir;
    NSString *_filename;
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

        _docDir = [paths objectAtIndex:0];
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
    
    if([httpResponse statusCode] < 200 || [httpResponse statusCode] >= 300)
    {
        [connection cancel];
        
        [_resultDelegate thumbnailDownloadError:[NSString stringWithFormat:@"Status code %@", [httpResponse statusCode]]];
        
        return;
    }
    
    _filename = [_docDir stringByAppendingFormat:@"/thumbnail-%d.jpg", _pictureId];

    // Make sure file exists
    [[NSFileManager defaultManager] createFileAtPath:_filename contents:nil attributes:nil];
    
    _thumbnailFile = [NSFileHandle fileHandleForWritingAtPath:_filename];
    if(!_thumbnailFile)
    {
        [connection cancel];
        
        [_resultDelegate thumbnailDownloadError:[NSString stringWithFormat:@"Failed to open thumbnail file for writing", [httpResponse statusCode]]];
        NSLog(@"Could not open '%@' for writing", _filename);
        
        return;
    } 
}

-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [_thumbnailFile writeData:data];
}

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    [_thumbnailFile closeFile];
    _thumbnailFile = nil;
    
    NSError *fileError;
    [[NSFileManager defaultManager] removeItemAtPath:_filename error:&fileError];
    
    NSLog(@"Failed to download thumbnail: %@", [error localizedDescription]);
    
    [_resultDelegate thumbnailDownloadError:[NSString stringWithFormat:@"Connection error: %@", [error localizedDescription]]];
}

-(void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    _connection = nil;
    [_thumbnailFile closeFile];
    _thumbnailFile = nil;
    
    NSLog(@"Received thumbnail %d", _pictureId);
    
    [_resultDelegate thumbnailDownloadSuccess:_pictureId];
}

@end
