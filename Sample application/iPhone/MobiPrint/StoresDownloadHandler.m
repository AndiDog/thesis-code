#import "settings.h"
#import "StoresDownloadHandler.h"
#import "YAJLiOS/YAJL.h"

@implementation StoresDownloadHandler
{
    NSURLConnection *_connection;
    NSString *_location;
    id<StoresDownloadDelegate> _resultDelegate;
    NSMutableData *_webData;
}

- (id)initWithLocation:(NSString*)location resultDelegate:(id<StoresDownloadDelegate>)resultDelegate
{
    self = [super init];

    if(self)
    {
        _location = location;
        _resultDelegate = resultDelegate;
    }

    return self;
}

-(void)dealloc
{
    [_connection cancel];
    _connection = nil;
}

- (void)cancel
{
    [_connection cancel];
}

- (void)go
{
    if(_connection)
    {
        @throw [NSException exceptionWithName:@"ProgrammingError" reason:@"Only call go once!" userInfo:nil];
        return;
    }

    NSString *query;

    NSRegularExpression *re = [NSRegularExpression regularExpressionWithPattern:@"^\\s*(-?\\d+\\.\\d+);(-?\\d+\\.\\d+)\\s*$" options:0 error:nil];
    NSTextCheckingResult *match = [re firstMatchInString:_location options:0 range:NSMakeRange(0, [_location length])];

    if(match)
    {
        NSString *lat = [_location substringWithRange:[match rangeAtIndex:1]];
        NSString *lng = [_location substringWithRange:[match rangeAtIndex:2]];

        query = [NSString stringWithFormat:@"lat=%@&lng=%@",
                 [lat stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding],
                 [lng stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
    }
    else
        query = [NSString stringWithFormat:@"loc=%@", [_location stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];

    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@stores/by-location/?%@", WEB_SERVICE_BASE_URI, query]]];

    _webData = [NSMutableData data];

    _connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];
}

#pragma mark - Connection

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse*)response;
    [_webData setLength: 0];

    if([httpResponse statusCode] < 200 || [httpResponse statusCode] >= 300)
    {
        [_resultDelegate storesRetrieved:nil error:[NSError errorWithDomain:[NSString stringWithFormat:@"Status code %@", [httpResponse statusCode]] code:0 userInfo:nil]];
        return;
    }
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [_webData appendData:data];
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError*)error
{
    NSLog(@"Failed to retrieve stores");

    [_resultDelegate storesRetrieved:nil error:[error localizedDescription]];

}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    _connection = nil;

    NSLog(@"Received stores");

    NSDictionary *json = [_webData yajl_JSON];

    if(!json)
    {
        NSLog(@"JSON could not be parsed");
        [_resultDelegate storesRetrieved:nil error:@"JSON parsing error"];
        return;
    }

    NSLog(@"Got list of stores for location %@", _location);

    NSArray *storesArray = [json valueForKey:@"stores"];
    NSMutableArray *stores = [[NSMutableArray alloc] init];
    int i = 0;
    for(NSDictionary *store in storesArray)
    {
        ++i;

        if(i > 5)
            break;

        NSNumber *storeId = [store valueForKey:@"id"];
        NSString *storeName = [store valueForKey:@"name"];
        NSString *storeAddress = [store valueForKey:@"address"];

        NSDictionary *storeObject = [NSDictionary dictionaryWithObjects:[NSArray arrayWithObjects:storeId, storeName, storeAddress, nil]
                                                                forKeys:[NSArray arrayWithObjects:@"id", @"name", @"address", nil]];

        [stores addObject:storeObject];
    }

    [_resultDelegate storesRetrieved:stores error:nil];
}

@end
