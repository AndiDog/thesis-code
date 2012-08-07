#import "OrderHelper.h"

@implementation OrderHelper

+ (NSDictionary*)orderToDictionary:(NSManagedObject*)order
{
    NSMutableDictionary *d = [[NSMutableDictionary alloc] initWithCapacity:4];

    [d setValue:[order valueForKey:@"id"] forKey:@"id"];
    [d setValue:[order valueForKey:@"submissionDate"] forKey:@"submissionDate"];
    [d setValue:[order valueForKey:@"storeId"] forKey:@"storeId"];
    [d setValue:[order valueForKey:@"pictureIds"] forKey:@"pictureIds"];

    // Return as immutable
    return [NSDictionary dictionaryWithDictionary:d];
}

@end
