#import <Foundation/Foundation.h>

@interface OrderHelper : NSObject

+ (NSDictionary*)orderToDictionary:(NSManagedObject*)order;

@end
